const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User" },
  to: { type: Schema.Types.ObjectId, ref: "User" },
  text: String,
  attachments: [String],
  createdAt: { type: Date, default: Date.now },
});

const ThreadSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatThread", ThreadSchema);
