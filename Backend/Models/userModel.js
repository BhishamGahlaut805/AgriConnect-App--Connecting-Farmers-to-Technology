const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  Address: {
    type: String,
    trim: true,
  },
  contactType: {
    type: String,
    enum: ["email", "mobile"],
    required: [true, "Contact type is required (email/mobile)"],
  },
  contact: {
    type: String,
    required: [true, "Contact information is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Validate based on contactType
        if (this.contactType === "email") {
          return validator.isEmail(v);
        } else if (this.contactType === "mobile") {
          return validator.isMobilePhone(v, "any", { strictMode: false });
        }
        return false;
      },
      message: (props) => {
        if (this.contactType === "email") {
          return `${props.value} is not a valid email address!`;
        } else {
          return `${props.value} is not a valid phone number!`;
        }
      },
    },
  },
  password: {
    type: String,
    required: function () {
      // Password not required for Google OAuth users
      return !this.isGoogleAuth;
    },
    minlength: [6, "Password must be at least 6 characters long"],
    select: false, // Never return password in queries
  },
  role: {
    type: String,
    enum: ["farmer", "trader", "other", "admin"],
    required: [true, "User role is required"],
    default: "farmer",
  },
  isGoogleAuth: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  resetToken: {
    type: String,
    select: false,
  },
  resetExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries on frequently accessed fields
// userSchema.index({ contact: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.models.RegisteredUsers || mongoose.model("RegisteredUsers", userSchema);
