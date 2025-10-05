import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict


class WeatherDataProcessor:
    def __init__(self, latitude: float, longitude: float, farm_id: str,farm_name:str):
        self.latitude = latitude
        self.longitude = longitude
        self.farm_id = farm_id
        self.farm_name=farm_name
        self.timezone = "auto"

        base_dir = rf"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports\{self.farm_name}"
        os.makedirs(base_dir, exist_ok=True)
        self.save_folder = base_dir
        self.log_file = os.path.join(base_dir, "log.txt")

        self.nasa_file = os.path.join(base_dir, "NASA_dataset.csv")
        self.final_weather_file = os.path.join(base_dir, "weather_Yield.csv")


        # API URLs
        self.nasa_power_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        self.openmeteo_url = "https://api.open-meteo.com/v1/forecast"

        self.column_mappings = {
            "T2M": "temperature_2m_mean",
            "T2M_MAX": "temperature_2m_max",
            "T2M_MIN": "temperature_2m_min",
            "RH2M": "relative_humidity_2m_mean",
            "WS2M": "wind_speed_10m_max",
            "WD2M": "wind_direction_10m_dominant",
            "PRECTOTCORR": "precipitation_sum",
            "ALLSKY_SFC_SW_DWN": "shortwave_radiation_sum",
            "PS": "surface_pressure_mean",
            "CLOUD_AMT": "cloud_cover_mean",
        }

        self.common_columns = [
            'date', 'temperature_2m_mean', 'temperature_2m_max', 'temperature_2m_min',
            'relative_humidity_2m_mean', 'wind_speed_10m_max', 'wind_direction_10m_dominant',
            'precipitation_sum', 'shortwave_radiation_sum', 'surface_pressure_mean',
            'cloud_cover_mean', 'data_source'
        ]

    def process_nasa_power_data(self, raw_data: Dict) -> pd.DataFrame:
        if not raw_data or "properties" not in raw_data:
            return pd.DataFrame()

        parameters = raw_data["properties"]["parameter"]
        dfs = []
        for param, values in parameters.items():
            if param in self.column_mappings:
                df = pd.DataFrame.from_dict(values, orient='index', columns=[param])
                dfs.append(df)

        if not dfs:
            return pd.DataFrame()

        nasa_df = pd.concat(dfs, axis=1)
        nasa_df.index = pd.to_datetime(nasa_df.index)
        nasa_df.index.name = 'date'
        nasa_df.rename(columns=self.column_mappings, inplace=True)
        nasa_df['data_source'] = 'NASA_POWER'
        return nasa_df.reset_index()

    def process_openmeteo_data(self, raw_data: Dict, data_type: str) -> pd.DataFrame:
        if not raw_data or "daily" not in raw_data:
            return pd.DataFrame()

        daily_data = raw_data["daily"]
        om_df = pd.DataFrame({
            'date': pd.to_datetime(daily_data.get('time', [])),
            'temperature_2m_max': daily_data.get('temperature_2m_max', []),
            'temperature_2m_min': daily_data.get('temperature_2m_min', []),
            'temperature_2m_mean': daily_data.get('temperature_2m_mean', []),
            'relative_humidity_2m_mean': daily_data.get('relative_humidity_2m_mean', []),
            'wind_speed_10m_max': daily_data.get('wind_speed_10m_max', []),
            'wind_direction_10m_dominant': daily_data.get('wind_direction_10m_dominant', []),
            'precipitation_sum': daily_data.get('precipitation_sum', []),
            'shortwave_radiation_sum': daily_data.get('shortwave_radiation_sum', []),
            'surface_pressure_mean': daily_data.get('surface_pressure_mean', []),
            'cloud_cover_mean': daily_data.get('cloud_cover_mean', [])
        })
        om_df['data_source'] = f'OpenMeteo_{data_type}'
        return om_df

    def unify_dataframes(self, nasa_df, om_hist_df, om_fcst_df):
        combined_df = pd.concat([nasa_df, om_hist_df, om_fcst_df], ignore_index=True)
        for col in self.common_columns:
            if col not in combined_df.columns and col != 'date':
                combined_df[col] = None
        combined_df = combined_df[self.common_columns]
        combined_df.drop_duplicates(subset=['date'], keep='last', inplace=True)
        combined_df.sort_values('date', inplace=True)
        return combined_df

    def fetch_and_process_weather_data(self) -> pd.DataFrame:
        today = datetime.now().date()

        # Define start and end dates for 2023-2025 range
        start_date = datetime(2023, 1, 1).date()
        end_date = today

        # Fetch NASA POWER data
        print("🔄 Fetching NASA POWER data...")
        try:
            nasa_params = {
                "start": start_date.strftime("%Y%m%d"),
                "end": (end_date - timedelta(days=1)).strftime("%Y%m%d"),
                "latitude": self.latitude,
                "longitude": self.longitude,
                "parameters": ",".join(self.column_mappings.keys()),
                "format": "JSON",
                "community": "AG"
            }
            response = requests.get(self.nasa_power_url, params=nasa_params).json()
            nasa_df = self.process_nasa_power_data(response)
            nasa_df.to_csv(self.nasa_file, index=False)
            print(f"[✓] NASA data saved: {self.nasa_file}")
        except Exception as e:
            print(f"[❌] Error fetching NASA data: {e}")
            nasa_df = pd.DataFrame()

        # Fetch Open-Meteo Historical (last 60 days from today but not before 2023)
        try:
            print("🌐 Fetching Open-Meteo historical data...")
            om_hist_start = max(start_date, today - timedelta(days=60))
            om_hist_end = today - timedelta(days=1)

            om_hist_params = {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "start_date": om_hist_start.strftime("%Y-%m-%d"),
                "end_date": om_hist_end.strftime("%Y-%m-%d"),
                "daily": ",".join([
                    "temperature_2m_max", "temperature_2m_min", "temperature_2m_mean",
                    "relative_humidity_2m_mean", "wind_speed_10m_max",
                    "wind_direction_10m_dominant", "precipitation_sum",
                    "shortwave_radiation_sum", "surface_pressure_mean",
                    "cloud_cover_mean"
                ]),
                "timezone": self.timezone
            }
            hist_response = requests.get(self.openmeteo_url, params=om_hist_params).json()
            om_hist_df = self.process_openmeteo_data(hist_response, "Historical")
        except Exception as e:
            print(f"[❌] Error fetching Open-Meteo historical: {e}")
            om_hist_df = pd.DataFrame()

        # Fetch Open-Meteo Forecast
        try:
            print("📡 Fetching Open-Meteo forecast data...")
            om_fcst_params = {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "start_date": today.strftime("%Y-%m-%d"),
                "end_date": (today + timedelta(days=13)).strftime("%Y-%m-%d"),
                "daily": ",".join([
                    "temperature_2m_max", "temperature_2m_min", "temperature_2m_mean",
                    "relative_humidity_2m_mean", "wind_speed_10m_max",
                    "wind_direction_10m_dominant", "precipitation_sum",
                    "shortwave_radiation_sum", "surface_pressure_mean",
                    "cloud_cover_mean"
                ]),
                "timezone": self.timezone
            }
            fcst_response = requests.get(self.openmeteo_url, params=om_fcst_params).json()
            om_fcst_df = self.process_openmeteo_data(fcst_response, "Forecast")
        except Exception as e:
            print(f"[❌] Error fetching Open-Meteo forecast: {e}")
            om_fcst_df = pd.DataFrame()

        # Combine & Filter final dataframe
        final_df = self.unify_dataframes(nasa_df, om_hist_df, om_fcst_df)
        final_df['date'] = pd.to_datetime(final_df['date'])
        final_df = final_df[(final_df['date'].dt.year >= 2023)]

        final_df.to_csv(self.final_weather_file, index=False)
        print(f"[✓] Final weather data saved: {self.final_weather_file}")
        return final_df


    def log(self, message: str):
        with open(self.log_file, 'a') as f:
            f.write(f"[{datetime.now()}] {message}\n")
        print(message)

