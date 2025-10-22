const mongoose = require("mongoose");

const txSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
      required: true,
    },
    amount: { type: Number, required: true },
    provider: {
      type: String,
      enum: ["cod", "upi", "razorpay", "stripe"],
      default: "cod",
    },
    providerRef: String,
    status: {
      type: String,
      enum: ["init", "success", "failed", "refunded"],
      default: "init",
    },
    meta: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", txSchema);
