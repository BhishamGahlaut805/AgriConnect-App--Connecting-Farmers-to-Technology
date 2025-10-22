const mongoose = require("mongoose");

const YieldPredictionSchema = new mongoose.Schema({
  farm_id: String,
  crop: String,
  timestamp: { type: Date, default: Date.now },
  yield_predictions: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  feature_analysis: mongoose.Schema.Types.Mixed,
  model_version: String,
});

module.exports = mongoose.models.YieldPrediction || mongoose.model(
  "YieldPrediction",
  YieldPredictionSchema,
  "YieldPredictions"
);
