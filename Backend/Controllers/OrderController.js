const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const RegisteredUsers = require("../models/UserModel");
const Listing = require("../models/Listing");
const OTPVerification = require("../models/OTPVerification");
const emailService = require("../utils/emailService");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../Services/asyncHandler");
const Product = require("../models/Product");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const orderController = {
  // Create new order from cart - Robust version with OTP first
  createOrder: asyncHandler(async (req, res) => {
    const { shippingAddressId, paymentMethod, notes, totalAmountFrontend } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!totalAmountFrontend || totalAmountFrontend <= 0) {
      return res.status(400).json({ success: false, message: "Invalid total amount provided." });
    }
    if (!shippingAddressId) {
      return res.status(400).json({ success: false, message: "Shipping address is required." });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method is required." });
    }

    // Validate shipping address
    const shippingAddress = await Address.findOne({ _id: shippingAddressId, user: userId });
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Invalid shipping address." });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.listing",
      populate: [
        { path: "product", model: "Product", select: "title images category unit" },
        { path: "farmer", model: "RegisteredUsers", select: "name email phone" }
      ]
    });

    if (!cart || !cart.items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Calculate total and prepare order items
    for (const item of cart.items) {
      const listing = await Listing.findById(item.product)
        .populate("product", "title category images unit")
        .populate("farmer", "name email phone");

      if (!listing) {
        console.warn(`Listing not found for item: ${item.product}`);
        continue;
      }

      const qty = item.qty || 0;
      const price = listing.pricePerUnit || 0;
      calculatedTotal += price * qty;

      orderItems.push({
        product: listing.product?._id,
        listing: listing._id,
        quantity: qty,
        price,
        unit: listing.unit || listing.product?.unit || "unit",
        farmer: listing.farmer?._id,
        status: "pending"
      });
    }

    // STEP 1: Send OTP first for ALL payment methods (as requested)
    let otpRecord = null;
    let otpCode = null;

    try {
      otpCode = generateOTP();

      // Create OTP record first for ALL payment types
      otpRecord = new OTPVerification({
        email: req.user.contact,
        otp: otpCode,
        products: orderItems,
        verified: false,
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      await otpRecord.save();
      console.log("OTP record created successfully:", otpRecord._id);

      // Send OTP email robustly for ALL payment types
      await emailService.sendOTPEmail(req.user.contact, otpCode, orderItems.length);
      console.log("OTP sent successfully for order verification");

    } catch (otpError) {
      console.error("OTP creation/sending failed:", otpError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification OTP. Please try again."
      });
    }

    // STEP 2: Create order after OTP is sent successfully
    const orderData = {
      user: userId,
      items: orderItems,
      totalAmount: totalAmountFrontend,
      shippingAddress: shippingAddressId,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
      orderStatus: "pending_verification", // All orders require OTP verification
      deliveryStatus: "pending",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: notes || "",
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent") || "Unknown",
        frontendTotal: totalAmountFrontend,
        backendCalculatedTotal: calculatedTotal,
        otpRequired: true,
        otpReference: otpRecord._id.toString(), // Explicitly store as string
        otpCreatedAt: new Date()
      }
    };
    console.log("Creating order with data:", orderData.totalAmount, orderData.metadata);
    let order;
    try {
      order = new Order(orderData);
      console.log("Order instance created, saving to database...", orderData);
      await order.save();
      console.log("Order created with OTP reference:", order.metadata.otpReference);

      // Clear cart only after successful order creation
      if (cart) {
        cart.items = [];
        await cart.save().catch(err => console.error("Cart clearance warning:", err));
      }

      // Update address lastUsed
      await Address.findByIdAndUpdate(shippingAddressId, {
        $set: {
          "metadata.lastUsed": new Date(),
          updatedAt: new Date()
        }
      }).catch(err => console.error("Address update warning:", err));

      const populatedOrder = await Order.findById(order._id)
        .populate("user", "name email phone")
        .populate("items.product", "title images category unit")
        .populate("items.farmer", "name email phone")
        .populate("shippingAddress")
        .lean();

      res.status(201).json({
        success: true,
        message: "OTP sent successfully. Please verify to confirm your order.",
        data: {
          order: populatedOrder,
          requiresOTP: true,
          otpSent: true,
          orderStatus: "pending_verification"
        }
      });

    } catch (err) {
      console.error("Order creation failed:", err);

      // Clean up OTP record if order creation fails
      if (otpRecord && otpRecord._id) {
        await OTPVerification.findByIdAndDelete(otpRecord._id)
          .then(() => console.log("OTP record cleaned up due to order creation failure"))
          .catch(cleanupErr => console.error("OTP cleanup failed:", cleanupErr));
      }

      res.status(500).json({
        success: false,
        message: "Order creation failed. Please try again."
      });
    }
  }),

  // Verify OTP from OTPVerification table - Robust version
  verifyOrderOTP: asyncHandler(async (req, res) => {
    console.log("Received OTP verification request", req.body);
    const { otpCode, orderId } = req.body;
    const userEmail = req.user.contact;

    if (!otpCode || !otpCode.match(/^\d{6}$/)) {
      return res.status(400).json({ success: false, message: "Valid 6-digit OTP code is required" });
    }
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    console.log("Verifying OTP for Order ID:", orderId, "by user:", userEmail);

    // Find the order by ID and ensure it belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("Order found for OTP verification, OTP Reference:", order.metadata?.otpReference);

    // Validate OTP reference exists
    if (!order.metadata?.otpReference) {
      return res.status(400).json({
        success: false,
        message: "No OTP verification found for this order"
      });
    }

    // Find OTP record by the stored reference
    const otpRecord = await OTPVerification.findOne({
      _id: order.metadata.otpReference,
      email: userEmail,
      verified: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP verification"
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await OTPVerification.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTPVerification.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      });
    }

    // Verify OTP code
    if (otpRecord.otp !== otpCode) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      });
    }

    try {
      // Mark OTP as verified
      otpRecord.verified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();

      // Determine final order status based on payment method
      const finalOrderStatus = order.paymentMethod === "cod" ? "confirmed" : "confirmed";
      const finalPaymentStatus = order.paymentMethod === "cod" ? "pending" : "completed";

      // Update order status to confirmed
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            orderStatus: finalOrderStatus,
            paymentStatus: finalPaymentStatus,
            "metadata.otpVerifiedAt": new Date(),
            "metadata.otpReference": otpRecord._id.toString() // Ensure reference is maintained
          }
        },
        { new: true, runValidators: true }
      ).populate("items.product user");

      if (!updatedOrder) {
        console.error("Order not found during OTP confirmation:", orderId);
        return res.status(400).json({ success: false, message: "Order not found for this OTP" });
      }

      // Send confirmation emails
      const user = await RegisteredUsers.findById(req.user.id);
      try {
        await emailService.sendOrderConfirmationEmail(updatedOrder, user);
        await emailService.sendOrderStatusEmail(updatedOrder, user, "confirmed");
        console.log("Confirmation emails sent after OTP verification");
      } catch (emailErr) {
        console.error("Failed sending confirmation emails:", emailErr);
        // Continue even if email fails
      }

      res.json({
        success: true,
        message: "OTP verified and order confirmed successfully",
        data: {
          orderId: updatedOrder._id,
          verifiedAt: otpRecord.verifiedAt,
          orderStatus: updatedOrder.orderStatus,
          paymentStatus: updatedOrder.paymentStatus
        }
      });

    } catch (err) {
      console.error("OTP verification failed:", err);
      res.status(500).json({
        success: false,
        message: "OTP verification failed. Please try again."
      });
    }
  }),

  // Resend OTP for pending orders
  resendOrderOTP: asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userEmail = req.user.contact;

    console.log("Resend OTP requested for Order ID:", orderId, "by user:", userEmail);

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (order.orderStatus !== "pending_verification") {
      return res.status(400).json({
        success: false,
        message: "OTP cannot be resent for this order status"
      });
    }

    console.log("Order found for OTP resend, current OTP reference:", order.metadata?.otpReference);

    // Generate new OTP
    const newOTP = generateOTP();

    // Create a new OTP record
    const newOTPRecord = new OTPVerification({
      email: userEmail,
      otp: newOTP,
      products: order.items,
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await newOTPRecord.save();

    // Update order with new OTP reference
    order.metadata.otpReference = newOTPRecord._id.toString();
    order.metadata.otpCreatedAt = new Date();
    await order.save();

    console.log(`New OTP record created: ${newOTPRecord._id}`);

    // Send OTP email
    try {
      await emailService.sendOTPEmail(userEmail, newOTP, order.items.length);
      res.json({
        success: true,
        message: "OTP resent successfully",
        data: {
          expiresAt: newOTPRecord.expiresAt
        }
      });
    } catch (err) {
      console.error("Resend OTP failed:", err);

      // Clean up the OTP record if email fails
      await OTPVerification.findByIdAndDelete(newOTPRecord._id)
        .catch(cleanupErr => console.error("Failed to cleanup OTP record after email failure:", cleanupErr));

      res.status(500).json({
        success: false,
        message: "Failed to resend OTP. Please try again."
      });
    }
  }),
  // Get user's orders
  getUserOrders: asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { user: userId };
    if (status) filter.orderStatus = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const orders = await Order.find(filter)
      .populate("items.product", "title images category unit pricePerUnit")
      .populate("items.farmer", "name email")
      .populate("shippingAddress")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  }),

  // Get seller orders
  getSellerOrders: asyncHandler(async (req, res, next) => {
    const sellerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { "items.farmer": sellerId };
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.product", "title images category")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  }),

  // Get order by ID
  getOrderById: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id)
      .populate("user", "name email phone")
      .populate("items.product", "title images category specs")
      .populate("items.farmer", "name email phone")
      .populate("shippingAddress");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check access permissions
    const isOwner = order.user._id.toString() === userId;
    const isSeller = order.items.some(
      (item) => item.farmer._id.toString() === userId
    );
    const isAdmin = userRole === "admin";

    if (!isOwner && !isSeller && !isAdmin) {
      return next(new AppError("Access denied", 403));
    }

    res.json({
      success: true,
      data: { order },
    });
  }),

  // Update order status
  updateOrderStatus: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { orderStatus, deliveryStatus, trackingNumber } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id)
      .populate("user")
      .populate("items.farmer");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check if user has permission to update this order
    if (userRole === "farmer") {
      const isSeller = order.items.some(
        (item) => item.farmer._id.toString() === userId
      );
      if (!isSeller) {
        return next(new AppError("Access denied", 403));
      }
    }

    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (deliveryStatus) updates.deliveryStatus = deliveryStatus;
    if (trackingNumber) updates.trackingNumber = trackingNumber;

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("user items.product");

    // Send status update email
    try {
      await emailService.sendOrderStatusEmail(updatedOrder, order.user, orderStatus);
      console.log(" Order status update email sent successfully");
    } catch (emailError) {
      console.error(" Order status email failed, but status was updated:", emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: { order: updatedOrder },
    });
  }),

  // Cancel order
  cancelOrder: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.user.toString() !== userId) {
      return next(new AppError("Access denied", 403));
    }

    // if (!order.canBeCancelled()) {
    //   return next(new AppError("Cannot cancel order at this stage", 400));
    // }

    order.orderStatus = "cancelled";
    order.cancellationReason = reason;

    // Restore stock for each item in the order
    for (const item of order.items) {
      const listing = await Listing.findById(item.listing);
      if (listing) {
        listing.availableQty += item.quantity;
        listing.status = listing.availableQty > 0 ? "active" : "soldout";
        listing.isActive = listing.availableQty > 0;
        await listing.save();
      }

      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    if (order.paymentStatus === "completed") {
      order.paymentStatus = "refunded";
    }

    await order.save();


    // Send cancellation email
    try {
      const user = await RegisteredUsers.findById(userId);
      await emailService.sendOrderStatusEmail(order, user, "cancelled");
      console.log(" Order cancellation email sent successfully");
    } catch (emailError) {
      console.error("Cancellation email failed, but order was cancelled:", emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  }),

  // Get all orders (Admin only)
  getAllOrders: asyncHandler(async (req, res, next) => {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      search,
    } = req.query;

    const filter = {};

    if (status) filter.orderStatus = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "user.name": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.product", "title category")
      .populate("items.farmer", "name")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  }),

  // Delete order (Admin only)
  deleteOrder: asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.orderStatus !== "cancelled") {
      return next(new AppError("Can only delete cancelled orders", 400));
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  }),
// Resend OTP for pending COD orders
resendOrderOTP: asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userEmail = req.user.contact;
  console.log("Resend OTP requested for Order ID:", orderId, "by user:", userEmail);
  // Find the order
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  if (order.paymentMethod !== "cod" || order.orderStatus !== "pending_verification") {
    return res.status(400).json({ success: false, message: "OTP cannot be resent for this order" });
  }
  console.log("Order found for OTP resend:", order);
  // Find the associated OTP record
  const otpRecord = order.otp.code;
  if (!otpRecord) return res.status(404).json({ success: false, message: "OTP record not found" });
  console.log("Found OTP record:", otpRecord);
  // Generate new OTP
 const newOTP = generateOTP();

 // Create a new OTP record
 const newOTPRecord = new OTPVerification({
   email: req.user.contact,
   otp: newOTP,
   products: order.items, // attach items from the order
   verified: false,
   expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
 });

 await newOTPRecord.save();

 console.log(`New OTP record created: ${newOTP}`);

  // console.log("Generated new OTP and updated record:", newOTP);
  // Send OTP email
  try {
    await emailService.sendOTPEmail(userEmail, newOTP, order.items.length);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP failed:", err);
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
}),

};

module.exports = orderController;