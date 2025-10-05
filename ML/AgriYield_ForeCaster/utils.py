import os
import logging
from functools import wraps
from flask import jsonify
from datetime import datetime, timedelta
from pytorch_forecasting import TemporalFusionTransformer

from .Modeling.TFTPredictor import TFTPredictor

# ------------------------- Error Handling Wrapper -------------------------
def error_handler(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except FileNotFoundError as e:
            logging.warning(f"[404] Resource not found: {str(e)}")
            return jsonify({"error": "Requested resource not found"}), 404
        except ValueError as e:
            logging.warning(f"[400] Bad request: {str(e)}")
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            logging.error(f"[500] Internal error: {str(e)}", exc_info=True)
            return jsonify({"error": "Internal server error"}), 500
    return wrapper

# ------------------------- Session Validation -------------------------
def validate_session(session_id: str) -> bool:
    """Validate session ID format and ensure it's not expired (1 hour TTL)"""
    if not session_id or '_' not in session_id:
        return False

    try:
        _, timestamp = session_id.rsplit('_', 1)
        session_time = datetime.strptime(timestamp, '%Y%m%d%H%M%S')
        return (datetime.now() - session_time) < timedelta(hours=1)
    except Exception:
        return False

# ------------------------- TFT Model Loader -------------------------
def load_tft_model(farm_id: str, crop_name: str, dataset=None) -> TFTPredictor:
    """
    Load the trained Temporal Fusion Transformer model and wrap it with TFTPredictor.

    Args:
        farm_id: Farm identifier
        crop_name: Crop name
        dataset: TimeSeriesDataSet (required for TFTPredictor)

    Returns:
        TFTPredictor object
    """
    model_path = f"trainedCropModels/{farm_id}/{crop_name}/best_model.ckpt"

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No model found for crop '{crop_name}' in farm '{farm_id}'")

    if dataset is None:
        raise ValueError("TimeSeriesDataSet must be provided to load TFTPredictor")

    model = TemporalFusionTransformer.load_from_checkpoint(model_path)
    return TFTPredictor(model=model, dataset=dataset)
