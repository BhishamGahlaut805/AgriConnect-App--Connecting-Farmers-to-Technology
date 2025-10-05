import os
import yaml # type: ignore
import logging
from datetime import datetime
from typing import Dict, Any

# Configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.yaml")
MODEL_DIR = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports"
os.makedirs(MODEL_DIR, exist_ok=True)

def load_config() -> Dict[str, Any]:
    try:
        with open(CONFIG_PATH) as f:
            config = yaml.safe_load(f) or {}
        # Set defaults
        config.setdefault('training', {'batch_size': 32, 'epochs': 50, 'lr': 0.001})
        config.setdefault('model', {'hidden_size': 64, 'num_layers': 2})
        return config
    except Exception as e:
        logging.warning(f"Using default config due to error: {str(e)}")
        return {
            'training': {'batch_size': 32, 'epochs': 50, 'lr': 0.001},
            'model': {'hidden_size': 64, 'num_layers': 2}
        }

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('agrisupport.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()