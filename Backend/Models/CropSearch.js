const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
  username: { type: String, required: true },
  crop: { type: String, required: true },
  disease: { type: String, required: true },
  confidence: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchHistoryDB", searchSchema);

