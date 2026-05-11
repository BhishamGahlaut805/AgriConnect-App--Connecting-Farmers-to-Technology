import os
import time
import uuid
from datetime import datetime

from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory
)

from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# =========================================================
# LOAD ENV VARIABLES
# =========================================================
load_dotenv()

# =========================================================
# FLASK APP INITIALIZATION
# =========================================================
app = Flask(__name__)

# =========================================================
# FRONTEND URL
# =========================================================
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# =========================================================
# CORS CONFIGURATION
# =========================================================
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                FRONTEND_URL
            ]
        }
    }
)

# =========================================================
# SECRET KEY
# =========================================================
app.secret_key = os.getenv(
    "FLASK_SECRET_KEY",
    "supersecretkey123"
)

# =========================================================
# CONFIGURATION
# =========================================================
from config import Config

app.config.from_object(Config)

# =========================================================
# SOCKET.IO INITIALIZATION
# =========================================================
socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://localhost:5173",
        FRONTEND_URL
    ],
    async_mode="threading"
)

# =========================================================
# IMPORT MODULES
# =========================================================
from ..CropVsWeed.api import (
    weed_bp,
    generate_frames,
    camera_manager
)

from ..CropDiseaseOutbreakPredictor.DataService.CropReports import (
    CropDiseasePredictor
)

from ..cropYieldPrediction.api import api_blueprint

from ..MongoDBService.CreateFarm import CreateFarmService

from ..API.Agromonitoring import AgroMonitoringAPI

from ..GeoSpatial.Haversine import HaversineDistance

from ..MongoDBService.DiseaseReportService import (
    DiseaseReportService
)

from ..MarketPrice.MarketPrices import market_prices_bp

from ..WeatherSection.api import weather_bp

from ..FarmModels.api import CropRecommendationBp

from ..API.OpenMeteoAPI import WeatherDataProcessor

from ..DataService.YieldData import AgriDatasetGenerator

from ..LLM.api import Agribot_bp1

# =========================================================
# REGISTER BLUEPRINTS
# =========================================================
app.register_blueprint(weed_bp)
app.register_blueprint(api_blueprint)
app.register_blueprint(market_prices_bp)
app.register_blueprint(weather_bp, url_prefix='/weather')
app.register_blueprint(CropRecommendationBp)
app.register_blueprint(Agribot_bp1, url_prefix="/api/agribot")

# =========================================================
# SOCKET EVENTS
# =========================================================
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

    socketio.start_background_task(
        target=generate_frames,
        socketio=socketio
    )


@socketio.on('stop_stream', namespace='/weed')
def handle_stop_stream():
    global camera_manager

    camera_manager.set_streaming(False)

    print('Stream stopped by client')

# =========================================================
# LAZY LOADING MODELS
# =========================================================
predictor = None


def get_predictor():
    global predictor

    if predictor is None:
        predictor = CropDiseasePredictor()

    return predictor

# =========================================================
# OPTIONAL BACKGROUND TASKS
# KEEP DISABLED ON RENDER FREE TIER
# =========================================================

# from ..DataService.PrepareData import DataService
# data_service = DataService()
# data_service.run_once_a_day()

# from ..CropDiseaseOutbreakPredictor.LSTM.LSTMOutBreak import LSTMOutbreakPredictor
# predictorLSTM = LSTMOutbreakPredictor()
# predictorLSTM.run_for_all_farms()

# from ..MongoDBService.UpdateService import SummaryUpdateService
# summary_service = SummaryUpdateService()
# summary_service.run_all()

# =========================================================
# STATIC IMAGE ROUTE
# =========================================================
@app.route('/static/uploads/<farm_id>/<filename>')
def serve_image(farm_id, filename):
    return send_from_directory(
        os.path.join('static', 'uploads', farm_id),
        filename
    )

# =========================================================
# DISEASE PREDICTION API
# =========================================================
@app.route('/api/predictDisease', methods=['POST'])
def predict_disease():
    try:
        results = []
        diseased_count = 0
        total_count = 0

        model_type = (
            request.form.get('model_type', 'all').lower()
            if request.form
            else request.args.get('model_type', 'all').lower()
        )

        if model_type not in ['potato', 'cotton', 'all']:
            return jsonify({
                "error": "Invalid model_type"
            }), 400

        farm_id = request.form.get(
            'farm_id',
            'unknown_farm'
        )

        farm_name = request.form.get(
            'farm_name',
            'Unknown Farm'
        )

        upload_root = os.path.join(
            'static',
            'uploads',
            farm_id
        )

        os.makedirs(upload_root, exist_ok=True)

        # =====================================================
        # FORM DATA IMAGE UPLOAD
        # =====================================================
        if 'image' in request.files:

            images = request.files.getlist('image')

            lat_list = request.form.get('latitude', '')
            lon_list = request.form.get('longitude', '')

            latitudes = [
                float(x.strip())
                for x in lat_list.split(',')
                if x.strip()
            ]

            longitudes = [
                float(x.strip())
                for x in lon_list.split(',')
                if x.strip()
            ]

            for i, image in enumerate(images):

                ext = os.path.splitext(image.filename)[-1]

                unique_name = f"{uuid.uuid4().hex}{ext}"

                save_path = os.path.join(
                    upload_root,
                    unique_name
                )

                image.save(save_path)

                total_count += 1

                predictor = get_predictor()

                result = predictor.predict_crop_disease(
                    save_path,
                    model_type
                )

                result["image"] = unique_name

                result["image_url"] = (
                    f"{request.host_url.rstrip('/')}"
                    f"/static/uploads/{farm_id}/{unique_name}"
                )

                result["latitude"] = (
                    latitudes[i]
                    if i < len(latitudes)
                    else None
                )

                result["longitude"] = (
                    longitudes[i]
                    if i < len(longitudes)
                    else None
                )

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

        # =====================================================
        # JSON BASED PREDICTION
        # =====================================================
        elif request.content_type == 'application/json':

            data = request.get_json()

            image_paths = data.get('images', [])
            coordinates = data.get('coordinates', [])

            farm_name = data.get(
                'farm_name',
                'Unknown Farm'
            )

            farm_id = data.get(
                'farm_id',
                'unknown_farm'
            )

            for i, image_path in enumerate(image_paths):

                if not os.path.exists(image_path):
                    results.append({
                        "image": image_path,
                        "error": "Image path not found"
                    })
                    continue

                total_count += 1

                predictor = get_predictor()

                result = predictor.predict_crop_disease(
                    image_path,
                    model_type
                )

                filename = os.path.basename(image_path)

                host_url = os.getenv(
                    "HOST_URL",
                    "http://localhost:5500"
                )

                result["image"] = filename

                result["image_url"] = (
                    f"{host_url}/static/uploads/"
                    f"{farm_id}/{filename}"
                )

                coord = (
                    coordinates[i]
                    if i < len(coordinates)
                    else {}
                )

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
            return jsonify({
                "error": "Unsupported content type"
            }), 400

        # =====================================================
        # UPDATE FARM STATS
        # =====================================================
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

        return jsonify({
            "error": f"Prediction failed: {str(e)}"
        }), 500

# =========================================================
# FARM SERVICES
# =========================================================
CreateFarmService = CreateFarmService()

agro_api = AgroMonitoringAPI()

haversine = HaversineDistance()

# =========================================================
# APP ENTRY POINT
# =========================================================
if __name__ == '__main__':

    PORT = int(os.getenv("PORT", 5500))

    socketio.run(
        app,
        debug=False,
        host='0.0.0.0',
        port=PORT
    )
    