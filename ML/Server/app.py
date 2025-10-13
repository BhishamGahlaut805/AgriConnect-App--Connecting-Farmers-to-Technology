import os
from flask import Flask, request, jsonify, Blueprint
from werkzeug.utils import secure_filename
from ..CropDiseaseOutbreakPredictor.DataService.CropReports import CropDiseasePredictor
from dotenv import load_dotenv
from flask_cors import CORS #type:ignore
load_dotenv()
# from ..LLM.api import agribot_bp
# from ..LLM.Routes.llmRoutes import llm_bp
app = Flask(__name__)
CORS(app, supports_credentials=True,
     resources={r"/*": {"origins": ["http://localhost:5173","https://j2rgc684-5173.inc1.devtunnels.ms","https://j2rgc684-5000.inc1.devtunnels.ms"]}})
# Set a secret key for sessions
app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecretkey123")


config_path=r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\CropVsWeed\Config.py"
app.config.from_pyfile(config_path)
from flask_socketio import SocketIO
from ..CropVsWeed.api import weed_bp, generate_frames, camera_manager

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173"], async_mode="threading")

# Register blueprints
app.register_blueprint(weed_bp)

# SocketIO events
@socketio.on('connect', namespace='/weed')
def handle_connect():
    print('Client connected to weed namespace')

@socketio.on('disconnect', namespace='/weed')
def handle_disconnect():
    print('Client disconnected from weed namespace')

@socketio.on('start_stream', namespace='/weed')
def handle_start_stream(data):
    stream_type = data.get('type', 'webcam')
    print(f'Starting {stream_type} stream')

    # Start streaming in a background thread
    socketio.start_background_task(target=generate_frames, socketio=socketio)

@socketio.on('stop_stream', namespace='/weed')
def handle_stop_stream():
    global camera_manager
    camera_manager.set_streaming(False)
    print('Stream stopped by client')

predictor = CropDiseasePredictor()

from ..cropYieldPrediction.api import api_blueprint
from ..MongoDBService.CreateFarm import CreateFarmService
from ..API.Agromonitoring import AgroMonitoringAPI
from ..GeoSpatial.Haversine import HaversineDistance
from ..MongoDBService.DiseaseReportService import DiseaseReportService
import time
from datetime import datetime
from ..DataService.PrepareData import DataService
from ..MarketPrice.MarketPrices import market_prices_bp
from ..WeatherSection.api import weather_bp
from ..FarmModels.api import CropRecommendationBp
from ..CropVsWeed.api import weed_bp

#--------------------------------------------
#Weather data processing
from ..API.OpenMeteoAPI import WeatherDataProcessor
from ..DataService.YieldData import AgriDatasetGenerator

# static_params = {
#     'soil_type': 'clay',
#     'soil_pH': 6.8,
#     'organic_matter_content': 2.5,
#     'irrigation_type': 'drip',
#     'tillage_type': 'minimum',
#     'sowing_method': 'drilling',
#     'fertilizer_type_used': 'DAP',
#     'seed_variety': 'hybrid',
#     'plant_population_density': 55000
# }

# generator = AgriDatasetGenerator(
#     farm_id="New_Test_Farm_Yield_Data",
#     farm_name="New_Test_Farm_Yield_Data",
#     latitude=28.6139,
#     longitude=77.5946,
#     static_features=static_params
# )
# generator.generate()

# Initialize DataService
data_service = DataService()
# data_service.force_rerun_for_farm("FARM_1752027955_D52242", confirm=True)
data_service.run_once_a_day()

from ..CropDiseaseOutbreakPredictor.LSTM.LSTMOutBreak import LSTMOutbreakPredictor
predictorLSTM = LSTMOutbreakPredictor()

# Normal daily training
predictorLSTM.run_for_all_farms()

# Dev option: Uncomment below to force rerun for specific farm
# predictor.force_rerun_for_farm("FARM_1752027955_D52242")
# predictor.train_and_predict(predictor.farm_col.find_one({"farm_id": "FARM_1752027955_D52242"}))

from ..MongoDBService.UpdateService import SummaryUpdateService
summary_service = SummaryUpdateService()
summary_service.run_all()

@app.route('/static/uploads/<farm_id>/<filename>')
def serve_image(farm_id, filename):
    return send_from_directory(os.path.join('static', 'uploads', farm_id), filename)

import os
import uuid
from datetime import datetime
from flask import request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

@app.route('/api/predictDisease', methods=['POST'])
def predict_disease():
    try:
        results = []
        diseased_count = 0
        total_count = 0

        # Get model type
        model_type = request.form.get('model_type', 'all').lower() if request.form else request.args.get('model_type', 'all').lower()
        if model_type not in ['potato', 'cotton', 'all']:
            return jsonify({"error": "Invalid model_type. Choose from 'potato', 'cotton', 'all'"}), 400

        # Common params
        farm_id = request.form.get('farm_id', 'unknown_farm')
        farm_name = request.form.get('farm_name', 'Unknown Farm')

        # Create directory for farm uploads
        upload_root = os.path.join('static', 'uploads', farm_id)
        os.makedirs(upload_root, exist_ok=True)

        # Handle FORM-DATA
        if 'image' in request.files:
            images = request.files.getlist('image')

            # Optional coordinates
            lat_list = request.form.get('latitude', '')
            lon_list = request.form.get('longitude', '')
            latitudes = [float(x.strip()) for x in lat_list.split(',') if x.strip()]
            longitudes = [float(x.strip()) for x in lon_list.split(',') if x.strip()]

            for i, image in enumerate(images):
                ext = os.path.splitext(image.filename)[-1]
                unique_name = f"{uuid.uuid4().hex}{ext}"
                save_path = os.path.join(upload_root, unique_name)
                image.save(save_path)

                total_count += 1
                result = predictor.predict_crop_disease(save_path, model_type)

                result["image"] = unique_name
                result["image_url"] = f"{request.host_url.rstrip('/')}/static/uploads/{farm_id}/{unique_name}"
                result["latitude"] = latitudes[i] if i < len(latitudes) else None
                result["longitude"] = longitudes[i] if i < len(longitudes) else None

                if result["disease"].lower() != "healthy":
                    diseased_count += 1

                DiseaseReportService.save_report({
                    "farm_name": farm_name,
                    "farm_id": farm_id,
                    "latitude": result["latitude"],
                    "longitude": result["longitude"],
                    "crop": result["crop"],
                    "disease": result["disease"],
                    "confidence": result["confidence"],
                    "image_path": unique_name,
                    "timestamp": datetime.utcnow()
                })

                results.append(result)

        # Handle JSON Input (Path-based prediction)
        elif request.content_type == 'application/json':
            data = request.get_json()
            image_paths = data.get('images', [])
            coordinates = data.get('coordinates', [])  # List of {lat, lon}
            farm_name = data.get('farm_name', 'Unknown Farm')
            farm_id = data.get('farm_id', 'unknown_farm')

            for i, image_path in enumerate(image_paths):
                if not os.path.exists(image_path):
                    results.append({"image": image_path, "error": "Image path not found"})
                    continue

                total_count += 1
                result = predictor.predict_crop_disease(image_path, model_type)

                filename = os.path.basename(image_path)
                result["image"] = filename
                host_url=os.getenv("HOST_URL","http://localhost:5000")
                result["image_url"] = f"{host_url}/static/uploads/{farm_id}/{filename}"

                coord = coordinates[i] if i < len(coordinates) else {}
                result["latitude"] = coord.get("lat")
                result["longitude"] = coord.get("lon")

                if result["disease"].lower() != "healthy":
                    diseased_count += 1

                DiseaseReportService.save_report({
                    "farm_name": farm_name,
                    "farm_id": farm_id,
                    "latitude": result["latitude"],
                    "longitude": result["longitude"],
                    "crop": result["crop"],
                    "disease": result["disease"],
                    "confidence": result["confidence"],
                    "image_path": filename,
                    "timestamp": datetime.utcnow()
                })

                results.append(result)

        else:
            return jsonify({"error": "Unsupported content type. Use form-data or JSON."}), 400

        # Update Farm Summary
        if farm_id:
            CreateFarmService.update_farm_analysis_stats(
                farm_id,
                total_count,
                diseased_count
            )

        return jsonify({
            "total_images": total_count,
            "diseased_images": diseased_count,
            "results": results
        })

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

CreateFarmService = CreateFarmService()
agro_api = AgroMonitoringAPI()
haversine = HaversineDistance()
@app.route('/api/createFarm', methods=['POST'])
def create_farm():
    data = request.get_json()
    print(f"[INFO] Received data for farm creation: {data}")
    required_fields = ['latitude', 'longitude', 'farm_name', 'user_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing one or more required fields"}), 400

    try:
        lat = float(data['latitude'])
        lon = float(data['longitude'])
        farm_name = data['farm_name']
        user_id = data['user_id']

        # 1. Agro polygon
        offset = 0.0015
        polygon_coordinates = [
            [lon - offset, lat - offset],
            [lon + offset, lat - offset],
            [lon + offset, lat + offset],
            [lon - offset, lat + offset],
            [lon - offset, lat - offset]
        ]
        unique_polygon_name = f"{farm_name}_{int(time.time())}"
        polygon_info = agro_api.create_polygon(unique_polygon_name, polygon_coordinates)

        # 2. Create Folder
        base_path = os.path.dirname(os.path.abspath(__file__))
        folder_path = os.path.join(base_path, "..","TrainingReports", farm_name.replace(" ", "_"))
        folder_path = os.path.abspath(folder_path)
        os.makedirs(folder_path, exist_ok=True)

        # 3. Get all farms and check for nearby
        all_farms = CreateFarmService.get_all_farms()
        nearby_farms = []

        for farm in all_farms:
            other_lat = farm.get("latitude")
            other_lon = farm.get("longitude")
            if other_lat and other_lon:
                distance = haversine.haversine(lat, lon, other_lat, other_lon)
                if distance <= 4:
                    nearby_farms.append({
                        "farm_id": farm.get("farm_id"),
                        "farm_name": farm.get("farm_name"),
                        "latitude": other_lat,
                        "longitude": other_lon,
                        "distance_km": round(distance, 2)
                    })

        # 4. Insert new farm with nearby
        farm_data = {
            "farm_name": farm_name,
            "latitude": lat,
            "longitude": lon,
            "user_id": user_id,
            "report_folder": folder_path,
            "nearby_farms": nearby_farms,
            "agro_polygon": {
                "polygon_id": polygon_info.get("id"),
                "area": polygon_info.get("area"),
                "center": polygon_info.get("center"),
                "created_at": polygon_info.get("created_at"),
                "geo_json": polygon_info.get("geo_json")
            }
        }

        # Check for existing farm and insert/update accordingly
        from pymongo import UpdateOne
        db = CreateFarmService.db
        existing_farm = db.farms.find_one({
            "user_id": user_id,
            "farm_name": farm_name,
            "latitude": lat,
            "longitude": lon
        })

        update_fields = {
            "report_folder": folder_path,
            "nearby_farms": nearby_farms,
            "agro_polygon": {
                "polygon_id": polygon_info.get("id"),
                "area": polygon_info.get("area"),
                "center": polygon_info.get("center"),
                "created_at": polygon_info.get("created_at"),
                "geo_json": polygon_info.get("geo_json")
            }
        }

        result = db.farms.update_one(
            {
                "user_id": user_id,
                "farm_name": farm_name,
                "latitude": lat,
                "longitude": lon
            },
            {
                "$set": update_fields
            },
            upsert=True
        )

        # If inserted, result.upserted_id is the new farm's ID
        new_farm_id = result.upserted_id or existing_farm.get("_id") if existing_farm else None


        # 5. Update nearby_farms of other farms to include this new one
        for farm in all_farms:
            other_lat = farm.get("latitude")
            other_lon = farm.get("longitude")
            if other_lat and other_lon:
                distance = haversine.haversine(lat, lon, other_lat, other_lon)
                if distance <= 4:
                    update_entry = {
                        "farm_id": new_farm_id,
                        "farm_name": farm_name,
                        "latitude": lat,
                        "longitude": lon,
                        "distance_km": round(distance, 2)
                    }
                    existing_nearby = farm.get("nearby_farms", [])
                    if not any(f["farm_id"] == new_farm_id for f in existing_nearby):
                        existing_nearby.append(update_entry)
                        CreateFarmService.update_farm_nearby(farm["farm_id"], existing_nearby)
            # 6. Preparing the Dataset for the Farm
                generator1= AgriDatasetGenerator(
                farm_id=new_farm_id,
                farm_name=farm_name,
                latitude=float(data['latitude']),
                longitude=float(data['longitude']),
                static_features=data.get('static_features', {})
            )

        generator1.generate()
        return jsonify({
            "message": "Farm created successfully with folder and nearby updates",
            "farm_id": new_farm_id,
            "polygon_id": polygon_info.get("id"),
            "report_folder": folder_path,
            "nearby_farms_found": len(nearby_farms)
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to create farm: {str(e)}"}), 500

# api_blueprint = Blueprint('agri_api', __name__, url_prefix='/api/v1')
app.register_blueprint(api_blueprint)
app.register_blueprint(market_prices_bp)
app.register_blueprint(weather_bp, url_prefix='/weather')
app.register_blueprint(CropRecommendationBp)
# app.register_blueprint(agribot_bp)

# #llm routes
# from ..LLM.Routes.llmRoutes import llm_bp, initialize_llm_manager
# from ..LLM.mongoManager import MongoDBManager
# from ..LLM.config import MONGODB_URI, DATABASE_NAME
# llm_mongo = MongoDBManager(MONGODB_URI, DATABASE_NAME)
# llm_db = llm_mongo.db
#  # Initialize LLM Manager
# llm_manager = initialize_llm_manager(llm_db)
# llm_bp.llm_manager = llm_manager
# llm_bp.db = llm_db
# app.register_blueprint(llm_bp, url_prefix="/api/llm")

from ..LLM.api import Agribot_bp1
app.register_blueprint(Agribot_bp1, url_prefix="/api/agribot")

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5500)

