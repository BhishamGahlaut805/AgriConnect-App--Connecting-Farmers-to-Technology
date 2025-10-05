# api.py
from flask import Flask, request, jsonify, Blueprint
import joblib
import numpy as np
import os
import pandas as pd

# Blueprint
CropRecommendationBp = Blueprint('Crop_api', __name__, url_prefix='/api/v1')

# Paths
model_dir = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\FarmModels\NewModels"

# Load model + encoders
model = joblib.load(os.path.join(model_dir, "crop_model.pkl"))
le_crop = joblib.load(os.path.join(model_dir, "le_crop.pkl"))
le_state = joblib.load(os.path.join(model_dir, "le_state.pkl"))
le_season = joblib.load(os.path.join(model_dir, "le_season.pkl"))


@CropRecommendationBp.route("/recommend-crops", methods=["POST"])
def recommend_crops():
    data = request.get_json()

    try:
        # Input values
        state = data["state"]
        season = data["season"]
        year = data.get("year", 2025)
        area = float(data.get("area", 1.0))
        yield_val = float(data.get("yield", 2000.0))  # Default fallback yield
        lat = float(data["lat"])
        lon = float(data["lon"])
        farm_id = data.get("farm_id", "farm_001")
        farm_name = data.get("farm_name", "DefaultFarm")

        # Step 1: Load training.csv
        base_path = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports"
        weather_path = os.path.join(base_path, farm_name, "training.csv")
        if not os.path.exists(weather_path):
            return jsonify({"error": f"Weather file not found: {weather_path}"}), 400

        weather_df = pd.read_csv(weather_path)

        # Compute averages for all numeric columns
        avg_values = weather_df.select_dtypes(include=[float, int]).mean().to_dict()

        # Map required model features
        weather_features = {
            "avg_temperature_2m_mean": avg_values.get("temp", 0.0),
            "avg_temperature_2m_max": avg_values.get("temp", 0.0),  # fallback
            "avg_temperature_2m_min": avg_values.get("temp", 0.0),  # fallback
            "avg_relative_humidity_2m_mean": avg_values.get("humidity", 0.0),
            "avg_wind_speed_10m_max": avg_values.get("wind_speed", 0.0),
            "avg_precipitation_sum": avg_values.get("rain_1h", 0.0),
            "avg_shortwave_radiation_sum": avg_values.get("evapotranspiration", 0.0),
            "avg_surface_pressure_mean": avg_values.get("pressure", 0.0),
            "avg_cloud_cover_mean": avg_values.get("cloud_cover_total", 0.0),
        }

        # Step 2: Encode categorical
        state_enc = le_state.transform([state])[0]
        season_enc = le_season.transform([season])[0]

        # Step 3: Build feature vector
        features = [[
            state_enc, season_enc, year, area, yield_val,
            weather_features["avg_temperature_2m_mean"],
            weather_features["avg_temperature_2m_max"],
            weather_features["avg_temperature_2m_min"],
            weather_features["avg_relative_humidity_2m_mean"],
            weather_features["avg_wind_speed_10m_max"],
            weather_features["avg_precipitation_sum"],
            weather_features["avg_shortwave_radiation_sum"],
            weather_features["avg_surface_pressure_mean"],
            weather_features["avg_cloud_cover_mean"]
        ]]

        # Step 4: Predict
        probs = model.predict_proba(features)[0]
        top_indices = probs.argsort()[-5:][::-1]

        top_crops = [
            {"crop": le_crop.inverse_transform([i])[0], "probability": float(probs[i])}
            for i in top_indices
        ]

        return jsonify({
            "farm": {"id": farm_id, "name": farm_name, "lat": lat, "lon": lon},
            "season": season,
            "top_crops": top_crops,
            "weather_used": weather_features
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400
