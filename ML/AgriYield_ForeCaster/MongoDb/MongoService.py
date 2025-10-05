import os
import logging
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


class MongoService:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(mongo_uri)
        self.db = self.client["AgriSupportDB"]

        # Collections
        self.predictions = self.db["YieldPredictions"]
        self.sessions = self.db["Sessions"]
        self.chats = self.db["ChatHistory"]
        self.simulations = self.db["WhatIfSimulations"]
        self.prediction_cache = self.db["PredictionCache"]
        self.simulation_cache = self.db["SimulationCache"]

        # Init
        self._create_indexes()
        logging.info("MongoDB service initialized.")

    def _create_indexes(self):
        """Create necessary indexes for auto-expiry and lookup performance"""
        try:
            self.sessions.create_index("session_id", unique=True)
            self.sessions.create_index("expires_at", expireAfterSeconds=0)

            self.prediction_cache.create_index("expires_at", expireAfterSeconds=0)
            self.simulation_cache.create_index("expires_at", expireAfterSeconds=0)

            self.predictions.create_index([("farm_id", 1), ("crop", 1), ("created_at", -1)])
            self.simulations.create_index([("farm_id", 1), ("crop", 1), ("created_at", -1)])
            self.chats.create_index([("session_id", 1), ("timestamp", -1)])
        except Exception as e:
            logging.error(f"❌ Index creation failed: {e}")


    #-----------------SESSION and CHAT MANAGEMENT-----------------
    # In MongoService.py

    def get_active_session(self, farm_id: str) -> Optional[Dict[str, Any]]:
        """
        Get active session for farm_id with proper error handling and logging

        Args:
            farm_id: Farm identifier to lookup

        Returns:
            Session document if active session exists, None otherwise
        """
        try:
            session = self.sessions.find_one({
                "farm_id": farm_id,
                "expires_at": {"$gt": datetime.utcnow()}
            })

            if session:
                logger.debug(f"Found active session for farm_id: {farm_id}")
                # Convert ObjectId to string for JSON serialization
                session['_id'] = str(session['_id'])
                return session

            logger.debug(f"No active session found for farm_id: {farm_id}")
            return None

        except Exception as e:
            logger.error(f"Error retrieving session for farm_id {farm_id}: {str(e)}")
            return None

    def save_session(self, session_data: Dict[str, Any]) -> bool:
        """
        Save or update session with robust validation and error handling

        Args:
            session_data: Dictionary containing session details

        Returns:
            bool: True if successful, False if failed
        """
        try:
            # Validate required fields
            if not session_data.get("session_id") or not session_data.get("farm_id"):
                logger.error("Cannot save session - missing required fields")
                return False

            # Set timestamps
            now = datetime.utcnow()
            session_data.setdefault("created_at", now)
            session_data["last_accessed"] = now

            # Ensure expires_at exists and is in future
            if not session_data.get("expires_at"):
                session_data["expires_at"] = now + timedelta(hours=SESSION_TIMEOUT_HOURS)

            # Clean data before saving
            clean_data = {
                "session_id": str(session_data["session_id"]),
                "farm_id": str(session_data["farm_id"]),
                "created_at": session_data["created_at"],
                "last_accessed": session_data["last_accessed"],
                "expires_at": session_data["expires_at"]
            }

            # Add optional fields if present
            for field in ["user_id", "ip_address", "user_agent"]:
                if field in session_data:
                    clean_data[field] = session_data[field]

            result = self.sessions.update_one(
                {"session_id": clean_data["session_id"]},
                {"$set": clean_data},
                upsert=True
            )

            if result.acknowledged:
                logger.debug(f"Session {clean_data['session_id']} saved successfully")
                return True

            logger.error(f"Failed to save session {clean_data['session_id']}")
            return False

        except Exception as e:
            logger.error(f"Error saving session: {str(e)}", exc_info=True)
            return False

    def get_chat_history(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Retrieve chat history for a session with proper pagination and error handling

        Args:
            session_id: Session identifier
            limit: Maximum number of messages to return

        Returns:
            List of chat messages (most recent first)
        """
        try:
            chats = list(self.chats.find(
                {"session_id": str(session_id)},
                sort=[("timestamp", -1)],
                limit=min(limit, 100)  # Enforce maximum limit
            ))

            # Convert ObjectIds and clean data
            for chat in chats:
                chat['_id'] = str(chat['_id'])
                chat.pop('_id', None)  # Remove MongoDB _id from response

            logger.debug(f"Retrieved {len(chats)} chat messages for session {session_id}")
            return chats

        except Exception as e:
            logger.error(f"Error retrieving chat history for session {session_id}: {str(e)}")
            return []

    def save_chat(self, chat_data: Dict[str, Any]) -> bool:
        """
        Save chat message with robust validation and error handling

        Args:
            chat_data: Dictionary containing chat message details

        Returns:
            bool: True if successful, False if failed
        """
        try:
            # Validate required fields
            required_fields = ["session_id", "user_message", "bot_response"]
            if not all(field in chat_data for field in required_fields):
                logger.error(f"Cannot save chat - missing required fields: {required_fields}")
                return False

            # Prepare clean document
            document = {
                "session_id": str(chat_data["session_id"]),
                "user_message": str(chat_data["user_message"]),
                "bot_response": chat_data["bot_response"],
                "timestamp": chat_data.get("timestamp", datetime.utcnow())
            }

            # Add optional fields if present
            optional_fields = ["farm_id", "crop", "user_id", "message_type"]
            for field in optional_fields:
                if field in chat_data and chat_data[field] is not None:
                    document[field] = str(chat_data[field])

            # Size validation (MongoDB has 16MB document limit)
            if len(str(document)) > 1_000_000:  # ~1MB safety margin
                logger.warning("Chat message too large, truncating")
                document["user_message"] = document["user_message"][:5000]
                document["bot_response"] = str(document["bot_response"])[:5000]

            result = self.chats.insert_one(document)

            if result.acknowledged:
                logger.debug(f"Chat message saved for session {document['session_id']}")
                return True

            logger.error(f"Failed to save chat message for session {document['session_id']}")
            return False

        except Exception as e:
            logger.error(f"Error saving chat message: {str(e)}", exc_info=True)
            return False
    # ---------- Prediction Caching ----------
    def get_cached_prediction(self, cache_key: str) -> Optional[Dict[str, Any]]:
        try:
            doc = self.prediction_cache.find_one({
                "_id": cache_key,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            return doc.get("result") if doc else None
        except Exception as e:
            logging.error(f"❌ Failed to get cached prediction: {e}")
            return None

    def cache_prediction(self, cache_key: str, result: Dict[str, Any]) -> bool:
        try:
            self.prediction_cache.update_one(
                {"_id": cache_key},
                {"$set": {
                    "result": result,
                    "timestamp": datetime.utcnow(),
                    "expires_at": datetime.utcnow() + timedelta(days=1)
                }},
                upsert=True
            )
            return True
        except Exception as e:
            logging.error(f"❌ Failed to cache prediction: {e}")
            return False

    def save_prediction(self, prediction_data: Dict[str, Any]) -> bool:
        try:
            # Clean and prepare prediction data
            clean_data = {
                "farm_id": prediction_data.get("farm_id"),
                "crop": prediction_data.get("crop"),
                "timestamp": datetime.utcnow(),
                "yield_predictions": prediction_data.get("yield_predictions", {}),
                "metadata": prediction_data.get("metadata", {})
            }

            # Process feature analysis for efficient storage
            feature_analysis = prediction_data.get("feature_analysis", {})
            if feature_analysis:
                clean_data["feature_analysis"] = {
                    "static": [
                        {"feature": k, "importance": v}
                        for k, v in feature_analysis.get("static_features", {}).items()
                    ],
                    "dynamic": [
                        {"feature": k, "importance": v}
                        for k, v in feature_analysis.get("dynamic_features", {}).items()
                    ]
                }

            # Add model info if available
            if "model_version" in prediction_data:
                clean_data["model_version"] = prediction_data["model_version"]

            # Size validation
            if len(str(clean_data)) > 10_000_000:  # ~10MB
                logging.warning("Prediction data too large, trimming feature analysis")
                clean_data["feature_analysis"] = {
                    "static": clean_data["feature_analysis"]["static"][:10],
                    "dynamic": clean_data["feature_analysis"]["dynamic"][:20]
                }

            self.predictions.insert_one(clean_data)
            return True

        except Exception as e:
            logging.error(f"Failed to save prediction: {e}")
            return False

    def save_whatif_simulation(self, simulation_data: Dict[str, Any]) -> bool:
        """
        Stores the complete what-if simulation response exactly as received from the API

        Args:
            simulation_data: The complete simulation response dictionary

        Returns:
            bool: True if successful, False if failed
        """
        try:
            # Create base document with required fields
            document = {
                "_id": f"sim_{datetime.utcnow().timestamp()}_{simulation_data.get('metadata', {}).get('farm_id', '')}_{simulation_data.get('metadata', {}).get('crop', '')}",
                "created_at": datetime.utcnow(),
                "simulation_type": "what-if",
                "status": "completed",
                "full_response": simulation_data  # Store the complete original response
            }

            # Add extracted metadata for easier querying
            metadata = simulation_data.get("metadata", {})
            document["metadata"] = {
                "farm_id": metadata.get("farm_id"),
                "crop": metadata.get("crop"),
                "feature": metadata.get("feature"),
                "change_percent": metadata.get("change_percent"),
                "days_affected": metadata.get("days_affected"),
                "model_version": metadata.get("model_version"),
                "timestamp": metadata.get("timestamp")
            }

            # Add extracted results for easier querying
            results = simulation_data.get("results", {})
            document["results_summary"] = {
                "baseline_yield": results.get("baseline_confidence", {}).get("median"),
                "modified_yield": results.get("modified_confidence", {}).get("median"),
                "yield_delta": results.get("delta", {}).get("median"),
                "percent_change": results.get("percent_change", {}).get("median"),
                "risk_level": results.get("impact_analysis", {}).get("risk_assessment")
            }

            # Store feature importance separately for analysis
            feature_importance = results.get("feature_importance", {})
            if feature_importance:
                document["feature_analysis"] = {
                    "top_static_features": [
                        {"feature": k, "importance": v}
                        for k, v in sorted(
                            feature_importance.get("static_features", {}).items(),
                            key=lambda x: x[1],
                            reverse=True
                        )[:3]  # Store top 3 static features
                    ],
                    "top_dynamic_features": [
                        {"feature": k, "importance": v}
                        for k, v in sorted(
                            feature_importance.get("dynamic_features", {}).items(),
                            key=lambda x: x[1],
                            reverse=True
                        )[:5]  # Store top 5 dynamic features
                    ],
                    "modified_feature": {
                        "name": metadata.get("feature"),
                        "importance": feature_importance.get("dynamic_features", {}).get(
                            metadata.get("feature"),
                            feature_importance.get("static_features", {}).get(metadata.get("feature"))
                        )
                    }
                }

            # Store impact analysis
            impact_analysis = results.get("impact_analysis", {})
            if impact_analysis:
                document["impact_analysis"] = {
                    "primary_impact": impact_analysis.get("primary_impact"),
                    "risk_level": impact_analysis.get("risk_assessment"),
                    "recommendation": impact_analysis.get("recommendation"),
                    "secondary_impacts_count": len(impact_analysis.get("secondary_impacts", []))
                }

            # Add system info
            document["system"] = {
                "storage_timestamp": datetime.utcnow(),
                "data_version": "1.4",
                "collection": "WhatIfSimulations"
            }

            # Clean None values from the document
            def clean_dict(d):
                if not isinstance(d, dict):
                    return d
                return {k: clean_dict(v) for k, v in d.items() if v is not None and v != {}}

            clean_document = clean_dict(document)

            # Insert into MongoDB
            result = self.simulations.insert_one(clean_document)
            return result.acknowledged

        except Exception as e:
            logging.error(f"Failed to save simulation: {str(e)}", exc_info=True)
            return False

    def _get_feature_rank(self, feature_name: str, feature_importance: Dict[str, Dict[str, float]]) -> Dict[str, Any]:
        """
        Helper method to determine the ranking of the modified feature in importance

        Args:
            feature_name: The feature that was modified
            feature_importance: Dictionary containing static and dynamic feature importance

        Returns:
            Dictionary with rank information or None if not found
        """
        if not feature_name or not feature_importance:
            return None

        try:
            # Check both static and dynamic features
            for feature_type in ["static_features", "dynamic_features"]:
                if feature_name in feature_importance.get(feature_type, {}):
                    features = feature_importance[feature_type]
                    sorted_features = sorted(features.items(), key=lambda x: x[1], reverse=True)
                    rank = next((i+1 for i, (name, _) in enumerate(sorted_features) if name == feature_name), None)
                    return {
                        "feature": feature_name,
                        "type": feature_type.replace("_features", ""),
                        "importance": features[feature_name],
                        "rank": rank,
                        "total_features": len(features)
                    }
            return None
        except Exception as e:
            logging.warning(f"Could not determine feature rank: {str(e)}")
            return None
        except Exception as e:
            logging.warning(f"Could not determine feature rank: {str(e)}")
            return None

    # ---------- Simulation Caching ----------
    def get_cached_simulation(self, cache_key: str) -> Optional[Dict[str, Any]]:
        try:
            doc = self.simulation_cache.find_one({
                "_id": cache_key,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            return doc.get("result") if doc else None
        except Exception as e:
            logging.error(f"❌ Failed to get cached simulation: {e}")
            return None

    def cache_simulation(self, cache_key: str, result: Dict[str, Any]) -> bool:
        try:
            self.simulation_cache.update_one(
                {"_id": cache_key},
                {"$set": {
                    "result": result,
                    "timestamp": datetime.utcnow(),
                    "expires_at": datetime.utcnow() + timedelta(days=1)
                }},
                upsert=True
            )
            return True
        except Exception as e:
            logging.error(f"❌ Failed to cache simulation: {e}")
            return False


    # ---------- Chat Storage ----------
    def save_chat(self, chat_data: Dict[str, Any]) -> bool:
        try:
            chat_data["timestamp"] = datetime.utcnow()
            self.chats.insert_one(chat_data)
            return True
        except Exception as e:
            logging.error(f"❌ Failed to save chat: {e}")
            return False

    # ---------- Fetch Helpers ----------
    def get_recent_predictions(self, farm_id: str, crop: str, limit: int = 5) -> List[Dict[str, Any]]:
        try:
            return list(self.predictions.find(
                {"farm_id": farm_id, "crop": crop},
                sort=[("created_at", -1)],
                limit=limit
            ))
        except Exception as e:
            logging.error(f"❌ Failed to fetch recent predictions: {e}")
            return []

    def get_chat_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            return list(self.chats.find(
                {"session_id": session_id},
                sort=[("timestamp", -1)],
                limit=limit
            ))
        except Exception as e:
            logging.error(f"❌ Failed to fetch chat history: {e}")
            return []
