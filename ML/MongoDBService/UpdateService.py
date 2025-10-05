from pymongo import MongoClient
from collections import Counter, defaultdict
from datetime import datetime
import os

class SummaryUpdateService:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        self.db = client["AgriSupportDB"]
        self.disease_col = self.db["disease_reports"]
        self.farms_col = self.db["farms"]
        self.farm_stats_col = self.db["farm_stats"]
        self.user_summary_col = self.db["user_summary"]

    def update_farm_stats(self):
        farms = list(self.farms_col.find())
        for farm in farms:
            farm_id = farm["farm_id"]
            today = datetime.utcnow().strftime("%Y-%m-%d")

            reports = list(self.disease_col.find({"farm_id": farm_id}))
            if not reports:
                continue

            diseases = [r["disease"] for r in reports if r.get("disease") and r["disease"] != "healthy"]
            crops = [r["crop"] for r in reports if r.get("crop")]

            total = len(reports)
            diseased = len(diseases)
            most_common_disease = Counter(diseases).most_common(1)
            most_common_crop = Counter(crops).most_common(1)

            max_risk = 0
            try:
                farm_preds = farm.get("lstm_prediction", [])
                if farm_preds:
                    max_risk = max(p["predicted_risk%"] for p in farm_preds)
            except:
                pass

            update_data = {
                "farm_id": farm_id,
                "date": today,
                "last_updated": datetime.utcnow(),
                "total_images_analyzed": total,
                "diseased_images_found": diseased,
                "crop_counts": dict(Counter(crops)),
                "disease_counts": dict(Counter(diseases)),
                "max_risk_percent": round(max_risk, 2),
                "most_common_disease": most_common_disease[0][0] if most_common_disease else None,
                "most_common_crop": most_common_crop[0][0] if most_common_crop else None,
                "created_at": datetime.utcnow()
            }

            self.farm_stats_col.update_one(
                {"farm_id": farm_id, "date": today},
                {"$set": update_data},
                upsert=True
            )

    def update_user_summary(self):
        # Group farms by user
        farms = list(self.farms_col.find())
        user_farms = defaultdict(list)
        for farm in farms:
            user_farms[farm.get("user_id", "unknown")].append(farm)

        for user_id, user_farm_list in user_farms.items():
            total_images = 0
            diseased_images = 0
            all_diseases = []
            max_risk = 0

            for farm in user_farm_list:
                farm_id = farm["farm_id"]
                reports = list(self.disease_col.find({"farm_id": farm_id}))
                total_images += len(reports)
                all_diseases.extend([r["disease"] for r in reports if r.get("disease") != "healthy"])

                diseased_images += len([r for r in reports if r.get("disease") != "healthy"])
                try:
                    if farm.get("lstm_prediction"):
                        max_risk = max(max_risk, max(p["predicted_risk%"] for p in farm["lstm_prediction"]))
                except:
                    pass

            top_diseases = dict(Counter(all_diseases).most_common(5))
            update_data = {
                "user_id": user_id,
                "created_at": datetime.utcnow(),
                "summary": {
                    "total_images": total_images,
                    "total_diseased": diseased_images,
                    "last_updated": datetime.utcnow(),
                    "max_risk_percent": round(max_risk, 2),
                    "top_diseases": top_diseases
                }
            }

            self.user_summary_col.update_one(
                {"user_id": user_id},
                {"$set": update_data},
                upsert=True
            )

    def run_all(self):
        self.update_farm_stats()
        self.update_user_summary()
        print("[INFO] All stats updated.")
