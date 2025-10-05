import os
import json
import torch
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Optional

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet

from ..Modeling.TFTPredictor import TFTPredictor
from ..MongoDb.MongoService import MongoService


class AgriChatInterface:
    def __init__(self, models_dir: str = "trainedCropModels"):
        self.models_dir = Path(models_dir)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Initialize NLP components
        self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        self.nlp_model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base").to(self.device)

        # Initialize MongoDB service
        self.mongo_service = MongoService()

        # Session configuration
        self.sessions = {}  # In-memory session cache
        self.context_window = 5  # Number of past interactions to remember
        self.session_timeout = 3600  # 1 hour in seconds

        # Load knowledge base
        self.load_knowledge_base()

    def load_knowledge_base(self):
        """Load or initialize the agricultural knowledge base"""
        self.knowledge_base = {
            "crops": {
                "Bajra": {"growth_days": 90, "critical_stage": "flowering"},
                "Wheat": {"growth_days": 120, "critical_stage": "tillering"},
            },
            "best_practices": {
                "drought": ["Drip irrigation", "Mulching", "Reduce plant density"],
            }
        }

    def create_session(self, farm_id: str) -> str:
        """Create a new session with MongoDB persistence"""
        session_id = f"{farm_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        expires_at = datetime.utcnow() + timedelta(seconds=self.session_timeout)

        session_data = {
            "session_id": session_id,
            "farm_id": farm_id,
            "context": [],
            "created_at": datetime.utcnow(),
            "last_accessed": datetime.utcnow(),
            "expires_at": expires_at
        }

        # Store in memory and MongoDB
        self.sessions[session_id] = session_data
        self.mongo_service.save_session(session_data)

        return session_id

    def validate_session(self, session_id: str) -> bool:
        """Validate session checking both memory and MongoDB with proper synchronization"""
        # First check in-memory cache
        if session_id in self.sessions:
            session = self.sessions[session_id]
            if datetime.utcnow() > session["expires_at"]:
                del self.sessions[session_id]
                return False
            return True

        # If not in memory, check MongoDB
        session_doc = self.mongo_service.get_active_session(session_id)
        if not session_doc:
            return False

        # Convert string timestamps if needed
        if isinstance(session_doc.get("last_accessed"), str):
            session_doc["last_accessed"] = datetime.fromisoformat(session_doc["last_accessed"])
        if isinstance(session_doc.get("expires_at"), str):
            session_doc["expires_at"] = datetime.fromisoformat(session_doc["expires_at"])

        # Check if expired
        if datetime.utcnow() > session_doc["expires_at"]:
            return False

        # Load into memory cache
        self.sessions[session_id] = {
            "session_id": session_id,
            "farm_id": session_doc["farm_id"],
            "context": session_doc.get("context", []),
            "last_accessed": session_doc["last_accessed"],
            "expires_at": session_doc["expires_at"]
        }

        return True

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get complete session data with validation"""
        if not self.validate_session(session_id):
            return None

        if session_id in self.sessions:
            return self.sessions[session_id]

        return None

    def update_session_activity(self, session_id: str):
        """Update session timestamp in both memory and MongoDB"""
        if session_id in self.sessions:
            now = datetime.utcnow()
            new_expiry = now + timedelta(seconds=self.session_timeout)

            self.sessions[session_id]["last_accessed"] = now
            self.sessions[session_id]["expires_at"] = new_expiry

            # Update MongoDB
            update_data = {
                "session_id": session_id,
                "last_accessed": now,
                "expires_at": new_expiry
            }
            self.mongo_service.save_session(update_data)

    def load_crop_model(self, farm_id: str, crop: str) -> TFTPredictor:
        """Load trained crop model with error handling"""
        model_dir = self.models_dir / farm_id / crop
        checkpoint_path = model_dir / "best_model.ckpt"
        dataset_path = model_dir / "dataset.pt"

        if not checkpoint_path.exists() or not dataset_path.exists():
            raise FileNotFoundError(f"Model or dataset not found for {crop} in farm {farm_id}")

        try:
            dataset = torch.load(dataset_path)
            model = TemporalFusionTransformer.load_from_checkpoint(checkpoint_path).to(self.device)
            return TFTPredictor(model, dataset)
        except Exception as e:
            raise RuntimeError(f"Failed to load model for {crop}: {str(e)}")

    def process_query(self, session_id: str, query: str, crop_data: Dict = None) -> Dict:
        """Process user query with full context and error handling"""
        # Validate session
        if not self.validate_session(session_id):
            return {"error": "Invalid or expired session", "solution": "Please start a new session"}

        # Update session activity
        self.update_session_activity(session_id)

        try:
            # Build prompt with context
            prompt = self._build_prompt(session_id, query, crop_data)

            # Generate response
            response = self._generate_nlp_response(session_id, query, prompt)

            # Handle special commands
            if "[DATA_REQUIRED]" in response:
                return self._handle_data_required()
            elif "[PREDICTION]" in response:
                return self._handle_prediction(session_id, crop_data)
            elif "[ANALYSIS]" in response:
                return self._handle_analysis()

            # Save conversation history
            self._save_conversation(session_id, query, response)

            return {"type": "text", "response": response}

        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            print(f"❌ {error_msg}")
            return {"error": error_msg}

    def _build_prompt(self, session_id: str, query: str, crop_data: Dict = None) -> str:
        """Construct the prompt with context and relevant information"""
        session = self.sessions.get(session_id, {})
        context = session.get("context", [])
        farm_id = session.get("farm_id", "unknown")

        # Base prompt
        prompt = [
            f"Agricultural Assistant for Farm {farm_id}",
            f"Current Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            ""
        ]

        # Add context
        for turn in context[-self.context_window:]:
            prompt.extend([
                f"User: {turn['query']}",
                f"Assistant: {turn['response']}",
                ""
            ])

        # Add crop data if available
        if crop_data:
            prompt.append(
                f"Current Crop Data: {crop_data.get('crop')}, "
                f"Day {crop_data.get('season_day')}, "
                f"Temp: {crop_data.get('temperature_2m_mean', 'N/A')}°C"
            )

        # Add current query
        prompt.extend([
            "",
            f"User: {query}",
            "Assistant:"
        ])

        return "\n".join(prompt)

    def _generate_nlp_response(self, session_id: str, query: str, prompt: str) -> str:
        """Generate response using the NLP model"""
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
            outputs = self.nlp_model.generate(
                **inputs,
                max_new_tokens=200,
                temperature=0.7,
                do_sample=True
            )
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return response
        except Exception as e:
            raise RuntimeError(f"NLP generation failed: {str(e)}")

    def _save_conversation(self, session_id: str, query: str, response: Dict):
        """Save conversation to both memory and MongoDB"""
        if session_id not in self.sessions:
            return

        # Update in-memory context
        self.sessions[session_id]["context"].append({
            "query": query,
            "response": response.get("response") if isinstance(response, dict) else str(response)
        })

        # Save to MongoDB
        chat_data = {
            "session_id": session_id,
            "farm_id": self.sessions[session_id]["farm_id"],
            "user_message": query,
            "bot_response": response,
            "timestamp": datetime.utcnow()
        }
        self.mongo_service.save_chat(chat_data)

    def _handle_data_required(self) -> Dict:
        return {
            "type": "text",
            "response": "Please provide crop name, growth day, and temperature to proceed with prediction."
        }

    def _handle_analysis(self) -> Dict:
        return {
            "type": "text",
            "response": "Advanced analysis features are under development."
        }

    def _handle_prediction(self, session_id: str, crop_data: Dict) -> Dict:
        """Handle prediction requests with comprehensive error handling"""
        if not crop_data or "crop" not in crop_data:
            return {"error": "Crop data is missing for prediction."}

        farm_id = self.sessions[session_id]["farm_id"]

        try:
            # Load model and make prediction
            predictor = self.load_crop_model(farm_id, crop_data["crop"])
            df = pd.DataFrame([crop_data])

            # Make prediction
            raw_preds, x = predictor.predict(df, mode="raw")

            # Get prediction details
            confidence = predictor.get_confidence_intervals(raw_preds)
            importance = predictor.get_feature_importance(raw_preds, x)
            attention = predictor.get_attention_weights(raw_preds)

            # Calculate confidence score
            crop_info = self.knowledge_base["crops"].get(crop_data["crop"], {})
            confidence_score = self._calculate_confidence(
                crop_data.get("season_day", 0),
                crop_info.get("growth_days", 100)
            )

            # Prepare response
            prediction_response = {
                "type": "prediction",
                "crop": crop_data["crop"],
                "predicted_yield": confidence.get("median"),
                "confidence_interval": {
                    "low": confidence.get("low_90"),
                    "high": confidence.get("high_90")
                },
                "confidence_score": confidence_score,
                "attention": attention,
                "feature_importance": importance
            }

            # Cache prediction
            cache_key = f"{farm_id}_{crop_data['crop']}_{crop_data.get('season_day', 0)}"
            self.mongo_service.cache_prediction(cache_key, prediction_response)

            return prediction_response

        except Exception as e:
            error_msg = f"Prediction failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {"error": error_msg}

    def _calculate_confidence(self, current_day: int, total_days: int) -> float:
        """Calculate confidence score based on crop growth progress"""
        progress = min(current_day / total_days, 1.0)
        return round(30 + 70 * progress, 2)

    def cleanup_expired_sessions(self):
        """Clean up expired sessions from memory"""
        now = datetime.utcnow()
        expired = [sid for sid, session in self.sessions.items()
                  if now > session["expires_at"]]
        for sid in expired:
            del self.sessions[sid]
