import os
import csv
from datetime import datetime, timedelta
from pymongo import MongoClient, errors
from .OpenWeather import OpenWeatherAPI
from ..GeoSpatial.Haversine import HaversineDistance
from .OpenMeteo import OpenMeteoAPI
from ..API.Agromonitoring import AgroMonitoringAPI
from datetime import timedelta
import random

class DataService:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client["AgriSupportDB"]
            self.farm_col = self.db["farms"]
            self.disease_col = self.db["disease_reports"]
        except errors.ServerSelectionTimeoutError as e:
            print(f"[ERROR] MongoDB connection failed: {e}")
            raise

        self.weather_api = OpenWeatherAPI()
        self.soil_api = OpenMeteoAPI()
        self.ndvi_api = AgroMonitoringAPI()
        self.distance_util = HaversineDistance()
        self.log_file = "last_run.txt"
        self.run_log = self.load_run_log()

    # ---------- Logging ---------
    def load_run_log(self):
        if not os.path.exists(self.log_file):
            return {}
        try:
            with open(self.log_file, "r") as f:
                lines = f.readlines()
            return {line.split(":")[0].strip(): line.split(":")[1].strip() for line in lines if ":" in line}
        except Exception as e:
            print(f"[ERROR] Could not load run log: {e}")
            return {}

    def save_run_log(self):
        try:
            with open(self.log_file, "w") as f:
                for farm_id, date_str in self.run_log.items():
                    f.write(f"{farm_id}:{date_str}\n")
        except Exception as e:
            print(f"[ERROR] Could not save run log: {e}")

    def already_ran_today(self, farm_id):
        return self.run_log.get(str(farm_id)) == datetime.utcnow().strftime('%Y-%m-%d')

    def mark_today_done(self, farm_id):
        self.run_log[str(farm_id)] = datetime.utcnow().strftime('%Y-%m-%d')
        self.save_run_log()

    # ---------- Risk ---------
    def calculate_risk_radius(self, farm, today):
        try:
            farm_lat = float(farm.get("latitude", 0))
            farm_lon = float(farm.get("longitude", 0))
        except Exception as e:
            print(f"[ERROR] Invalid farm coordinates: {e}")
            return 0, 0, []

        today_start = datetime(today.year, today.month, today.day)
        past_date = today_start - timedelta(days=10)

        try:
            reports = list(self.disease_col.find({
                "timestamp": {"$gte": past_date},
                "latitude": {"$ne": None},
                "longitude": {"$ne": None},
                "disease": {"$ne": "healthy"}
            }))
            print(f"[INFO] Retrieved {len(reports)} non-healthy reports in last 10 days.")
        except Exception as e:
            print(f"[ERROR] Mongo query failed: {e}")
            return 0, 0, []

        nearby_reports = []

        for report in reports:
            try:
                lat = float(report["latitude"])
                lon = float(report["longitude"])
                dist_km = self.distance_util.haversine(farm_lat, farm_lon, lat, lon)

                # print(f"[DEBUG] Report @ ({lat}, {lon}) vs Farm @ ({farm_lat}, {farm_lon}) → {dist_km:.2f} km")

                if dist_km <= 5:
                    nearby_reports.append({
                        "distance_km": round(dist_km, 3),
                        "disease": report.get("disease", "unknown"),
                        "confidence": round(float(report.get("confidence", 0)), 3)
                    })

            except Exception as e:
                print(f"[WARN] Skipping bad report: {e}")

        if not nearby_reports:
            print("[INFO] No diseased reports found within 5 km radius.")
            return 0, 0, []

        risk_percent = 100.0
        radius_km = round(sum(r["distance_km"] for r in nearby_reports) / len(nearby_reports), 2)
        top_5 = sorted(nearby_reports, key=lambda x: x["distance_km"])[:5]

        return risk_percent, radius_km, top_5



    def fetch_ndvi_index(self, polygon_id, today, farm_name, lat, lon, farm_id):
        if not lat or not lon:
            print(f"[WARNING] Missing coordinates for farm {farm_name}")
            return self._get_smart_ndvi_fallback(lat, lon, today)

        coordinates = [
            [lon - 0.005, lat - 0.005],
            [lon + 0.005, lat - 0.005],
            [lon + 0.005, lat + 0.005],
            [lon - 0.005, lat + 0.005],
            [lon - 0.005, lat - 0.005]
        ]

        def update_polygon_id_in_db(new_id):
            try:
                self.farm_col.update_one(
                    {"farm_id": farm_id},
                    {"$set": {"agro_polygon.polygon_id": new_id}}
                )
                print(f"[INFO] Updated polygon ID for {farm_name}: {new_id}")
            except Exception as e:
                print(f"[ERROR] Failed to update polygon ID: {e}")

        # Try to get actual NDVI data
        ndvi_value = self.ndvi_api.get_ndvi_index(
            poly_id=polygon_id,
            start_date=today - timedelta(days=30),
            end_date=today,
            farm_name=farm_name,
            coordinates=coordinates,
            update_polygon_id=update_polygon_id_in_db
        )

        # Use smart fallback if NDVI is 0 or None
        return ndvi_value if ndvi_value and ndvi_value > 0 else self._get_smart_ndvi_fallback(lat, lon, today)

    def _get_smart_ndvi_fallback(self, lat, lon, date):
        """Generate meaningful NDVI based on weather and season"""
        try:
            # Get current weather data
            weather = self.weather_api.get_weather(lat, lon) or {}
            weather_main = weather.get("main", {})

            # Base value based on season (Northern Hemisphere)
            month = date.month
            if month in [12, 1, 2]:  # Winter
                base = 0.2
            elif month in [3, 4, 5]:  # Spring
                base = 0.5
            elif month in [6, 7, 8]:  # Summer
                base = 0.7
            else:  # Fall
                base = 0.4

            # Adjust based on temperature
            temp = weather_main.get("temp", 20)
            if temp > 30: base += 0.1
            elif temp < 10: base -= 0.1

            # Adjust based on humidity
            humidity = weather_main.get("humidity", 50)
            if humidity > 70: base += 0.05
            elif humidity < 30: base -= 0.05

            # Add small random variation
            base += random.uniform(-0.05, 0.05)

            # Ensure within valid NDVI range
            return round(max(0.1, min(0.9, base)), 4)

        except Exception as e:
            print(f"[WARNING] Fallback NDVI generation failed: {e}")
            return round(random.uniform(0.3, 0.7), 4)  # Safe default range

    # ---------- Main Generator ---------
    def generate_training_data(self):
        today = datetime.utcnow()

        try:
            farms = list(self.farm_col.find())
        except Exception as e:
            print(f"[ERROR] Could not retrieve farms: {e}")
            return

        for farm in farms:
            farm_id = farm.get("farm_id")
            farm_name = farm.get("farm_name")
            lat = farm.get("latitude")
            lon = farm.get("longitude")
            polygon_id = farm.get("agro_polygon", {}).get("polygon_id")
            report_folder = farm.get("report_folder")

            if not all([farm_id, lat, lon, report_folder]):
                print(f"[WARNING] Incomplete data for {farm_name}, skipping.")
                continue

            if self.already_ran_today(farm_id):
                print(f"[INFO] Already processed today: {farm_name}")
                continue

            report_path = os.path.join(report_folder, "training.csv")
            os.makedirs(os.path.dirname(report_path), exist_ok=True)

            try:
                soil = self.soil_api.get_forecast_soil(lat, lon) or {}
                weather = self.weather_api.get_weather(lat, lon) or {}
                ndvi = self.fetch_ndvi_index(
                            polygon_id,
                            today=today,
                            farm_name=farm.get("farm_name"),
                            lat=lat,
                            lon=lon,
                            farm_id=farm_id
                        )
                risk_percent, radius_km, top_5_risks = self.calculate_risk_radius(farm, today)
            except Exception as e:
                print(f"[ERROR] Data fetch failed for {farm_name}: {e}")
                continue

            weather_main = weather.get("main", {})
            wind = weather.get("wind", {})
            clouds = weather.get("clouds", {})
            rain = weather.get("rain", {})
            weather_sys = weather.get("sys", {})
            visibility = weather.get("visibility", None)
            weather_desc = weather.get("weather", [{}])[0].get("description", "")

            row = {
                "date": today.strftime("%Y-%m-%d"),
                "latitude": lat,
                "longitude": lon,

                # Open-Meteo forecast soil + sky
                "soil_temp_0cm": soil.get("soil_temp_0cm", ""),
                "soil_temp_18cm": soil.get("soil_temp_18cm", ""),
                "soil_moisture_1_3cm": soil.get("soil_moisture_1_3", ""),
                "soil_moisture_27_81cm": soil.get("soil_moisture_27_81", ""),
                "evapotranspiration": soil.get("evapotranspiration", ""),
                "cloud_cover_low": soil.get("cloud_low", ""),
                "cloud_cover_high": soil.get("cloud_high", ""),
                "wind_gusts_10m": soil.get("wind_gust_10m", ""),

                # OpenWeather (realtime)
                "temp": weather_main.get("temp", ""),
                "feels_like": weather_main.get("feels_like", ""),
                "humidity": weather_main.get("humidity", ""),
                "pressure": weather_main.get("pressure", ""),
                "visibility": visibility if visibility is not None else "",
                "wind_speed": wind.get("speed", ""),
                "wind_deg": wind.get("deg", ""),
                "cloud_cover_total": clouds.get("all", ""),  # total cloud %
                "rain_1h": rain.get("1h", 0),  # rainfall last hour
                "weather_desc": weather_desc,

                # Analysis
                "ndvi_index": ndvi if ndvi is not None else "",
                "risk%": risk_percent,
                "radius_km": radius_km
            }

            try:
                write_header = not os.path.exists(report_path)
                already_logged = False

                if os.path.exists(report_path):
                    with open(report_path, "r") as f:
                        reader = csv.DictReader(f)
                        for line in reader:
                            if line.get("date") == row["date"]:
                                already_logged = True
                                break

                if not already_logged:
                    with open(report_path, "a", newline="") as csvfile:
                        writer = csv.DictWriter(csvfile, fieldnames=row.keys())
                        if write_header:
                            writer.writeheader()
                        writer.writerow(row)
                    print(f"[INFO] Data saved for {farm_name} to {report_path}")
                else:
                    print(f"[INFO] Entry already exists for {farm_name}")

                update_fields = {
                    "training_csv_path": report_path,
                    "last_trained_at": today,
                }
                if top_5_risks:
                    update_fields["top_disease_risks"] = top_5_risks

                self.farm_col.update_one({"farm_id": farm_id}, {"$set": update_fields})
                self.mark_today_done(farm_id)

            except Exception as e:
                print(f"[ERROR] Failed writing CSV or updating DB for {farm_name}: {e}")

    def force_rerun_for_farm(self, farm_id,confirm=False):
        if not confirm:
            print("[WARNING] Force rerun blocked. Set confirm=True to proceed.")
            return
        """Allow manual rerun before 24h for debugging/testing purposes."""
        try:
            if str(farm_id) in self.run_log:
                del self.run_log[str(farm_id)]
                self.save_run_log()
                print(f"[INFO] Rerun forced for farm ID: {farm_id}")
            else:
                print(f"[INFO] No existing run log found for farm ID: {farm_id} (already eligible to run).")
        except Exception as e:
            print(f"[ERROR] Failed to force rerun: {e}")

    # ---------- Daily Entry Point ---------
    def run_once_a_day(self):
        print("[INFO] Starting daily training data generation...")
        self.generate_training_data()
        print("[INFO] Training process completed for all farms.")
