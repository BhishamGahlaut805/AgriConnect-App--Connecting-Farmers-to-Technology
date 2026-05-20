import torch  # type:ignore
import os
import io
from datetime import datetime
from typing import Optional, Dict
from sklearn.preprocessing import MinMaxScaler

from .dependencies import logger
from .mongoDbSaving import MongoService


def save_lstm_model(
    model,
    scalers,
    farm_id: str,
    crop_name: str,
    config: dict
) -> str:
    """
    Save LSTM model directly into MongoDB GridFS
    """

    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create in-memory buffer
        buffer = io.BytesIO()

        # Save checkpoint into memory
        torch.save(
            {
                "model_state": model.state_dict(),
                "scaler_state": {
                    k: v.__dict__
                    for k, v in scalers.items()
                },
                "config": config,
                "feature_columns": model.feature_columns,
                "timestamp": timestamp
            },
            buffer
        )

        buffer.seek(0)

        mongo_service = MongoService()

        # Store model in MongoDB GridFS
        file_id = mongo_service.save_model_file(
            file_bytes=buffer.read(),
            filename=f"{farm_id}_{crop_name}_lstm.pt",
            metadata={
                "farm_id": farm_id,
                "crop_name": crop_name,
                "model_type": "LSTM",
                "version": timestamp
            }
        )

        # Save metadata
        metadata = {
            "farm_id": farm_id,
            "crop": crop_name,
            "model_type": "LSTM",
            "gridfs_file_id": file_id,
            "input_features": model.feature_columns,
            "model_size": sum(
                p.numel()
                for p in model.parameters()
            ),
            "created_at": datetime.utcnow(),
            "version": timestamp
        }

        mongo_service.save_model_metadata(metadata)

        logger.info(
            f"Successfully saved LSTM model to MongoDB GridFS | "
            f"Farm: {farm_id} | Crop: {crop_name}"
        )

        return str(file_id)

    except Exception as e:
        logger.error(f"Failed to save model: {str(e)}")
        raise


def load_latest_lstm_model(
    farm_id: str,
    crop_name: str
) -> Optional[Dict]:
    """
    Load latest LSTM model from MongoDB GridFS
    """

    try:
        mongo_service = MongoService()

        # Load model bytes from GridFS
        model_bytes = mongo_service.load_model_file(
            farm_id=farm_id,
            crop_name=crop_name
        )

        if not model_bytes:
            logger.warning(
                f"No model found for farm={farm_id}, crop={crop_name}"
            )
            return None

        # Convert bytes to memory buffer
        buffer = io.BytesIO(model_bytes)

        # Load torch checkpoint
        checkpoint = torch.load(
            buffer,
            map_location=torch.device("cpu")
        )

        # Rebuild scalers
        scalers = {}

        for col, state in checkpoint["scaler_state"].items():

            scaler = MinMaxScaler()

            scaler.__dict__.update(state)

            scalers[col] = scaler

        logger.info(
            f"Successfully loaded model from MongoDB GridFS | "
            f"Farm: {farm_id} | Crop: {crop_name}"
        )

        return {
            "model_state": checkpoint["model_state"],
            "scalers": scalers,
            "config": checkpoint["config"],
            "feature_columns": checkpoint["feature_columns"],
            "timestamp": checkpoint["timestamp"]
        }

    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        return None
    