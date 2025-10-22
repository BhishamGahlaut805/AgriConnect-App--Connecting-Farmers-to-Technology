const mongoose = require("mongoose");

const cropCountsSchema = new mongoose.Schema({}, { strict: false });
const diseaseCountsSchema = new mongoose.Schema({}, { strict: false });

const farmStatsSchema = new mongoose.Schema({
  farm_id: String,
  date: String,
  created_at: { type: Date, default: Date.now },
  crop_counts: cropCountsSchema,
  disease_counts: diseaseCountsSchema,
  diseased_images_found: Number,
  last_updated: Date,
  total_images_analyzed: Number,
  max_risk_percent: Number,
  most_common_crop: String,
  most_common_disease: String,
});

module.exports =mongoose.models.farm_stats|| mongoose.model("farm_stats", farmStatsSchema);
