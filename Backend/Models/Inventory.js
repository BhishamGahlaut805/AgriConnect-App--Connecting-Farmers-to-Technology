const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

InventorySchema.index({ owner: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", InventorySchema);
