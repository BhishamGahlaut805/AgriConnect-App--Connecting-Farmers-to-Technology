const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShipmentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    courier: String,
    trackingNumber: String,
    status: {
      type: String,
      enum: ["INIT", "BOOKED", "IN_TRANSIT", "DELIVERED", "FAILED"],
      default: "INIT",
    },
    rate: Number,
    fromPincode: String,
    toPincode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", ShipmentSchema);
