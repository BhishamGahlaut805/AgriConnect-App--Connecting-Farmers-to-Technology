import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import StandardScaler
import joblib
from pymongo import MongoClient

class LSTMOutbreakPredictor:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(mongo_uri)
        self.db = self.client["AgriSupportDB"]
        self.farm_col = self.db["farms"]
        self.log_file = "lstm_run_log.txt"
        self.run_log = self._load_log()

    def _load_log(self):
        if not os.path.exists(self.log_file):
            return {}
        try:
            with open(self.log_file, "r") as f:
                lines = f.readlines()
            return {line.split(":")[0].strip(): line.split(":")[1].strip() for line in lines if ":" in line}
        except:
            return {}

    def _save_log(self):
        with open(self.log_file, "w") as f:
            for farm_id, date_str in self.run_log.items():
                f.write(f"{farm_id}:{date_str}\n")

    def already_ran_today(self, farm_id):
        return self.run_log.get(str(farm_id)) == datetime.utcnow().strftime('%Y-%m-%d')

    def mark_today_done(self, farm_id):
        self.run_log[str(farm_id)] = datetime.utcnow().strftime('%Y-%m-%d')
        self._save_log()

    def force_rerun_for_farm(self, farm_id):
        if farm_id in self.run_log:
            del self.run_log[farm_id]
            self._save_log()
            print(f"[INFO] Force rerun enabled for {farm_id}")
        else:
            print(f"[INFO] No run log found for {farm_id}, already eligible.")

    def train_and_predict(self, farm_doc):
        farm_id = farm_doc["farm_id"]
        csv_path = farm_doc.get("training_csv_path")
        farm_name = farm_doc.get("farm_name", "UnknownFarm")

        if not csv_path or not os.path.exists(csv_path):
            print(f"[WARN] Missing or invalid CSV for {farm_name}")
            return

        if self.already_ran_today(farm_id):
            print(f"[SKIP] Already trained today: {farm_name}")
            return

        df = pd.read_csv(csv_path).sort_values("date")
        if len(df) < 10:
            print(f"[SKIP] Not enough data for {farm_name}")
            return

        df=df.drop(columns=["weather_desc"])
        target_cols = ["risk%", "radius_km"]
        feature_cols = [col for col in df.columns if col not in ["date", "risk%", "radius_km"]]

        X_data = df[feature_cols].values
        y_data = df[target_cols].values

        scaler_X = StandardScaler()
        scaler_y = StandardScaler()
        X_scaled = scaler_X.fit_transform(X_data)
        y_scaled = scaler_y.fit_transform(y_data)

        def create_sequences(X, y, seq_len=10):
            X_seq, y_seq = [], []
            for i in range(len(X) - seq_len):
                X_seq.append(X[i:i+seq_len])
                y_seq.append(y[i+seq_len])
            return np.array(X_seq), np.array(y_seq)

        X_seq, y_seq = create_sequences(X_scaled, y_scaled, 10)
        if len(X_seq) < 10:
            print(f"[SKIP] Not enough sequences for {farm_name}")
            return

        X_train, y_train = X_seq[:-10], y_seq[:-10]

        model = Sequential()
        model.add(LSTM(64, activation='relu', input_shape=(X_train.shape[1], X_train.shape[2])))
        model.add(Dense(32, activation='relu'))
        model.add(Dense(2))
        model.compile(optimizer='adam', loss='mse')

        model.fit(X_train, y_train, epochs=50, batch_size=4, verbose=0)

        recent_seq = X_scaled[-10:].reshape(1, 10, len(feature_cols))
        future_preds_scaled = []
        for _ in range(10):
            pred = model.predict(recent_seq, verbose=0)[0]
            future_preds_scaled.append(pred)
            recent_seq = np.append(recent_seq[:, 1:, :], [[X_scaled[-1]]], axis=1)

        future_preds = scaler_y.inverse_transform(future_preds_scaled)

        today = datetime.utcnow()
        result = [{
            "date": (today + timedelta(days=i+1)).strftime('%Y-%m-%d'),
            "predicted_risk%": round(float(p[0]), 2),
            "predicted_radius_Km": round(float(p[1]), 2)
        } for i, p in enumerate(future_preds)]

        base_dir = os.path.dirname(csv_path)
        model.save(os.path.join(base_dir, "lstm_model.keras"))
        joblib.dump(scaler_X, os.path.join(base_dir, "scaler_X.pkl"))
        joblib.dump(scaler_y, os.path.join(base_dir, "scaler_y.pkl"))

        self.farm_col.update_one(
            {"farm_id": farm_id},
            {"$set": {
                "lstm_prediction": result,
                "lstm_last_updated": today
            }}
        )

        self.mark_today_done(farm_id)
        print(f"[SUCCESS] Model trained and predictions stored for {farm_name}")

    def run_for_all_farms(self):
        farms = list(self.farm_col.find({"training_csv_path": {"$ne": None}}))
        for farm in farms:
            try:
                self.train_and_predict(farm)
            except Exception as e:
                print(f"[ERROR] Failed for {farm.get('farm_name', 'Unknown')} → {e}")
