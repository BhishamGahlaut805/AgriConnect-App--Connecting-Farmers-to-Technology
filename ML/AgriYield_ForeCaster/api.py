from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
import pandas as pd
import numpy as np
import os
import hashlib
import json
from typing import Dict, Optional, List, Tuple, Any
import warnings
import torch
import uuid

warnings.filterwarnings("ignore", category=UserWarning)
os.environ["CUDA_VISIBLE_DEVICES"] = ""

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
api_blueprint = Blueprint('agri_api', __name__, url_prefix='/api/v1')

MODEL_DIR = os.path.abspath(r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports")
CACHE_EXPIRY_DAYS = 1
SESSION_TIMEOUT_HOURS = 1

try:
    from .DataProcessing.DataSetLoader import CropDataLoader
    from .DataProcessing.featureEngineering import FeatureEngineer
    from .Modeling.TFT_Training import TFTTrainer
    from .Modeling.TFTPredictor import TFTPredictor
    from .Modeling.AttentionVisualizer import AttentionVisualizer
    from .Interfaces.chatInterface import AgriChatInterface
    from .MongoDb.MongoService import MongoService

    chat_agent = AgriChatInterface(models_dir="trainedCropModels")
    mongo_service = MongoService()
    logger.info("Core services initialized successfully.")
except ImportError as e:
    logger.critical(f"Failed to import core services: {e}")
    raise

# Add these constants at the top of api.py
STATIC_FEATURE_MAP = {
    0: "crop",
    1: "season",
    2: "district",
    3: "FARM_ID",
    4: "latitude",
    5: "longitude",
    6: "soil_type",
    7: "irrigation_type",
    8: "seed_variety"
}

DYNAMIC_FEATURE_MAP = {
    0: "time_idx",
    1: "season_day",
    2: "temperature_2m_mean",
    3: "temperature_2m_max",
    4: "temperature_2m_min",
    5: "relative_humidity_2m_mean",
    6: "wind_speed_10m_max",
    7: "wind_direction_10m_dominant",
    8: "precipitation_sum",
    9: "shortwave_radiation_sum",
    10: "surface_pressure_mean",
    11: "cloud_cover_mean",
    12: "soil_moisture",
    13: "ndvi"
}

class DataProcessor:
    @staticmethod
    def dataframe_to_hash(df: pd.DataFrame) -> str:
        """Generates a consistent MD5 hash for a DataFrame, handling Timestamp objects"""
        try:
            # Convert DataFrame to dict and handle Timestamp objects
            data_dict = df.fillna(0).to_dict(orient='records')

            # Convert Timestamp objects to ISO format strings
            for record in data_dict:
                for key, value in record.items():
                    if pd.api.types.is_datetime64_any_dtype(df[key]):
                        record[key] = value.isoformat() if hasattr(value, 'isoformat') else str(value)

            # Sort keys and generate hash
            return hashlib.md5(
                json.dumps(data_dict, sort_keys=True).encode()
            ).hexdigest()
        except Exception as e:
            logger.error(f"Hashing failed: {e}")
            return "default_hash"

    @staticmethod
    def tensor_to_serializable(data):
        """Convert PyTorch tensors and numpy arrays to Python native types."""
        if isinstance(data, torch.Tensor):
            if data.numel() == 1:
                return data.item()
            return data.cpu().numpy().tolist()
        elif isinstance(data, np.ndarray):
            if data.size == 1:
                return data.item()
            return data.tolist()
        elif isinstance(data, dict):
            return {k: DataProcessor.tensor_to_serializable(v) for k, v in data.items()}
        elif isinstance(data, (list, tuple)):
            return [DataProcessor.tensor_to_serializable(v) for v in data]
        return data

    @staticmethod
    def ensure_numeric(df: pd.DataFrame, columns: list) -> pd.DataFrame:
        df = df.copy()
        for col in columns:
            if col in df.columns:
                try:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                    df[col] = df[col].replace([np.inf, -np.inf], np.nan)
                    df[col] = df[col].interpolate().ffill().bfill().fillna(0)
                except Exception as e:
                    logger.error(f"Column {col} conversion failed: {e}")
                    df[col] = 0
        return df

    @staticmethod
    def safe_round(value, decimals=4):
        try:
            return round(float(value), decimals) if value is not None and not pd.isna(value) else 0.0
        except (ValueError, TypeError):
            return 0.0

class CacheManager:
    @staticmethod
    def create_cache_key(*args) -> str:
        return hashlib.md5("_".join(str(arg) for arg in args if arg is not None).encode()).hexdigest()

    @staticmethod
    def validate_cached_result(cached: Any, farm_id: str, crop: str) -> bool:
        if not cached or not isinstance(cached, dict):
            return False

        metadata = cached.get('metadata', {})
        results = cached.get('results', cached.get('yield_predictions', {}))

        return (metadata.get('farm_id') == farm_id and
                metadata.get('crop') == crop and
                results.get('confidence_interval', {}).get('median') is not None)

@api_blueprint.route('/predict', methods=['POST'])
def predict_yield():
    try:
        # Validate request
        if not request.json or 'farm_id' not in request.json or 'crop' not in request.json:
            return jsonify({"error": "Missing 'farm_id' or 'crop' in request"}), 400

        farm_id = str(request.json['farm_id'])
        crop = str(request.json['crop'])

        # Check MongoDB cache first
        cache_key = f"prediction_{farm_id}_{crop}"
        cached_result = MongoService().get_cached_prediction(cache_key)
        if cached_result:
            return jsonify(cached_result)

        # Load data
        data_loader = CropDataLoader(farm_id)
        df = data_loader.load_crop_data(crop)
        if df.empty or df['yield'].isna().all():
            return jsonify({"error": "No valid crop yield data found"}), 400

        df = DataProcessor.ensure_numeric(df, ['yield'])

        # Setup model and trainer
        trainer = TFTTrainer(
            encoder_length=90,
            prediction_length=1,
            farm_id=farm_id,
            model_dir=MODEL_DIR
        )
        df_processed = trainer.preprocess(df)
        dataset = trainer.create_dataset(df_processed)

        try:
            # Try loading the pre-trained model
            model = TFTPredictor.load_best_model(farm_id, crop, dataset)
        except Exception as load_error:
            logger.warning(f"Model not found or failed to load. Training new model... {load_error}")

            # Train new model if loading fails
            model = trainer.train_model(dataset, crop)

        # Predict
        raw_preds, x = model.predict(df_processed.copy(), mode="raw")

        # Confidence & Feature Importance
        confidence = model.get_confidence_intervals(raw_preds, df)
        importance = model.get_feature_importance(raw_preds, df)

        # Fallback if median is invalid
        if confidence.get("median", 0) <= 0:
            historical_median = df['yield'].median()
            if historical_median > 0:
                confidence["median"] = historical_median

        # Mapping features
        static_feature_map = {
            "Feature_0": "crop",
            "Feature_1": "season",
            "Feature_2": "district",
            "Feature_3": "FARM_ID",
            "Feature_4": "latitude",
            "Feature_5": "longitude"
        }

        dynamic_feature_map = {
            "Feature_0": "time_idx",
            "Feature_1": "season_day",
            "Feature_2": "temperature_2m_mean",
            "Feature_3": "temperature_2m_max",
            "Feature_4": "temperature_2m_min",
            "Feature_5": "relative_humidity_2m_mean",
            "Feature_6": "wind_speed_10m_max",
            "Feature_7": "wind_direction_10m_dominant",
            "Feature_8": "precipitation_sum",
            "Feature_9": "shortwave_radiation_sum",
            "Feature_10": "surface_pressure_mean",
            "Feature_11": "cloud_cover_mean"
        }

        # Human-readable feature importance
        readable_importance = {
            "static_features": {
                static_feature_map.get(k, k): round(v, 2)
                for k, v in importance.get("static_features", {}).items()
            },
            "dynamic_features": {
                dynamic_feature_map.get(k, k): round(v, 2)
                for k, v in importance.get("dynamic_features", {}).items()
            }
        }

        # Yield unit conversions
        median_tph = confidence["median"]
        tph = lambda t: t if t else 0
        quintals_per_hectare = tph(median_tph) * 10
        kg_per_acre = tph(median_tph) * 1000 / 2.47105
        quintals_per_acre = kg_per_acre / 100

        def convert_ci(value):
            if value is None or pd.isna(value):
                return None
            kg_acre = value * 1000 / 2.47105
            return round(kg_acre / 100, 4)

        confidence_converted = {k: convert_ci(v) for k, v in confidence.items()}
        confidence_score = "high" if median_tph > 0 else "fallback (historical)"

        # Prepare response
        response = {
            "metadata": {
                "farm_id": farm_id,
                "crop": crop,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
                "prediction_quality": confidence_score,
                "RESULT": "GENUINE"
            },
            "yield_predictions": {
                "tonnes_per_hectare": round(median_tph, 4),
                "quintals_per_hectare": round(quintals_per_hectare, 4),
                "kg_per_acre": round(kg_per_acre, 2),
                "quintals_per_acre": round(quintals_per_acre, 4),
                "confidence_interval": {
                    **confidence_converted,
                    "unit": "quintals_per_acre"
                }
            },
            "feature_analysis": readable_importance,
            "units_info": {
                "base_unit": "tonnes_per_hectare",
                "conversions": {
                    "quintals_per_hectare = tonnes_per_hectare * 10": "q/ha",
                    "kg_per_acre = tonnes_per_hectare * 1000 / 2.47105": "kg/acre",
                    "quintals_per_acre = kg_per_acre / 100": "q/acre",
                    "quintal": "100 kg",
                    "hectare_to_acre": 2.47105
                }
            }
        }

        # Save to DB
        MongoService().cache_prediction(cache_key, response)
        MongoService().save_prediction({
            **response,
            "farm_id": farm_id,
            "crop": crop,
            "model_version": model.__class__.__name__,
            "created_at": datetime.utcnow(),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "predict_yield"
        })

        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)

        # Save error in DB
        MongoService().save_prediction({
            "farm_id": request.json.get('farm_id'),
            "crop": request.json.get('crop'),
            "error": str(e),
            "status": "error",
            "created_at": datetime.utcnow()
        })

        return jsonify({
            "metadata": {
                "farm_id": request.json.get('farm_id'),
                "crop": request.json.get('crop'),
                "timestamp": datetime.now().isoformat(),
                "status": "error",
                "error": str(e)
            },
            "yield_predictions": {
                "tonnes_per_hectare": 0.0,
                "confidence_interval": {
                    "low_98": 0.0, "low_90": 0.0, "low_75": 0.0,
                    "median": 0.0,
                    "high_75": 0.0, "high_90": 0.0, "high_98": 0.0,
                    "unit": "quintals_per_acre"
                }
            },
            "feature_analysis": {
                "static_features": {"Model Fallback": 1.0},
                "dynamic_features": {"Model Fallback": 1.0}
            }
        }), 500

@api_blueprint.route('/simulate-what-if', methods=['POST'])
def simulate_what_if_route():
    start_time = datetime.utcnow()

    # Default error response
    default_response = {
        "metadata": {
            "status": "error",
            "message": "Unknown error occurred",
            "timestamp": datetime.utcnow().isoformat()
        },
        "results": None
    }

    try:
        # Validate request
        payload = request.get_json()
        if not payload:
            default_response["metadata"]["message"] = "Request body must be JSON"
            return jsonify(default_response), 400

        required_fields = ["farm_id", "farm_name", "crop", "feature", "change_percent"]
        missing_fields = [f for f in required_fields if f not in payload]
        if missing_fields:
            default_response["metadata"]["message"] = f"Missing required fields: {', '.join(missing_fields)}"
            return jsonify(default_response), 400

        # Extract parameters
        farm_id = str(payload["farm_id"])
        farm_name = str(payload["farm_name"])
        crop = str(payload["crop"])
        feature = str(payload["feature"])

        try:
            change_percent = float(payload["change_percent"])
            if not (-100 <= change_percent <= 100):
                raise ValueError("Change percent must be between -100 and 100")
        except ValueError as e:
            default_response["metadata"]["message"] = f"Invalid change_percent: {str(e)}"
            return jsonify(default_response), 400

        days_affected = int(payload.get("days_affected", 7))
        if days_affected <= 0:
            default_response["metadata"]["message"] = "Days affected must be positive"
            return jsonify(default_response), 400

        # Check cache first
        cache_key = f"whatif_{farm_id}_{crop}_{feature}_{change_percent}_{days_affected}"
        cached_result = MongoService().get_cached_simulation(cache_key)
        if cached_result:
            return jsonify(cached_result)

        # Load data
        try:
            df = CropDataLoader(farm_id).load_crop_data(crop)
            if df.empty:
                default_response["metadata"]["message"] = f"No data available for crop {crop}"
                return jsonify(default_response), 404
        except Exception as e:
            default_response["metadata"]["message"] = f"Failed to load data: {str(e)}"
            return jsonify(default_response), 500

        # Preprocess data
        try:
            trainer = TFTTrainer(
                data_dir=MODEL_DIR,
                crop_list=[crop],
                farm_id=farm_id,
                model_dir=MODEL_DIR
            )
            processed_df = trainer.preprocess(df)
            dataset = trainer.create_dataset(processed_df)
        except Exception as e:
            default_response["metadata"]["message"] = f"Data preprocessing failed: {str(e)}"
            return jsonify(default_response), 500

        # Load or train model
        try:
            model = TFTPredictor.load_best_model(farm_id, crop, dataset)
        except Exception as e:
            try:
                # Train model if not found
                model = trainer.train_model(dataset, crop)
                model = TFTPredictor(model, dataset)
            except Exception as e:
                default_response["metadata"]["message"] = f"Model training failed: {str(e)}"
                return jsonify(default_response), 500

        # Run simulation
        try:
            simulation_result = model.simulate_what_if(
                df=processed_df,
                feature=feature,
                change_percent=change_percent,
                days_affected=days_affected
            )

            # Process results
            baseline_conf = simulation_result["baseline"]["confidence"]
            modified_conf = simulation_result["modified"]["confidence"]
            delta = simulation_result["delta"]
            percent_change = simulation_result["percent_change"]
            importance = simulation_result["baseline"]["feature_importance"]

            # Generate impact analysis
            median_delta = delta["median"]
            median_percent = percent_change["median"]

            if median_delta > 0:
                impact_msg = f"Potential yield increase of {median_delta:.2f} t/ha ({median_percent:.2f}%)"
                risk_level = "low" if median_percent < 10 else "medium" if median_percent < 25 else "high"
            elif median_delta < 0:
                impact_msg = f"Potential yield decrease of {abs(median_delta):.2f} t/ha ({abs(median_percent):.2f}%)"
                risk_level = "low" if abs(median_percent) < 10 else "medium" if abs(median_percent) < 25 else "high"
            else:
                impact_msg = "No significant impact detected"
                risk_level = "none"

            # Generate recommendations
            if risk_level == "high":
                recommendation = f"Consider testing {change_percent}% change in {feature} in controlled conditions before full implementation"
            elif risk_level == "medium":
                recommendation = f"Monitor closely if implementing {change_percent}% change in {feature}"
            else:
                recommendation = f"{change_percent}% change in {feature} appears safe to implement"

            # Prepare response
            response = {
                "metadata": {
                    "farm_id": farm_id,
                    "farm_name": farm_name,
                    "crop": crop,
                    "feature": feature,
                    "change_percent": change_percent,
                    "days_affected": days_affected,
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "success",
                    "model_version": "TFTPredictor",
                    "prediction_quality": "high"
                },
                "results": {
                    "baseline_confidence": {
                        "low_98": baseline_conf["low_98"],
                        "low_90": baseline_conf["low_90"],
                        "low_75": baseline_conf["low_75"],
                        "median": baseline_conf["median"],
                        "high_75": baseline_conf["high_75"],
                        "high_90": baseline_conf["high_90"],
                        "high_98": baseline_conf["high_98"]
                    },
                    "modified_confidence": {
                        "low_98": modified_conf["low_98"],
                        "low_90": modified_conf["low_90"],
                        "low_75": modified_conf["low_75"],
                        "median": modified_conf["median"],
                        "high_75": modified_conf["high_75"],
                        "high_90": modified_conf["high_90"],
                        "high_98": modified_conf["high_98"]
                    },
                    "delta": {
                        "low_98": delta["low_98"],
                        "low_90": delta["low_90"],
                        "low_75": delta["low_75"],
                        "median": delta["median"],
                        "high_75": delta["high_75"],
                        "high_90": delta["high_90"],
                        "high_98": delta["high_98"]
                    },
                    "percent_change": {
                        "low_98": percent_change["low_98"],
                        "low_90": percent_change["low_90"],
                        "low_75": percent_change["low_75"],
                        "median": percent_change["median"],
                        "high_75": percent_change["high_75"],
                        "high_90": percent_change["high_90"],
                        "high_98": percent_change["high_98"]
                    },
                    "feature_analysis": importance,
                    "impact_analysis": {
                        "primary_impact": impact_msg,
                        "recommendation": recommendation,
                        "risk_level": risk_level,
                        "secondary_impacts": [
                            {
                                "feature": feat,
                                "importance": imp,
                                "potential_impact": "Significant secondary impact" if imp > 10
                                                    else "Moderate secondary impact" if imp > 5
                                                    else "Minimal impact"
                            }
                            for feat, imp in importance["dynamic_features"].items()
                            if feat != feature and imp > 3
                        ]
                    }
                }
            }

            # Cache and save results
            MongoService().cache_simulation(cache_key, response)
            MongoService().save_whatif_simulation({
                "simulation_id": f"sim_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{farm_id}_{crop}",
                "farm_id": farm_id,
                "crop": crop,
                "simulation_type": "what-if",
                "modified_feature": feature,
                "modification_details": {
                    "change_percent": change_percent,
                    "days_affected": days_affected,
                    "applied_to": "last_n_days" if days_affected else "entire_period"
                },
                "yield_impact": {
                    "baseline_yield": baseline_conf["median"],
                    "modified_yield": modified_conf["median"],
                    "absolute_change": delta["median"],
                    "percent_change": percent_change["median"],
                    "confidence_impact": {
                        "low_98": delta["low_98"],
                        "high_98": delta["high_98"],
                        "confidence_range_change": (modified_conf["high_98"] - modified_conf["low_98"]) -
                                                  (baseline_conf["high_98"] - baseline_conf["low_98"])
                    }
                },
                "feature_analysis": {
                    "most_important_static": max(importance["static_features"].items(), key=lambda x: x[1], default=("None", 0)),
                    "most_important_dynamic": max(importance["dynamic_features"].items(), key=lambda x: x[1], default=("None", 0)),
                    "modified_feature_importance": importance["dynamic_features"].get(feature, 0)
                },
                "risk_assessment": {
                    "level": risk_level,
                    "factors": [
                        f"Modified feature: {feature} ({change_percent}%)",
                        f"Yield change: {percent_change['median']:.2f}%",
                        f"Confidence range change: {(modified_conf['high_98'] - modified_conf['low_98']) - (baseline_conf['high_98'] - baseline_conf['low_98']):.2f} t/ha"
                    ]
                },
                "temporal_data": {
                    "simulation_date": datetime.utcnow(),
                    "data_time_range": {
                        "start": df['date'].min().isoformat() if 'date' in df else None,
                        "end": df['date'].max().isoformat() if 'date' in df else None
                    }
                },
                "system_metadata": {
                    "model_version": "TFTPredictor",
                    "processing_time_ms": (datetime.utcnow() - start_time).total_seconds() * 1000,
                    "data_points_used": len(df)
                }
            })

            return jsonify(response)

        except Exception as e:
            default_response["metadata"]["message"] = f"Simulation failed: {str(e)}"
            return jsonify(default_response), 500

    except Exception as e:
        default_response["metadata"]["message"] = f"Unexpected error: {str(e)}"
        return jsonify(default_response), 500

def _generate_recommendation(feature, change_percent, impact_percent, risk_level):
    """Generate actionable recommendation based on simulation results"""
    if risk_level == "high":
        if impact_percent > 0:
            return f"Strongly recommend implementing {change_percent}% increase in {feature} for potential yield improvement"
        else:
            return f"Strongly recommend avoiding {change_percent}% decrease in {feature} due to significant yield risk"
    elif risk_level == "medium":
        return f"Consider testing {change_percent}% change in {feature} in controlled conditions before full implementation"
    else:
        if abs(impact_percent) < 5:
            return f"Change in {feature} shows minimal impact. Consider other factors for yield improvement"
        else:
            return f"Small but measurable impact from {feature} change. May combine with other optimizations"


#_____________________________________________________________________________________________________________________________________
@api_blueprint.route('/session', methods=['POST'])
def start_session():
    """Create a new session with proper synchronization"""
    try:
        if not request.json or not request.json.get('farm_id'):
            return jsonify({"error": "farm_id is required"}), 400

        farm_id = str(request.json['farm_id']).strip()
        chat_interface = AgriChatInterface()

        # Create new session
        session_id = chat_interface.create_session(farm_id)
        session = chat_interface.get_session(session_id)

        if not session:
            return jsonify({"error": "Session creation failed"}), 500

        return jsonify({
            "session_id": session_id,
            "farm_id": farm_id,
            "expires_at": session["expires_at"].isoformat(),
            "status": "created"
        })

    except Exception as e:
        logger.error(f"Session creation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/chat', methods=['POST'])
def chat_endpoint():
    """Handle chat messages with proper session validation"""
    try:
        if not request.json:
            return jsonify({"error": "Request body must be JSON"}), 400

        session_id = str(request.json.get('session_id', '')).strip()
        message = str(request.json.get('message', '')).strip()
        crop_data = request.json.get('crop_data', {})

        if not session_id or not message:
            return jsonify({"error": "session_id and message are required"}), 400

        chat_interface = AgriChatInterface()

        # Validate session
        session = chat_interface.get_session(session_id)
        if not session:
            return jsonify({
                "error": "Invalid or expired session",
                "solution": "Please create a new session with POST /session"
            }), 401

        # Process query
        response = chat_interface.process_query(
            session_id=session_id,
            query=message,
            crop_data=crop_data
        )

        return jsonify(response)

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/session/<session_id>', methods=['GET'])
def verify_session(session_id):
    """Verify session validity"""
    try:
        chat_interface = AgriChatInterface()
        session = chat_interface.get_session(session_id)

        if not session:
            return jsonify({
                "valid": False,
                "reason": "Session not found or expired"
            }), 404

        return jsonify({
            "valid": True,
            "session_id": session_id,
            "farm_id": session["farm_id"],
            "expires_at": session["expires_at"].isoformat(),
            "last_accessed": session["last_accessed"].isoformat()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/session/<session_id>/heartbeat', methods=['POST'])
def session_heartbeat(session_id):
    """Extend session lifetime"""
    chat_interface = AgriChatInterface()
    if chat_interface.validate_session(session_id):
        chat_interface.update_session_activity(session_id)
        return jsonify({"status": "updated"})
    return jsonify({"error": "Invalid session"}), 401

@api_blueprint.route('/session/<session_id>', methods=['GET'])
def get_session_info(session_id):
    """Get session information"""
    chat_interface = AgriChatInterface()
    if chat_interface.validate_session(session_id):
        session = chat_interface.sessions.get(session_id)
        return jsonify({
            "session_id": session_id,
            "farm_id": session["farm_id"],
            "expires_at": session["expires_at"].isoformat(),
            "active": True
        })
    return jsonify({"error": "Invalid session"}), 404

##---------------------------------------------------------------------------------------------------------------------------

# --- VISUALIZATION ROUTE ---
@api_blueprint.route('/visualize', methods=['POST'])
def visualize_data():
    """
    API endpoint for visualizing attention weights of the TFT model.
    Requires farm_id and crop to load relevant data and model.
    """
    try:
        # 1. Request Validation
        if not request.json or 'farm_id' not in request.json or 'crop' not in request.json:
            logger.warning("Visualization request missing 'farm_id' or 'crop'.")
            return jsonify({"error": "farm_id and crop are required"}), 400

        farm_id = str(request.json['farm_id']).strip()
        crop = str(request.json['crop']).strip()

        # 2. Data Loading
        data_loader = CropDataLoader(farm_id)
        df = pd.DataFrame()
        try:
            df = data_loader.load_crop_data(crop)
            if df.empty:
                logger.warning(f"No data found for visualization for farm '{farm_id}', crop '{crop}'.")
                return jsonify({"error": "No crop data available for visualization"}), 400
        except Exception as e:
            logger.error(f"Data loading failed for visualization for farm '{farm_id}', crop '{crop}': {e}", exc_info=True)
            return jsonify({"error": "Data loading failed for visualization", "details": str(e)}), 400

        # 3. Data Preprocessing for Visualization
        # Ensure 'yield' column exists and is numeric, fill NaNs
        df = DataProcessor.ensure_numeric(df, ['yield', 'time_idx'])
        if df['yield'].isna().all():
            logger.warning("Yield data is entirely missing or invalid after preprocessing for visualization.")
            return jsonify({"error": "Yield data is invalid for visualization"}), 400

        # Feature engineering (if required by your TFTTrainer/FeatureEngineer setup)
        try:
            # Assuming FeatureEngineer needs data_loader.config to initialize
            feature_engineer = FeatureEngineer(data_loader.config)
            # preprocess_data might return a tuple, ensure we only take the DataFrame
            df_processed, _ = feature_engineer.preprocess_data(df.copy())
            logger.info("Data successfully feature engineered for visualization.")
        except Exception as e:
            logger.error(f"Feature engineering failed for visualization: {e}", exc_info=True)
            return jsonify({"error": "Data processing failed for visualization", "details": str(e)}), 500

        # 4. Model Setup and Visualization
        plot_html = ""
        try:
            trainer = TFTTrainer(
                encoder_length=90, # Match training configuration
                prediction_length=1, # Match training configuration
                farm_id=farm_id,
                model_dir=MODEL_DIR
            )
            dataset = trainer.create_dataset(df_processed) # Create dataset from processed data
            model = TFTPredictor.load_best_model(farm_id, crop, dataset) # Load the trained model

            visualizer = AttentionVisualizer(predictor=model)
            # plot_attention_weights typically needs the processed DataFrame
            fig = visualizer.plot_attention_weights(df_processed)
            plot_html = fig.to_html(full_html=False) # Convert plot to HTML for embedding
            logger.info(f"Attention weights plot generated for farm '{farm_id}', crop '{crop}'.")
        except FileNotFoundError as e:
            logger.warning(f"Model checkpoint not found for visualization for farm '{farm_id}', crop '{crop}'. Error: {e}")
            return jsonify({"error": "Model not found for visualization. Please ensure it's trained."}), 500
        except Exception as e:
            logger.error(f"Visualization failed: {e}", exc_info=True)
            return jsonify({"error": "Visualization failed", "details": str(e)}), 500

        # 5. Return Response
        return jsonify({
            "plot_html": plot_html,
            "metadata": {
                "farm_id": farm_id,
                "crop": crop,
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
        })

    except Exception as e:
        logger.error(f"An unexpected error occurred during visualization: {e}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred during visualization", "details": str(e)}), 500