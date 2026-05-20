import os
import logging
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from bson import json_util
import json
from gridfs import GridFS

logger = logging.getLogger(__name__)

class MongoService:
    from pymongo import MongoClient
from gridfs import GridFS

class MongoService:

    def __init__(self):

        mongo_uri = os.getenv("MONGO_URI")

        self.client = MongoClient(mongo_uri)

        self.db = self.client["AgriSupportDB"]

        self.fs = GridFS(self.db)

        self.predictions = self.db["YieldPredictions"]

        self.simulations = self.db["WhatIfSimulations"]

        self.models = self.db["YieldModelMetadata"]

    def save_prediction(self, prediction_data: Dict) -> bool:
        """Save prediction results with proper typing"""
        try:
            # Ensure proper datetime conversion
            if "timestamp" in prediction_data:
                if isinstance(prediction_data["timestamp"], str):
                    prediction_data["timestamp"] = datetime.fromisoformat(prediction_data["timestamp"])

            prediction_data["created_at"] = datetime.now()

            # Convert any numpy types to native Python types
            prediction_data = json.loads(json_util.dumps(prediction_data))

            self.predictions.insert_one(prediction_data)
            return True
        except Exception as e:
            logger.error(f"Failed to save prediction: {str(e)}")
            return False

    def save_model_metadata(self, metadata: Dict) -> bool:
        """Save model metadata with versioning"""
        try:
            metadata["saved_at"] = datetime.now()
            self.models.insert_one(metadata)
            return True
        except Exception as e:
            logger.error(f"Failed to save model metadata: {str(e)}")
            return False

    def get_latest_prediction(self, farm_id: str, crop: str) -> Optional[Dict]:
        """Get the most recent prediction for a farm/crop"""
        try:
            return self.predictions.find_one(
                {"farm_id": farm_id, "crop": crop},
                sort=[("timestamp", -1)]
            )
        except Exception as e:
            logger.error(f"Failed to fetch prediction: {str(e)}")
            return None

    def save_model_file(
            self,
            file_bytes,
            filename,
            metadata
        ):

            existing = self.fs.find_one(
                {
                    "filename": filename,
                    "metadata.farm_id": metadata["farm_id"],
                    "metadata.crop_name": metadata["crop_name"]
                }
            )

            if existing:
                self.fs.delete(existing._id)

            file_id = self.fs.put(
                file_bytes,
                filename=filename,
                metadata=metadata
            )

            return str(file_id)
        
    def load_model_file(
            self,
            farm_id,
            crop_name
        ):

            file_doc = self.fs.find_one(
                {
                    "metadata.farm_id": farm_id,
                    "metadata.crop_name": crop_name
                },
                sort=[("uploadDate", -1)]
            )

            if not file_doc:
                return None

            return file_doc.read()