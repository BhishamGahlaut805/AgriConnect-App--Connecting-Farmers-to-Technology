// models/OTPVerification.js
const mongoose = require("mongoose");

const OTPVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email format",
    ],
  },
  otp: {
    type: String,
    required: [true, "OTP is required"],
    match: [/^\d{6}$/, "OTP must be 6 digits"],
  },
  products: [
    {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.models.OTPVerification || mongoose.model(
  "OTPVerification",
  OTPVerificationSchema,
  "OTPVerification"
);

