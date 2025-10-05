import os
import logging
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from bson import json_util
import json

logger = logging.getLogger(__name__)

class MongoService:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(mongo_uri)
        self.db = self.client["AgriSupportDB"]
        self.stateYield = self.db["StateYield"]