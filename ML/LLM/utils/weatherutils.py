import requests, json, numpy as np, os
from datetime import datetime
from ..config import DEFAULT_DATA_DIR
from ..config import logger

def fetch_weather_data(lat, lon, db):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,rain&timezone=Asia/Kolkata&forecast_days=7"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()
        hourly = data.get("hourly", {})
        record = {
            "latitude": lat,
            "longitude": lon,
            "temperature_avg": float(np.mean(hourly.get("temperature_2m", [0]))),
            "humidity_avg": float(np.mean(hourly.get("relative_humidity_2m", [0]))),
            "timestamp": datetime.utcnow(),
            "raw_data": data
        }
        db.weather_data.insert_one(record)
        file = os.path.join(DEFAULT_DATA_DIR, "weather", f"weather_{lat}_{lon}.json")
        with open(file, "w", encoding="utf-8") as f:
            json.dump(record, f, default=str, indent=2)
        logger.info(f"Weather stored for {lat},{lon}")
        return record
    except Exception as e:
        logger.error(f"Weather fetch failed: {e}")
        return {"error": str(e)}
