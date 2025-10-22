const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CropSchema = new Schema(
  {
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cropType: { type: String, required: true },
    variety: String,
    quantityKg: Number,
    expectedPricePerKg: Number,
    grade: {
      type: String,
      enum: ["A", "B", "C", "UNKNOWN"],
      default: "UNKNOWN",
    },
    harvestDate: Date,
    moisturePercent: Number,
    images: [String],
    location: { district: String, state: String, pincode: String },
    status: {
      type: String,
      enum: ["LISTED", "UNDER_AUCTION", "SOLD", "WITHDRAWN"],
      default: "LISTED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Crop || mongoose.model("Crop", CropSchema);
