// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "VEGETABLE",
        "FRUIT",
        "GRAIN",
        "DAIRY",
        "MACHINERY",
        "FERTILIZER",
        "SEED",
        "PESTICIDE",
        "TOOLS",
        "OTHER",
        "OIL",
        "PULSES",
        "SPICES",
        "SWEETENERS",
        "NATURAL PRODUCTS",
      ],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    unit: {
      type: String,
      required: true,
      enum: [
        "kg",
        "g",
        "ton",
        "L",
        "mL",
        "acre",
        "piece",
        "pack",
        "UNIT",
        "packet",
        "sack",
        "box",
        "dozen",
        "bottle",
        "carton",
        "bag",
        "bundle",
        "crate",
        "liter",
        "quintal",
        "bushel",
        "gallon",
        "yard",
        "unit",
        "hectare",
        "can"
      ],
      default: "kg",
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, "Minimum order quantity must be at least 1"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
      required: true,
    },
    images: [
      {
        type: String,
        required: [true, "At least one product image is required"],
      },
    ],
    specs: {
      certification: String,
      harvestDate: Date,
      shelfLife: Number,
      expiryDate: Date,
      recommendedFor: [String],
      usageInstructions: String,
      attributes: String,
    },
    location: {
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        match: [/^\d{6}$/, "Pincode must be 6 digits"],
      },
      district: String,
      state: String,
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft"],
      default: "pending",
    },
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
    },
    verifiedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ProductSchema.index({ seller: 1, createdAt: -1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ "location.geo": "2dsphere" });
module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema,"Product");
