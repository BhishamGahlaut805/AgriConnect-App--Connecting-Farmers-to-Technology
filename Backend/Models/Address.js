const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
      required: [true, "User reference is required"],
      index: true,
    },
    label: {
      type: String,
      required: [true, "Address label is required"],
      trim: true,
      maxlength: [50, "Label cannot exceed 50 characters"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
      maxlength: [200, "Street address cannot exceed 200 characters"],
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [100, "Landmark cannot exceed 100 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [50, "City cannot exceed 50 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    metadata: {
      isActive: {
        type: Boolean,
        default: true,
      },
      lastUsed: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for user and default address
addressSchema.index({ user: 1, isDefault: 1 });

// Pre-save middleware to ensure only one default address per user
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    try {
      await this.constructor.updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
    } catch (error) {
      return next(error);
    }
  }

  if (this.isModified("isDefault") && !this.isDefault) {
    const hasOtherDefault = await this.constructor.findOne({
      user: this.user,
      _id: { $ne: this._id },
      isDefault: true,
    });

    if (!hasOtherDefault) {
      const anyOtherAddress = await this.constructor
        .findOne({
          user: this.user,
          _id: { $ne: this._id },
        })
        .sort({ createdAt: 1 });

      if (anyOtherAddress) {
        await this.constructor.findByIdAndUpdate(anyOtherAddress._id, {
          isDefault: true,
        });
      }
    }
  }

  this.metadata.lastUsed = new Date();
  next();
});

// Static method to get user's default address
addressSchema.statics.getDefaultAddress = function (userId) {
  return this.findOne({ user: userId, isDefault: true });
};

// Static method to get all active addresses for user
addressSchema.statics.getUserAddresses = function (userId) {
  return this.find({
    user: userId,
    "metadata.isActive": true,
  }).sort({ isDefault: -1, createdAt: -1 });
};

// Instance method to format address as string
addressSchema.methods.toString = function () {
  return `${this.street}, ${this.landmark ? this.landmark + ", " : ""}${
    this.city
  }, ${this.state} - ${this.pincode}, ${this.country}`;
};

// Virtual for complete address
addressSchema.virtual("completeAddress").get(function () {
  return this.toString();
});

module.exports = mongoose.model("Address", addressSchema);
