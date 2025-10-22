const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CMSSchema = new Schema(
  {
    type: { type: String, enum: ["BANNER", "FAQ", "PAGE"], required: true },
    title: String,
    body: String,
    meta: Schema.Types.Mixed,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CMS", CMSSchema);
