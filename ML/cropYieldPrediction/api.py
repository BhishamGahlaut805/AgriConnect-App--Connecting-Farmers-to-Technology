from flask import Blueprint, jsonify, request
from datetime import datetime
import logging
import pandas as pd
from typing import Dict, List
from .loadCropData import CropDataLoader
from .LSTMtrainer import LSTMTrainer
from .LSTMPredictor import LSTMPredictor
from .featureEngineer import FeatureEngineer
from .mongoDbSaving import MongoService
import numpy as np

# Initialize API components
api_blueprint = Blueprint('agri_api', __name__, url_prefix='/api/v1')
logger = logging.getLogger(__name__)
mongo_service = MongoService()

# Enhanced Configuration
CONFIG = {
    'model_dir': r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports",
    'training': {
        'batch_size': 32,
        'epochs': 5,
        'lr': 0.001,
        'patience': 15,
        'min_delta': 0.0001,
        'aux_weight': 0.3
    },
    'model': {
        'hidden_size': 128,
        'num_layers': 2,
        'dropout': 0.2,
        'bidirectional': True
    },
    'data': {
        'required_columns': [
            'farm_id', 'crop', 'season', 'year', 'window_num',
            'start_date', 'end_date', 'is_season_end', 'yield'
        ],
        'feature_columns': [
            'avg_temperature_2m_mean',
            'avg_precipitation_sum',
            'soil_pH',
            'organic_matter_content',
            'plant_population_density'
        ]
    },
    'min_samples': 10  # Minimum number of complete seasons required for training
}

def validate_input_data(data: Dict, required_fields: List[str]) -> Dict:
    """Validate input data and return error response if invalid"""
    if not all(k in data for k in required_fields):
        return {
            'error': 'Missing required fields',
            'required': required_fields,
            'received': list(data.keys()),
            'timestamp': datetime.now().isoformat()
        }
    return {}

@api_blueprint.route('/predict', methods=['POST'])
def predict_yield():
    """Endpoint for yield prediction using existing model"""
    try:
        data = request.json
        validation = validate_input_data(data, ['farm_id', 'crop'])
        if validation:
            return jsonify(validation), 400

        # Load and prepare data
        data_loader = CropDataLoader(data['farm_id'])
        df = data_loader.load_crop_data(data['crop'])

        # Initialize predictor
        predictor = LSTMPredictor(CONFIG)
        model_data = predictor.load_model(data['farm_id'], data['crop'])

        if not model_data:
            return jsonify({
                'error': 'Model not found',
                'solution': 'Train a model first using /train endpoint',
                'timestamp': datetime.now().isoformat()
            }), 404

        # Make prediction
        result = predictor.predict(model_data, df)
        if 'error' in result:
            return jsonify(result), 500

        # Prepare prediction document
        prediction_doc = {
            'farm_id': data['farm_id'],
            'crop': data['crop'],
            'predicted_yield': result['predicted_yield'],
            'attention_weights': result['attention_weights'],
            'feature_contributions': result.get('feature_contributions', {}),
            'input_stats': result.get('input_stats', {}),
            'model_version': model_data.get('timestamp', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'created_at': datetime.now()
        }

        # Save to MongoDB
        mongo_service.save_prediction(prediction_doc)

        # Prepare response
        response = {
            'status': 'success',
            'prediction': result['predicted_yield'],
            'attention_weights': result['attention_weights'],
            'feature_contributions': result.get('feature_contributions', {}),
            'timestamp': prediction_doc['timestamp']
        }

        logger.info(f"Prediction successful for farm {data['farm_id']}, crop {data['crop']}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@api_blueprint.route('/train', methods=['POST'])
def train_model():
    """Endpoint for training a new model"""
    try:
        data = request.json
        validation = validate_input_data(data, ['farm_id', 'crop'])
        if validation:
            return jsonify(validation), 400

        # Load and prepare data
        data_loader = CropDataLoader(data['farm_id'])
        df = data_loader.load_crop_data(data['crop'])

        # Feature engineering
        fe = FeatureEngineer(CONFIG)
        df, preprocess_data = fe.preprocess(df)

        # Prepare sequences
        sequences, targets, metadata = data_loader.get_seasonal_data(df)

        # Validate training data
        if len(sequences) < CONFIG['min_samples']:
            return jsonify({
                'error': 'Insufficient training data',
                'samples': len(sequences),
                'minimum_required': CONFIG['min_samples'],
                'timestamp': datetime.now().isoformat()
            }), 400

        # Train model
        trainer = LSTMTrainer(CONFIG)
        model_path = trainer.train(
            sequences,
            targets,
            # preprocess_data['importance'],
            data['farm_id'],
            data['crop']
        )

        # Prepare metadata document
        metadata = {
            'farm_id': data['farm_id'],
            'crop': data['crop'],
            'model_path': model_path,
            'features_used': list(preprocess_data['importance'].keys()),
            'feature_importance': preprocess_data['importance'],
            'training_samples': len(sequences),
            'created_at': datetime.now(),
            'average_yield': float(np.mean(targets)),
            'yield_range': {
                'min': float(np.min(targets)),
                'max': float(np.max(targets))
            }
        }

        # Save to MongoDB
        mongo_service.save_model_metadata(metadata)

        return jsonify({
            'status': 'success',
            'farm_id': data['farm_id'],
            'crop': data['crop'],
            'samples': len(sequences),
            'features': metadata['features_used'],
            'average_yield': metadata['average_yield'],
            'model_path': model_path,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Training error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Training failed',
            'details': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@api_blueprint.route('/simulate', methods=['POST'])
def simulate_scenarios():
    """Endpoint for what-if scenario analysis"""
    try:
        data = request.json
        validation = validate_input_data(data, ['farm_id', 'crop', 'scenarios'])
        if validation:
            return jsonify(validation), 400

        # Load data and model
        data_loader = CropDataLoader(data['farm_id'])
        df = data_loader.load_crop_data(data['crop'])

        predictor = LSTMPredictor(CONFIG)
        model_data = predictor.load_model(data['farm_id'], data['crop'])

        if not model_data:
            return jsonify({
                'error': 'Model not found',
                'timestamp': datetime.now().isoformat()
            }), 404

        # Run scenarios
        results = predictor.what_if(model_data, df, data['scenarios'])
        if 'error' in results:
            return jsonify(results), 500

        # Prepare simulation document
        simulation_doc = {
            'farm_id': data['farm_id'],
            'crop': data['crop'],
            'baseline': {
                'prediction': results['baseline']['predicted_yield'],
                'attention_weights': results['baseline']['attention_weights']
            },
            'scenarios': [],
            'model_version': model_data.get('timestamp', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'created_at': datetime.now()
        }

        # Add scenario results
        for name, result in results.items():
            if name == 'baseline':
                continue

            simulation_doc['scenarios'].append({
                'name': name,
                'prediction': result['prediction'],
                'difference': result['difference'],
                'attention_changes': result['attention_changes']
            })

        # Save to MongoDB
        mongo_service.save_simulation(simulation_doc)

        return jsonify({
            'status': 'success',
            'results': results,
            'timestamp': simulation_doc['timestamp']
        })

    except Exception as e:
        logger.error(f"Simulation error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Simulation failed',
            'details': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@api_blueprint.route('/model-info/<farm_id>/<crop>', methods=['GET'])
def get_model_info(farm_id: str, crop: str):
    """Endpoint to get model information"""
    try:
        metadata = mongo_service.get_model_metadata(farm_id, crop)
        if not metadata:
            return jsonify({
                'error': 'Model metadata not found',
                'timestamp': datetime.now().isoformat()
            }), 404

        # Remove MongoDB _id field
        metadata.pop('_id', None)

        return jsonify({
            'status': 'success',
            'model_info': metadata,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Model info error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to retrieve model info',
            'details': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500