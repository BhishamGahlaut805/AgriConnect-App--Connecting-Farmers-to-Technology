from pymongo import MongoClient
from bson import ObjectId
import os
import time
import uuid
from datetime import datetime
class CreateFarmService:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
        self.client = MongoClient(mongo_uri)
        self.db = self.client["AgriSupportDB"]
        self.farms_collection = self.db["farms"]
    
    def generate_farm_id(self):
        timestamp = int(time.time())  # Current UNIX timestamp
        random_suffix = uuid.uuid4().hex[:6].upper()  # First 6 chars of UUID
        return f"FARM_{timestamp}_{random_suffix}"

    def create_farm(self, farm_data):
        farm_data["farm_id"] = self.generate_farm_id()
        result = self.farms_collection.insert_one(farm_data)
        return farm_data["farm_id"]

    def get_all_farms(self):
        return list(self.farms_collection.find({}))

    def update_farm_nearby(self, farm_id, updated_nearby):
        self.farms_collection.update_one(
            {"farm_id": farm_id},
            {"$set": {"nearby_farms": updated_nearby}}
        )

    @staticmethod
    def update_farm_analysis_stats(
        farm_id: str,
        new_images_analyzed: int,
        new_diseased_images: int,
        crop: str = None,
        disease: str = None,
        latitude: float = None,
        longitude: float = None
    ):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        db = client["AgriSupportDB"]

        farms_col = db["farms"]
        stats_col = db["farm_stats"]
        geo_stats_col = db["geo_stats"]
        user_summary_col = db["user_summary"]

        timestamp = datetime.utcnow()
        today_str = timestamp.strftime("%Y-%m-%d")

        # 1. Update farm document (using custom farm_id)
        farms_col.update_one(
            {"farm_id": farm_id},
            {
                "$inc": {
                    "analysis.total_images_analyzed": new_images_analyzed,
                    "analysis.diseased_images_found": new_diseased_images
                },
                "$set": {
                    "analysis.last_updated": timestamp
                }
            }
        )

        # 2. Update/Create daily stats document
        stats_col.update_one(
            {"farm_id": farm_id, "date": today_str},
            {
                "$inc": {
                    "total_images_analyzed": new_images_analyzed,
                    "diseased_images_found": new_diseased_images,
                    f"crop_counts.{crop}": 1 if crop else 0,
                    f"disease_counts.{disease}": 1 if disease else 0
                },
                "$set": {"last_updated": timestamp},
                "$setOnInsert": {"created_at": timestamp}
            },
            upsert=True
        )

        # 3. Geo-stats update
        if latitude is not None and longitude is not None:
            geo_stats_col.update_one(
                {"farm_id": farm_id, "date": today_str, "lat": latitude, "lon": longitude},
                {
                    "$inc": {
                        "total_images": new_images_analyzed,
                        "diseased": new_diseased_images
                    },
                    "$set": {"last_updated": timestamp},
                    "$setOnInsert": {"created_at": timestamp}
                },
                upsert=True
            )

        # 4. Update user summary based on user_id in farm document
        farm_doc = farms_col.find_one({"farm_id": farm_id})
        user_id = farm_doc.get("user_id") if farm_doc else None

        if user_id:
            user_summary_col.update_one(
                {"user_id": user_id},
                {
                    "$inc": {
                        "summary.total_images": new_images_analyzed,
                        "summary.total_diseased": new_diseased_images
                    },
                    "$set": {"summary.last_updated": timestamp},
                    "$setOnInsert": {"created_at": timestamp}
                },
                upsert=True
            )

        client.close()