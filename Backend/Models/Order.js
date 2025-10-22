const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: String,
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegisteredUsers",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: function () {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD${timestamp}${random}`;
      },
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId, // reference type
      ref: "RegisteredUsers", // model name to populate from
      // required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
      // required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredUsers",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "card", "debit_card", "upi", "net_banking", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "pending_verification",
      ],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: [
        "pending",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
      ],
      default: "pending",
    },
    estimatedDelivery: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default +7 days
      },
    },
    deliveredAt: Date,
    otp: {
      code: {
        type: String,
        default: function () {
          return Math.floor(100000 + Math.random() * 900000).toString();
        },
      },
      expiresAt: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        },
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    notes: { type: String, default: "" },
    cancellationReason: String,
    metadata: {
      ipAddress: String,
      userAgent: String,
      frontendTotal: Number,
      backendCalculatedTotal: Number,
      otpRequired: { type: Boolean, default: false }, // store if OTP is required
      otpReference: { type: String }, // store OTP record ID or reference
      otpCreatedAt: { type: Date }, // store when OTP was created
      otpVerifiedAt: { type: Date }, // store when OTP was verified
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for order age
orderSchema.virtual("orderAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});
// Add this after your schema definition, before exporting the model

// Method to verify OTP
orderSchema.methods.verifyOTP = function (otpCode) {
  if (!this.otp || !this.otp.code) return false; // No OTP generated
  const now = new Date();

  // Check if already verified
  if (this.otp.verified) return false;

  // Check expiry
  if (this.otp.expiresAt && now > this.otp.expiresAt) return false;

  // Match code
  if (this.otp.code !== otpCode) return false;

  // Mark as verified
  this.otp.verified = true;
  return true;
};

// Stock adjustment middleware
orderSchema.post("save", async function (doc, next) {
  try {
    const Listing = mongoose.model("Listing");
    if (doc.orderStatus === "confirmed") {
      for (const item of doc.items) {
        await Listing.findByIdAndUpdate(item.listing, {
          $inc: { availableQty: -item.quantity },
          $set: { updatedAt: new Date() },
        });
      }
    }
    if (doc.orderStatus === "cancelled") {
      for (const item of doc.items) {
        await Listing.findByIdAndUpdate(item.listing, {
          $inc: { availableQty: item.quantity },
          $set: { updatedAt: new Date() },
        });
      }
    }
  } catch (err) {
    console.error("Error updating stock:", err);
  }
  next();
});

module.exports =
  mongoose.models.Orders || mongoose.model("Orders", orderSchema);
