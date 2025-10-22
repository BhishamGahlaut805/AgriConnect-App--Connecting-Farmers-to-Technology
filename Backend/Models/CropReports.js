// models/CropReport.js
const mongoose = require("mongoose");

const CropReportSchema = new mongoose.Schema({
  crop: { type: String, required: true },
  disease: { type: String, required: true },
  confidence: { type: Number, default: 0 },
  imageUrl: { type: String },
  report: { type: Object, required: true },
  isHealthy: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CropReport", CropReportSchema);
