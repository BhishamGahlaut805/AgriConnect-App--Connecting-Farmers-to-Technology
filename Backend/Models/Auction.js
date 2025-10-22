const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BidSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  placedAt: { type: Date, default: Date.now },
});

const AuctionSchema = new Schema(
  {
    crop: {
      type: Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
      unique: true,
    },
    startPrice: Number,
    minIncrement: { type: Number, default: 1 },
    startAt: Date,
    endAt: Date,
    bids: [BidSchema],
    winner: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"],
      default: "SCHEDULED",
    },
  },
  { timestamps: true }
);

AuctionSchema.index({ endAt: 1 });

module.exports = mongoose.models.Auction || mongoose.model("Auction", AuctionSchema);
