import os
import pandas as pd
import yaml
import logging
from typing import Dict, List
from datetime import datetime

BASE_DATA_DIR=r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports"
class CropDataLoader:
    def __init__(self, farm_id: str, config_path: str = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\AgriYield_ForeCaster\configs\training_config.yaml"):
        self.farm_id = farm_id
        self.config = self._load_config(config_path)
        self.base_path = self.config['data']['base_path']
        self.farm_path = os.path.join(self.base_path, self.farm_id)
        self.data_dir = os.path.join(BASE_DATA_DIR, farm_id)
        self._validate_farm()

    def _load_config(self, config_path: str) -> Dict:
        with open(config_path) as f:
            config = yaml.safe_load(f)

        required_keys = ['data', 'features', 'model']
        missing = [k for k in required_keys if k not in config]
        if missing:
            raise ValueError(f"Missing keys in config: {missing}")
        return config

    def _validate_farm(self):
        if not os.path.exists(self.farm_path):
            raise FileNotFoundError(f"No data directory for farm {self.farm_id}")

        if not os.path.exists(os.path.join(self.farm_path,"crops")):
            raise FileNotFoundError(f"'crops' directory missing for farm {self.farm_id}")

    def load_crop_data(self, crop_name: str) -> pd.DataFrame:
        """Load and filter unified yield data for a specific crop"""
        file_path = os.path.join(self.farm_path, "crops",crop_name.replace(" ", "_") + ".csv")
        try:
            df = pd.read_csv(file_path, parse_dates=["date"])
            df = df[df["crop"] == crop_name]

            if df.empty:
                raise ValueError(f"No records found for crop '{crop_name}' in {file_path}")

            df = self._preprocess_data(df)
            return self._calculate_features(df)

        except Exception as e:
            logging.error(f"Error loading data for {crop_name}: {str(e)}")
            raise

    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.sort_values(by="date")

        # Ensure 'date' is datetime
        df["date"] = pd.to_datetime(df["date"], errors='coerce')

        # Drop or warn about invalid dates
        df = df.dropna(subset=["date"])

        # Set datetime index
        df = df.set_index("date")

        # Now safely interpolate
        df = df.infer_objects(copy=False)
        df = df.interpolate(method="time").reset_index()

        # Recalculate time index (season_day preferred)
        if "season_day" in df.columns:
            df["time_idx"] = df["season_day"]
        else:
            df["time_idx"] = df["date"].rank(method="dense").astype(int)

        return df


    def _calculate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        required_cols = ['temperature_2m_mean', 'precipitation_sum']
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column '{col}'")

        base_temp = self.config['features'].get('gdd_base_temp', 10)
        df['gdd'] = (df['temperature_2m_mean'] - base_temp).clip(lower=0).cumsum()

        for window in [7, 14, 30]:
            df[f'temp_{window}d_avg'] = df['temperature_2m_mean'].rolling(window).mean().bfill()
            df[f'precip_{window}d_sum'] = df['precipitation_sum'].rolling(window).sum().fillna(0)

        return df

    def get_available_crops(self) -> List[Dict]:
        """Get crop names and season/year summary from Yield_data.csv"""
        file_path = os.path.join(self.farm_path, "Yield_data.csv")
        if not os.path.exists(file_path):
            return []

        df = pd.read_csv(file_path)
        crops = []

        for crop_name in df['crop'].unique():
            crop_df = df[df['crop'] == crop_name]
            crops.append({
                "name": crop_name,
                "seasons": crop_df['season'].unique().tolist(),
                "years_available": crop_df['year'].nunique()
            })

        return crops

    def regenerate_crop_data(farm_id, farm_name, latitude, longitude, static_overrides=None):
        """
        Re-run the YieldData.py generator for this farm and regenerate crop CSVs.
        """
        from ...DataService.YieldData import AgriDatasetGenerator  # Ensure the module path is correct

        print(f"[INFO] Regenerating data for farm: {farm_name} ({farm_id})")
        try:
            generator = AgriDatasetGenerator(
                farm_id=farm_id,
                farm_name=farm_name,
                latitude=latitude,
                longitude=longitude,
                static_features=static_overrides
            )
            generated_data = generator.generate()
            print(f"[SUCCESS] Regeneration complete. Crops processed: {list(generated_data.keys())}")
        except Exception as e:
            print(f"[ERROR] Failed to regenerate data: {str(e)}")
