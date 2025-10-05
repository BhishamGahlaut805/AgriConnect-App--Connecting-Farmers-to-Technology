from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.errors import ConnectionFailure

class MongoDBManager:
    def __init__(self, uri, db_name):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self._init_collections()

    def _init_collections(self):
        collections = [
            "uploaded_files", "stored_news", "weather_data",
            "bulletins", "chat_history", "training_jobs", "training_status"
        ]
        for name in collections:
            if name not in self.db.list_collection_names():
                self.db.create_collection(name)

        self.db.uploaded_files.create_index([("uploaded_at", DESCENDING)])
        self.db.chat_history.create_index([("timestamp", DESCENDING)])
        self.db.stored_news.create_index([("fetched_at", DESCENDING)])
        self.db.training_jobs.create_index([("created_at", DESCENDING)])
        self.db.training_status.create_index([("updated_at", DESCENDING)])

    def health_check(self):
        try:
            self.client.admin.command("ping")
            return True
        except ConnectionFailure:
            return False