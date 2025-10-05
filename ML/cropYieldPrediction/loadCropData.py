import os
import pandas as pd
import yaml #type: ignore
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import numpy as np

class CropDataLoader:
    def __init__(self, farm_id: str, config_path: Optional[str] = None):
        self.base_path = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports"
        self.farm_id = farm_id
        self.config = self._load_config(config_path)
        self.farm_path = os.path.join(self.base_path, self.farm_id)
        self._validate_farm()
        self.logger = logging.getLogger(__name__)

    def _load_config(self, config_path: Optional[str]) -> Dict:
        default_config = {
            'data': {
                'base_path': self.base_path,
                'required_columns': [
                    'farm_id', 'crop', 'season', 'year', 'window_num',
                    'start_date', 'end_date', 'is_season_end', 'yield'
                ],
                'weather_columns': [
                    'avg_temperature_2m_mean', 'avg_precipitation_sum',
                    'relative_humidity_2m_mean', 'shortwave_radiation_sum'
                ],
                'soil_columns': ['soil_pH', 'organic_matter_content'],
                'management_columns': ['plant_population_density', 'irrigation_type']
            }
        }
        if config_path is None:
            return default_config

        try:
            with open(config_path) as f:
                config = yaml.safe_load(f) or {}
            return {**default_config, **config}
        except Exception as e:
            self.logger.warning(f"Using default config due to error: {str(e)}")
            return default_config

    def _validate_farm(self):
        """Validate farm directory structure"""
        if not os.path.exists(self.farm_path):
            raise FileNotFoundError(f"Farm directory not found: {self.farm_path}")
        if not os.path.exists(os.path.join(self.farm_path, "crops")):
            raise FileNotFoundError(f"'crops' directory missing in farm directory")

    def load_crop_data(self, crop_name: str) -> pd.DataFrame:
        """Load and validate crop time-series data"""
        normalized_crop = crop_name.lower().replace(" ", "_")
        file_path = os.path.join(self.farm_path, "crops", normalized_crop, f"{normalized_crop}.csv")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Crop data file not found: {file_path}")

        try:
            # Load and validate data
            df = pd.read_csv(file_path, parse_dates=['start_date', 'end_date'])
            df = self._validate_data(df, crop_name)

            # Add farm_id if missing
            if 'farm_id' not in df.columns:
                df['farm_id'] = self.farm_id

            # Standardize column names
            df = self._standardize_columns(df)

            # Calculate derived features
            # df = self._calculate_features(df)

            # Sort by time
            df = df.sort_values(['farm_id', 'crop', 'season', 'year', 'window_num'])

            return df

        except Exception as e:
            self.logger.error(f"Error loading crop data: {str(e)}", exc_info=True)
            raise

    def _validate_data(self, df: pd.DataFrame, crop_name: str) -> pd.DataFrame:
        """Validate data structure and required columns"""
        required_cols = self.config['data']['required_columns']
        missing_cols = [col for col in required_cols if col not in df.columns]

        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")

        # Filter for specific crop
        df = df[df['crop'].str.lower() == crop_name.lower()]
        if df.empty:
            raise ValueError(f"No data found for crop: {crop_name}")

        # Validate time sequence within each season
        for (farm_id, crop, season, year), group in df.groupby(['farm_id', 'crop', 'season', 'year']):
            # Check if window numbers are complete and sequential within each season
            unique_windows = sorted(group['window_num'].unique())
            expected_windows = list(range(1, len(unique_windows) + 1))

            if unique_windows != expected_windows:
                raise ValueError(
                    f"Window numbers must be sequential within each season. "
                    f"Found {unique_windows}, expected {expected_windows} for "
                    f"farm_id={farm_id}, crop={crop}, season={season}, year={year}"
                )

            # Check if dates are in order
            # if not group['start_date'].is_monotonic_increasing:
            #     raise ValueError(
            #         f"Start dates must be in chronological order for "
            #         f"farm_id={farm_id}, crop={crop}, season={season}, year={year}"
            #     )

        return df

    def _standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names and drop unnecessary ones"""
        column_mapping = {
            # 'avg_temperature_2m_mean': 'temperature_2m_mean',
            # 'avg_precipitation_sum': 'precipitation_sum',
            # Add other mappings as needed
        }
        df = df.rename(columns=column_mapping)

        # Keep only relevant columns
        keep_cols = (
            self.config['data']['required_columns'] +
            self.config['data']['weather_columns'] +
            self.config['data']['soil_columns'] +
            self.config['data']['management_columns']
        )
        return df[[col for col in keep_cols if col in df.columns]]

    def _calculate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate derived features for time-series analysis"""
        # Growing Degree Days (GDD)
        df.columns = df.columns.str.strip()
        base_temp = 10
        df['gdd'] = (
            df.groupby(['farm_id', 'crop', 'season', 'year'])['avg_temperature_2m_mean']
            .transform(lambda x: (x - base_temp).clip(lower=0).cumsum())
        )

        # Rolling weather features
        for window in [7, 14, 30]:
            df[f'temp_{window}d_avg'] = (
                df.groupby(['farm_id', 'crop', 'season', 'year'])['avg_temperature_2m_mean']
                .transform(lambda x: x.rolling(window, min_periods=1).mean())
            )
            df[f'precip_{window}d_sum'] = (
                df.groupby(['farm_id', 'crop', 'season', 'year'])['avg_precipitation_sum']
                .transform(lambda x: x.rolling(window, min_periods=1).sum())
            )

        # Growth stage (0-1)
        df['growth_stage'] = (
            df.groupby(['farm_id', 'crop', 'season', 'year'])['window_num']
            .transform(lambda x: x / x.max())
        )

        return df


    def get_seasonal_data(self, df: pd.DataFrame) -> Tuple[List[np.ndarray], List[float], List[Dict]]:
        """Prepare time-series sequences for model training"""
        sequences = []
        targets = []
        metadata = []

        # Convert categorical columns to numerical values
        categorical_cols = self.config['data'].get('categorical_columns', [])
        for col in categorical_cols:
            if col in df.columns:
                df[col] = df[col].astype('category').cat.codes

        for (farm_id, crop, season, year), group in df.groupby(['farm_id', 'crop', 'season', 'year']):
            # Only use complete seasons with yield data
            if not group['is_season_end'].any():
                continue

            final_yield = group.loc[group['is_season_end'], 'yield'].values[0]
            if pd.isna(final_yield):
                continue

            # Get all available features (excluding metadata and target)
            features = [
                col for col in df.columns
                if col not in ['farm_id', 'crop', 'season', 'year', 'window_num',
                              'start_date', 'end_date', 'is_season_end', 'yield']
                and col in group.columns
            ]

            # Ensure all feature columns are numerical
            group_features = group[features].select_dtypes(include=[np.number])

            # Create sequences of increasing length
            for i in range(1, len(group)+1):
                current_seq = group_features.iloc[:i].values.astype(np.float32)
                sequences.append(current_seq)
                targets.append(float(final_yield))
                metadata.append({
                    'farm_id': farm_id,
                    'crop': crop,
                    'season': season,
                    'year': year,
                    'length': i,
                    'total_windows': len(group),
                    'start_date': group.iloc[0]['start_date'].isoformat(),
                    'end_date': group.iloc[i-1]['end_date'].isoformat()
                })

        return sequences, targets, metadata