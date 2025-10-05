# train_model.py
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import os
# 1. Load dataset
df = pd.read_csv(r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\FarmModels\datasets\merged_lstm_dataset.csv")
root_dir=r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\FarmModels"
# 2. Encode categorical features
le_crop = LabelEncoder()
df["Crop"] = le_crop.fit_transform(df["Crop"])

le_state = LabelEncoder()
df["State"] = le_state.fit_transform(df["State"])

le_season = LabelEncoder()
df["Season"] = le_season.fit_transform(df["Season"])

# 3. Select features (use yield + weather features)
features = [
    "State", "Season", "year", "Area", "Yield",
    "avg_temperature_2m_mean", "avg_temperature_2m_max", "avg_temperature_2m_min",
    "avg_relative_humidity_2m_mean", "avg_wind_speed_10m_max",
    "avg_precipitation_sum", "avg_shortwave_radiation_sum",
    "avg_surface_pressure_mean", "avg_cloud_cover_mean"
]
X = df[features]
y = df["Crop"]

# 4. Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=300, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
print(classification_report(y_test, model.predict(X_test)))

# 6. Save model + encoders

# Create subfolder "NewModels" if not exists
save_dir = os.path.join(root_dir, "NewModels")
os.makedirs(save_dir, exist_ok=True)
joblib.dump(model, os.path.join(save_dir, "crop_model.pkl"))
joblib.dump(le_crop, os.path.join(save_dir, "le_crop.pkl"))
joblib.dump(le_state, os.path.join(save_dir, "le_state.pkl"))
joblib.dump(le_season, os.path.join(save_dir, "le_season.pkl"))

print("Model and encoders saved.")
