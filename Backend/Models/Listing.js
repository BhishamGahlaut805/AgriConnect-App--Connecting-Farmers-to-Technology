// models/Listing.js
const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    availableQty: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [1, "Available quantity must be at least 1"],
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: [1, "Minimum order quantity must be at least 1"],
    },
    description: String,
    location: {
      pincode: String,
      district: String,
      state: String,
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "soldout", "pending"],
      default: "pending",
    },
    harvestDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ farmer: 1 });
ListingSchema.index({ status: 1 });
ListingSchema.index({ product: 1 });

module.exports = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
