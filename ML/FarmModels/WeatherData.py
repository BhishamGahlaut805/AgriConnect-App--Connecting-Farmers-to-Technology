import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict

#Modifying to return 3470 entries in the way as :
#2020

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