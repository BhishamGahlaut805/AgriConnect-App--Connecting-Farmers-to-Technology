const mongoose = require("mongoose");

const nearbyFarmSchema = new mongoose.Schema({
  farm_id: String,
  farm_name: String,
  latitude: Number,
  longitude: Number,
  distance_km: Number,
});

const agroPolygonSchema = new mongoose.Schema({
  polygon_id: String,
  area: Number,
  center: [Number],
  created_at: Number,
  geo_json: {
    type: { type: String },
    properties: { type: mongoose.Schema.Types.Mixed, default: {} },
    geometry: {
      type: { type: String },
      coordinates: [[[Number]]],
    },
  },
});

const diseaseRiskSchema = new mongoose.Schema({
  distance_km: Number,
  disease: String,
  confidence: Number,
});

const lstmPredictionSchema = new mongoose.Schema({
  date: String,
  predicted_risk: Number,
  predicted_radius_Km: Number,
});

const farmSchema = new mongoose.Schema({
  farm_name: String,
  latitude: Number,
  longitude: Number,
  user_id: String,
  report_folder: String,
  nearby_farms: [nearbyFarmSchema],
  agro_polygon: agroPolygonSchema,
  farm_id: String,
  last_trained_at: Date,
  top_disease_risks: [diseaseRiskSchema],
  training_csv_path: String,
  lstm_last_updated: Date,
  lstm_prediction: [lstmPredictionSchema],
});

module.exports = mongoose.models.farms || mongoose.model("farms", farmSchema);
