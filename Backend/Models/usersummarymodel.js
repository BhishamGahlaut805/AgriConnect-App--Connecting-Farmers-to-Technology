const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    total_images: { type: Number, required: true },
    total_diseased: { type: Number, required: true },
    last_updated: { type: Date, required: true },
    max_risk_percent: { type: Number, required: true },
    top_diseases: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { _id: false }
);

const userSummarySchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    summary: { type: summarySchema, required: true },
  },
  {
    collection: "user_summary", //force use of this name
  }
);

module.exports = mongoose.models.user_summary || mongoose.model("user_summary", userSummarySchema);
