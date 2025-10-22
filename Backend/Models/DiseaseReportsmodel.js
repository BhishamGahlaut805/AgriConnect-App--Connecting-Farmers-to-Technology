const mongoose = require("mongoose");

const diseaseReportSchema = new mongoose.Schema({
  farm_name: String,
  farm_id: String,
  latitude: Number,
  longitude: Number,
  crop: String,
  disease: String,
  confidence: Number,
  image_path: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.disease_reports ||
  mongoose.model("disease_reports", diseaseReportSchema);
