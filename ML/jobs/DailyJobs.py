import os
from dotenv import load_dotenv

load_dotenv()

print("Starting daily services...")

# =====================================================
# DATA PREPARATION
# =====================================================
from DataService.PrepareData import DataService

data_service = DataService()

try:
    data_service.run_once_a_day()
    print("DataService completed")
except Exception as e:
    print(f"DataService Error: {e}")

# =====================================================
# LSTM TRAINING
# =====================================================
from CropDiseaseOutbreakPredictor.LSTM.LSTMOutBreak import (
    LSTMOutbreakPredictor
)

predictor = LSTMOutbreakPredictor()

try:
    predictor.run_for_all_farms()
    print("LSTM training completed")
except Exception as e:
    print(f"LSTM Error: {e}")

# =====================================================
# SUMMARY UPDATE
# =====================================================
from MongoDBService.UpdateService import SummaryUpdateService

summary_service = SummaryUpdateService()

try:
    summary_service.run_all()
    print("Summary update completed")
except Exception as e:
    print(f"Summary Error: {e}")

print("All daily services completed")
