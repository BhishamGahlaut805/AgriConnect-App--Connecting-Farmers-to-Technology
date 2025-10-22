const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    provider: String,
    providerOrderId: String,
    providerPaymentId: String,
    amount: Number,
    status: {
      type: String,
      enum: ["INIT", "SUCCESS", "FAILED"],
      default: "INIT",
    },
    raw: Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
