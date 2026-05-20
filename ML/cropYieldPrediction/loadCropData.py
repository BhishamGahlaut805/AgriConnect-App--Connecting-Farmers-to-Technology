import os
import pandas as pd
import yaml  # type: ignore
import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


class CropDataLoader:
    def __init__(self, farm_id: str, config_path: Optional[str] = None):
        self.farm_id = farm_id
        self.logger = logging.getLogger(__name__)

        # ==============================
        # MongoDB Configuration
        # ==============================
        self.mongo_uri = os.getenv(
            "MONGO_URI",
            "mongodb+srv://bhishamgahlaut805_db_user:kwLYqC3wTWvyuJrz@agriconnectcluster.tkwu7gn.mongodb.net/AgriSupportDB?retryWrites=true&w=majority&appName=AgriConnectCluster"
        )

        self.client = MongoClient(self.mongo_uri)
        self.db = self.client["AgriSupportDB"]

        # Collections
        self.crop_data_collection = self.db["crop_training_data"]

        self.config = self._load_config(config_path)

    # =========================================================
    # Load Config
    # =========================================================
    def _load_config(self, config_path: Optional[str]) -> Dict:
        default_config = {
            'data': {
                'required_columns': [
                    'farm_id',
                    'crop',
                    'season',
                    'year',
                    'window_num',
                    'start_date',
                    'end_date',
                    'is_season_end',
                    'yield'
                ],

                'weather_columns': [
                    'avg_temperature_2m_mean',
                    'avg_precipitation_sum',
                    'relative_humidity_2m_mean',
                    'shortwave_radiation_sum'
                ],

                'soil_columns': [
                    'soil_pH',
                    'organic_matter_content'
                ],

                'management_columns': [
                    'plant_population_density',
                    'irrigation_type'
                ],

                'categorical_columns': [
                    'irrigation_type'
                ]
            }
        }

        if config_path is None:
            return default_config

        try:
            with open(config_path) as f:
                config = yaml.safe_load(f) or {}

            return {**default_config, **config}

        except Exception as e:
            self.logger.warning(
                f"Using default config due to error: {str(e)}"
            )
            return default_config

    # =========================================================
    # Validate Farm
    # =========================================================
    def _validate_farm(self):
        count = self.crop_data_collection.count_documents({
            "farm_id": self.farm_id
        })

        if count == 0:
            raise FileNotFoundError(
                f"No crop training data found for farm_id={self.farm_id}"
            )

    # =========================================================
    # Load Crop Data From MongoDB
    # =========================================================
    def load_crop_data(self, crop_name: str) -> pd.DataFrame:
        """
        Load crop data from MongoDB instead of local CSV files
        """

        self._validate_farm()

        try:
            records = list(
                self.crop_data_collection.find(
                    {
                        "farm_id": self.farm_id,
                        "crop": {
                            "$regex": f"^{crop_name}$",
                            "$options": "i"
                        }
                    },
                    {"_id": 0}
                )
            )

            if not records:
                raise FileNotFoundError(
                    f"No crop data found for crop={crop_name}"
                )

            df = pd.DataFrame(records)

            # Convert dates
            if 'start_date' in df.columns:
                df['start_date'] = pd.to_datetime(df['start_date'])

            if 'end_date' in df.columns:
                df['end_date'] = pd.to_datetime(df['end_date'])

            # Validate data
            df = self._validate_data(df, crop_name)

            # Add farm_id if missing
            if 'farm_id' not in df.columns:
                df['farm_id'] = self.farm_id

            # Standardize columns
            df = self._standardize_columns(df)

            # Sort data
            df = df.sort_values(
                ['farm_id', 'crop', 'season', 'year', 'window_num']
            )

            self.logger.info(
                f"Loaded {len(df)} records for crop={crop_name}"
            )

            return df

        except Exception as e:
            self.logger.error(
                f"Error loading crop data: {str(e)}",
                exc_info=True
            )
            raise

    # =========================================================
    # Validate Data
    # =========================================================
    def _validate_data(
        self,
        df: pd.DataFrame,
        crop_name: str
    ) -> pd.DataFrame:

        required_cols = self.config['data']['required_columns']

        missing_cols = [
            col for col in required_cols
            if col not in df.columns
        ]

        if missing_cols:
            raise ValueError(
                f"Missing required columns: {missing_cols}"
            )

        # Filter crop
        df = df[
            df['crop'].str.lower() == crop_name.lower()
        ]

        if df.empty:
            raise ValueError(
                f"No data found for crop: {crop_name}"
            )

        # Validate seasonal sequence
        for (
            farm_id,
            crop,
            season,
            year
        ), group in df.groupby(
            ['farm_id', 'crop', 'season', 'year']
        ):

            unique_windows = sorted(
                group['window_num'].unique()
            )

            expected_windows = list(
                range(1, len(unique_windows) + 1)
            )

            if unique_windows != expected_windows:
                raise ValueError(
                    f"Window numbers must be sequential. "
                    f"Found={unique_windows}, "
                    f"Expected={expected_windows}"
                )

        return df

    # =========================================================
    # Standardize Columns
    # =========================================================
    def _standardize_columns(
        self,
        df: pd.DataFrame
    ) -> pd.DataFrame:

        column_mapping = {
            # Add future mappings here
        }

        df = df.rename(columns=column_mapping)

        keep_cols = (
            self.config['data']['required_columns']
            + self.config['data']['weather_columns']
            + self.config['data']['soil_columns']
            + self.config['data']['management_columns']
        )

        return df[
            [col for col in keep_cols if col in df.columns]
        ]

    # =========================================================
    # Calculate Derived Features
    # =========================================================
    def _calculate_features(
        self,
        df: pd.DataFrame
    ) -> pd.DataFrame:

        df.columns = df.columns.str.strip()

        base_temp = 10

        # Growing Degree Days
        df['gdd'] = (
            df.groupby(
                ['farm_id', 'crop', 'season', 'year']
            )['avg_temperature_2m_mean']
            .transform(
                lambda x: (
                    x - base_temp
                ).clip(lower=0).cumsum()
            )
        )

        # Rolling weather features
        for window in [7, 14, 30]:

            df[f'temp_{window}d_avg'] = (
                df.groupby(
                    ['farm_id', 'crop', 'season', 'year']
                )['avg_temperature_2m_mean']
                .transform(
                    lambda x: x.rolling(
                        window,
                        min_periods=1
                    ).mean()
                )
            )

            df[f'precip_{window}d_sum'] = (
                df.groupby(
                    ['farm_id', 'crop', 'season', 'year']
                )['avg_precipitation_sum']
                .transform(
                    lambda x: x.rolling(
                        window,
                        min_periods=1
                    ).sum()
                )
            )

        # Growth stage
        df['growth_stage'] = (
            df.groupby(
                ['farm_id', 'crop', 'season', 'year']
            )['window_num']
            .transform(
                lambda x: x / x.max()
            )
        )

        return df

    # =========================================================
    # Prepare Sequences
    # =========================================================
    def get_seasonal_data(
        self,
        df: pd.DataFrame
    ) -> Tuple[List[np.ndarray], List[float], List[Dict]]:

        sequences = []
        targets = []
        metadata = []

        # Convert categorical columns
        categorical_cols = self.config['data'].get(
            'categorical_columns',
            []
        )

        for col in categorical_cols:
            if col in df.columns:
                df[col] = (
                    df[col]
                    .astype('category')
                    .cat.codes
                )

        # Group by season
        for (
            farm_id,
            crop,
            season,
            year
        ), group in df.groupby(
            ['farm_id', 'crop', 'season', 'year']
        ):

            if not group['is_season_end'].any():
                continue

            final_yield = group.loc[
                group['is_season_end'],
                'yield'
            ].values[0]

            if pd.isna(final_yield):
                continue

            # Feature columns
            features = [
                col for col in df.columns
                if col not in [
                    'farm_id',
                    'crop',
                    'season',
                    'year',
                    'window_num',
                    'start_date',
                    'end_date',
                    'is_season_end',
                    'yield'
                ]
                and col in group.columns
            ]

            # Numerical only
            group_features = group[
                features
            ].select_dtypes(include=[np.number])

            # Build progressive sequences
            for i in range(1, len(group) + 1):

                current_seq = (
                    group_features.iloc[:i]
                    .values
                    .astype(np.float32)
                )

                sequences.append(current_seq)

                targets.append(float(final_yield))

                metadata.append({
                    'farm_id': farm_id,
                    'crop': crop,
                    'season': season,
                    'year': year,
                    'length': i,
                    'total_windows': len(group),
                    'start_date': group.iloc[0][
                        'start_date'
                    ].isoformat(),
                    'end_date': group.iloc[i - 1][
                        'end_date'
                    ].isoformat()
                })

        self.logger.info(
            f"Prepared {len(sequences)} sequences"
        )

        return sequences, targets, metadata
    