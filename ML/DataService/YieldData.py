import os
import pandas as pd
from datetime import datetime, timedelta
from geopy.geocoders import Nominatim
from ..API.OpenMeteoAPI import WeatherDataProcessor


class AgriDatasetGenerator:
    SEASON_DATE_RANGES = {
        "rabi": ((11, 15), (4, 15)),
        "kharif": ((6, 15), (11, 15)),
        "summer": ((5, 15), (10, 15)),
    }
    WINDOW_SIZE_DAYS = 15

    def __init__(self, farm_id, farm_name, latitude, longitude, static_features=None):
        self.farm_id = farm_id.lower().replace(" ", "_")
        self.latitude = latitude
        self.longitude = longitude
        self.farm_name = farm_name.lower().replace(" ", "_")
        self.area_sown_data = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\DataSets\All-India_-Progressive-Crop-Area-Sown-Report---Kharif-Weekly-area-coverage-as-on-2025-08-01.csv"
        # Default static features if not provided
        default_static = {
            'soil_type': 'loamy',
            'soil_pH': 6.5,
            'organic_matter_content': 2.0,
            'irrigation_type': 'rain-fed',
            'tillage_type': 'conventional',
            'sowing_method': 'drilling',
            'fertilizer_type_used': 'NPK blend',
            'seed_variety': 'high-yielding',
            'plant_population_density': 50000
        }

        # Merge provided static features with defaults
        self.static_features = {**default_static, **(static_features or {})}

        self.yield_csv_path = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\DataSets\DES-District-Data-For-2023-24.csv"
        self.geolocator = Nominatim(user_agent="agri-yield-gen")
        self.state = self.reverse_geocode_state(latitude, longitude).lower()
        print(f"[info] detected state: {self.state}")

        self.df_all = self.load_and_filter_yield_data(self.yield_csv_path)
        self.npk_features = self.load_static_features()  # Renamed from static_features

        # Load area sown data if provided
        self.area_sown_data = self.load_area_sown_data(self.area_sown_data) if self.area_sown_data else None
        if self.area_sown_data is not None:
            print("[info] successfully loaded area sown data")

        self.weather_processor = WeatherDataProcessor(latitude, longitude, farm_id, farm_name)
        self.weather_df = self.weather_processor.fetch_and_process_weather_data()
        self.weather_df['date'] = pd.to_datetime(self.weather_df['date'])
        self.weather_df.set_index("date", inplace=True)

    def reverse_geocode_state(self, lat, lon):
        try:
            location = self.geolocator.reverse((lat, lon), language="en", exactly_one=True)
            return location.raw.get("address", {}).get("state", "unknown").lower()
        except Exception as e:
            print("[error] reverse geocoding failed:", e)
            return "unknown"

    def load_static_features(self):
        npk_df = pd.read_csv(r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\DataSets\NPKData.csv")
        npk_df.columns = [col.strip().lower() for col in npk_df.columns]
        npk_df["state"] = npk_df["state"].str.strip().str.lower()
        return npk_df.rename(columns={
            "n (kg/ha)": "n",
            "p2o5 (kg/ha)": "p",
            "k2o (kg/ha)": "k",
            "total (kg/ha)": "total_npk"
        })[["state", "n", "p", "k", "total_npk"]]

    def load_and_filter_yield_data(self, csv_path):
        df = pd.read_csv(csv_path)

        # Clean column names
        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_")
            .str.replace("-", "_")
            .str.replace("(", "")
            .str.replace(")", "")
            .str.replace("/", "_")
        )

        # DEBUG: check columns after cleanup
        print("[DEBUG] Cleaned column names:", df.columns.tolist())

        # Now this rename will work
        df.rename(columns={
            "state": "state",
            "district": "district_name",
            "crop": "crop_name",
            "Season": "season",
            "yield_2023_24kg_hectare": "yield"  # this now matches the cleaned version
        }, inplace=True)

        df["year"] = 2023
        df = df[df["state"].str.lower() == self.state.lower()]

        return df

    def get_season_date_range(self, year, season):
        season = season.lower()
        start_tuple, end_tuple = self.SEASON_DATE_RANGES.get(season, ((6, 15), (11, 15)))
        start_date = datetime(year, start_tuple[0], start_tuple[1])
        end_year = year + 1 if end_tuple[0] < start_tuple[0] else year
        end_date = datetime(end_year, end_tuple[0], end_tuple[1])
        return start_date, end_date

    def get_area_sown_values(self, crop):
        """Get area sown values for a crop with fallback to mean values"""
        if self.area_sown_data is None:
            return None, None, None

        crop_data = self.area_sown_data.get(crop.lower())
        if crop_data:
            return (
                crop_data["area_2025_26"],
                crop_data["area_2024_25"],
                crop_data["area_change_pct"]
            )
        else:
            # Fallback to mean values if crop not found
            mean_data = self.area_sown_data["_mean_values"]
            return (
                mean_data["area_2025_26"],
                mean_data["area_2024_25"],
                mean_data["area_change_pct"]
            )
    def generate_10_day_windows(self, season_df, crop, season, year, district):
        """Generate aggregated window data with all features"""
        windows = []
        num_windows = len(season_df) // self.WINDOW_SIZE_DAYS

        for window_num in range(num_windows):
            start_idx = window_num * self.WINDOW_SIZE_DAYS
            end_idx = start_idx + self.WINDOW_SIZE_DAYS

            # For last window, include remaining days
            if window_num == num_windows - 1:
                end_idx = len(season_df)

            window_df = season_df.iloc[start_idx:end_idx]

            # Create base row with all static features
            row = {
                "farm_id": self.farm_id,
                "state": self.state,
                "district": district,
                "latitude": self.latitude,
                "longitude": self.longitude,
                "crop": crop,
                "season": season,
                "year": year,
                "window_num": window_num + 1,
                "start_date": window_df.index[0].strftime("%Y-%m-%d"),
                "end_date": window_df.index[-1].strftime("%Y-%m-%d"),
                "is_season_end": (end_idx == len(season_df)),
                # Add all static features
                **self.static_features
            }

            # Add weather averages
            numeric_cols = window_df.select_dtypes(include='number').columns
            for col in numeric_cols:
                if col != "yield":  # Handle yield separately
                    row[f"avg_{col}"] = round(window_df[col].mean(), 2)

            # Add yield only at season end
            row["yield"] = window_df["yield"].iloc[-1] if row["is_season_end"] else None

            # Add NPK values
            static_row = self.npk_features[self.npk_features["state"] == self.state]
            if not static_row.empty:
                static_row = static_row.iloc[0]
                row.update({
                    "n": static_row["n"],
                    "p": static_row["p"],
                    "k": static_row["k"],
                    "total_npk": static_row["total_npk"]
                })

            # Add area sown data if available
            if self.area_sown_data is not None:
                area_2025, area_2024, area_pct = self.get_area_sown_values(crop)
                row.update({
                    "area_2025_26": area_2025,
                    "area_2024_25": area_2024,
                    "area_change_pct": area_pct
                })

            windows.append(row)

        return windows
    def load_area_sown_data(self, csv_path):
        """Load and process area sown data with robust error handling"""
        try:
            df = pd.read_csv(csv_path)

            # Clean column names
            df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

            # Required columns
            required_cols = ["crop", "area_sown-2025-26", "area_sown-2024-25",
                            "difference_in_area_coverage_over-2024-25",
                            "%_of_increase_(+)/decrease_(-)_over_-2024-25"]

            # Check if all required columns exist
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                print(f"[warning] missing columns in area sown data: {missing_cols}")
                return None

            # Calculate mean values for fallback
            mean_2025 = df["area_sown-2025-26"].mean()
            mean_2024 = df["area_sown-2024-25"].mean()
            mean_pct = df["%_of_increase_(+)/decrease_(-)_over_-2024-25"].mean()

            # Create crop mapping
            crop_mapping = {
                "rice": "rice",
                "total_pulses": "total_pulses",
                "tur": "tur",
                "urad": "urad",
                "moong": "moong",
                "other_pulses": "other_pulses",
                "jowar": "jowar",
                "bajra": "bajra",
                "ragi": "ragi",
                "other_small_millets": "small_millets",
                "total_coarse_cereals": "nutri/coarse_cereals"
            }

            area_data = {}
            for _, row in df.iterrows():
                crop = row["crop"].strip().lower()
                mapped_crop = crop_mapping.get(crop)

                if not mapped_crop:
                    continue

                area_data[mapped_crop] = {
                    "area_2025_26": float(row["area_sown-2025-26"]),
                    "area_2024_25": float(row["area_sown-2024-25"]),
                    "area_change_pct": float(row["%_of_increase_(+)/decrease_(-)_over_-2024-25"])
                }

            # Add mean values for reference
            area_data["_mean_values"] = {
                "area_2025_26": mean_2025,
                "area_2024_25": mean_2024,
                "area_change_pct": mean_pct
            }

            return area_data

        except Exception as e:
            print(f"[error] failed to load area sown data: {e}")
            return None

    def generate(self):
        cropwise_data = {}
        weather_df = self.weather_df.copy()

        allowed_crops = {
            'rice', 'cereals', 'total food grains', 'maize', 'nutri/coarse cereals',
            'tur', 'urad', 'moong', 'total pulses', 'jowar', 'bajra', 'ragi',
            'small millets', 'other pulses', 'gram', 'lentil', 'wheat', 'barley'
        }

        for _, row in self.df_all.iterrows():
            crop = row["crop_name"].strip().lower()
            season = row["season"].strip().lower()
            year = int(row["year"])
            yield_val = row["yield"]
            district = row["district_name"].strip().lower()

            if crop not in allowed_crops:
                print(f"[skip] crop '{crop}' not in allowed crop list.")
                continue

            if season not in self.SEASON_DATE_RANGES:
                print(f"[skip] season '{season}' not supported.")
                continue

            start_date, end_date = self.get_season_date_range(year, season)
            season_weather = weather_df.loc[(weather_df.index >= start_date) & (weather_df.index <= end_date)].copy()

            # Add yield only at season end
            season_weather["yield"] = None
            if not season_weather.empty:
                season_weather.iloc[-1, season_weather.columns.get_loc("yield")] = yield_val

            if season_weather.empty:
                print(f"[warn] no weather data for {crop} ({season}, {year})")
                continue

            # Generate 10-day windows for this crop season
            windows = self.generate_10_day_windows(season_weather, crop, season, year, district)
            cropwise_data.setdefault(crop, []).extend(windows)

        base_dir = os.path.join(
            r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports",
            self.farm_name,
            "crops"
        )

        total_rows = 0
        for crop, records in cropwise_data.items():
            crop_df = pd.DataFrame(records)

            # Ensure proper directory naming
            crop_dir_name = crop.replace("/", "_").replace(" ", "_")
            crop_subdir = os.path.join(base_dir, crop_dir_name)
            os.makedirs(crop_subdir, exist_ok=True)

            crop_file = os.path.join(crop_subdir, f"{crop_dir_name}.csv")
            crop_df.to_csv(crop_file, index=False)
            total_rows += len(crop_df)
            print(f"[✓] saved {len(crop_df)} rows for crop: {crop} -> {crop_file}")

        if total_rows == 0:
            print("[error] no data generated for any crop.")
        else:
            print(f"[info] total records saved across crops: {total_rows}")

        return cropwise_data