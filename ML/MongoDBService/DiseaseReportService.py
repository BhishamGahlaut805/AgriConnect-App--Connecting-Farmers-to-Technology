from pymongo import MongoClient
import os

class DiseaseReportService:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGO_URI"))
        self.db = self.client
        self.collection = self.db["disease_reports"]

    def save_report(self, data):
        self.collection.insert_one(data)

# Singleton instance
DiseaseReportService = DiseaseReportService()
