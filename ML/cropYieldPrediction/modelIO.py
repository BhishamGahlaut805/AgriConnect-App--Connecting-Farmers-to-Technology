import torch    #type:ignore
import os
import json
from datetime import datetime
from typing import Optional, Dict
from .dependencies import logger, MODEL_DIR
from .mongoDbSaving import MongoService
from sklearn.preprocessing import MinMaxScaler

def save_lstm_model(model, scalers, farm_id: str, crop_name: str, config: dict) -> str:
    """Save LSTM model with all necessary components"""
    try:
        model_dir = os.path.join(MODEL_DIR, farm_id,"crops", crop_name.replace(" ", "_"))
        os.makedirs(model_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_path = os.path.join(model_dir, "model_latest.pt")

        # Save model checkpoint
        torch.save({
            'model_state': model.state_dict(),
            'scaler_state': {k: v.__dict__ for k, v in scalers.items()},
            'config': config,
            'feature_columns': model.feature_columns,
            'timestamp': timestamp
        }, model_path)

        # Save metadata
        metadata = {
            "farm_id": farm_id,
            "crop": crop_name,
            "model_type": "LSTM",
            "model_path": model_path,
            "input_features": model.feature_columns,
            "model_size": sum(p.numel() for p in model.parameters()),
            "created_at": datetime.now()
        }

        # Save to MongoDB
        MongoService().save_model_metadata(metadata)

        logger.info(f"Saved LSTM model to {model_path}")
        return model_path

    except Exception as e:
        logger.error(f"Failed to save model: {str(e)}")
        raise

def load_latest_lstm_model(farm_id: str, crop_name: str) -> Optional[Dict]:
    """Load the most recent LSTM model for a farm/crop"""
    try:
        model_dir = os.path.join(MODEL_DIR, farm_id,"crops", crop_name.replace(" ", "_"))

        if not os.path.exists(model_dir):
            return None

        # Find latest model file
        model_files = sorted(
            [f for f in os.listdir(model_dir) if f.startswith("model_") and f.endswith(".pt")],
            key=lambda x: os.path.getmtime(os.path.join(model_dir, x)),
            reverse=True
        )

        if not model_files:
            return None

        # Load checkpoint
        checkpoint = torch.load(os.path.join(model_dir, model_files[0]))

        # Rebuild scalers
        scalers = {}
        for col, state in checkpoint['scaler_state'].items():
            scaler = MinMaxScaler()
            scaler.__dict__.update(state)
            scalers[col] = scaler

        return {
            "model_state": checkpoint['model_state'],
            "scalers": scalers,
            "config": checkpoint['config'],
            "feature_columns": checkpoint['feature_columns'],
            "timestamp": checkpoint['timestamp']
        }

    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        return None