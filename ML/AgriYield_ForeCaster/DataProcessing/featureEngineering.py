import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import Tuple

class FeatureEngineer:
    def __init__(self, config: dict):
        self.config = config

        # Columns to keep
        self.relevant_columns = [
            'crop', 'season', 'year', 'window_num', 'is_season_end',
            'soil_type', 'soil_pH', 'organic_matter_content',
            'irrigation_type', 'tillage_type', 'sowing_method',
            'fertilizer_type_used', 'seed_variety', 'plant_population_density',
            'avg_temperature_2m_mean', 'avg_temperature_2m_max', 'avg_temperature_2m_min',
            'avg_relative_humidity_2m_mean', 'avg_wind_speed_10m_max',
            'avg_wind_direction_10m_dominant', 'avg_precipitation_sum',
            'avg_shortwave_radiation_sum', 'avg_surface_pressure_mean',
            'avg_cloud_cover_mean',
            'n', 'p', 'k', 'total_npk',
            'area_2025_26', 'area_2024_25', 'area_change_pct',
            'yield'
        ]

        self.numerical_features = [
            'soil_pH', 'organic_matter_content', 'plant_population_density',
            'avg_temperature_2m_mean', 'avg_temperature_2m_max', 'avg_temperature_2m_min',
            'avg_relative_humidity_2m_mean', 'avg_wind_speed_10m_max',
            'avg_wind_direction_10m_dominant', 'avg_precipitation_sum',
            'avg_shortwave_radiation_sum', 'avg_surface_pressure_mean',
            'avg_cloud_cover_mean', 'n', 'p', 'k', 'total_npk',
            'area_2025_26', 'area_2024_25', 'area_change_pct'
        ]

    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, dict]:
        # Select relevant columns
        df = df[self.relevant_columns].copy()

        # Handle missing values
        df = self._handle_missing_values(df)

        # Normalize numerical features
        df, scalers = self._normalize_features(df)

        return df, scalers

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        # Fill numerical features with mean
        for col in self.numerical_features:
            df[col] = df[col].fillna(df[col].mean())

        # Fill categorical (non-numeric) with mode
        for col in df.columns.difference(self.numerical_features + ['yield']):
            if df[col].dtype == object:
                df[col] = df[col].fillna(df[col].mode().iloc[0])

        return df

    def _normalize_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, dict]:
        scalers = {}
        for col in self.numerical_features:
            scaler = MinMaxScaler(feature_range=self.config.get("features", {}).get("scaler_range", (0, 1)))
            df[col] = scaler.fit_transform(df[[col]])
            scalers[col] = scaler
        return df, scalers
