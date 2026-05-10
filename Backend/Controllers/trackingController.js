const Order = require("../Models/Order");
const { AppError } = require("../Utils/AppError");
const { asyncHandler } = require("../Services/asyncHandler");

const {
  sendOTPEmail,
  sendDeliveryUpdateEmail,
} = require("../Services/emailService");

const trackingController = {
  // Track order by ID
  trackOrder: asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findOne({ orderId })
      .populate("user", "name email phone")
      .populate("items.product", "title images")
      .populate("items.farmer", "name phone")
      .populate("shippingAddress");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check access permissions
    const isOwner = order.user._id.toString() === userId;
    const isSeller = order.items.some(
      (item) => item.farmer._id.toString() === userId,
    );
    const isAdmin = userRole === "admin";

    if (!isOwner && !isSeller && !isAdmin) {
      return next(new AppError("Access denied", 403));
    }

    // Generate tracking timeline
    const timeline = generateOrderTimeline(order);

    res.json({
      success: true,
      data: {
        order,
        timeline,
        tracking: {
          currentStatus: order.deliveryStatus,
          estimatedDelivery: order.estimatedDelivery,
          canConfirmDelivery: order.deliveryStatus === "out_for_delivery",
        },
      },
    });
  }),

  // Get order timeline
  getOrderTimeline: asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const timeline = generateOrderTimeline(order);

    res.json({
      success: true,
      data: { timeline },
    });
  }),

  // Update order location (Admin only)
  updateOrderLocation: asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { location, status, notes } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Create location update entry
    const locationUpdate = {
      timestamp: new Date(),
      location,
      status,
      notes,
    };

    // Add to order's tracking history
    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }
    order.trackingHistory.push(locationUpdate);

    // Update delivery status if provided
    if (status && status !== order.deliveryStatus) {
      order.deliveryStatus = status;

      // If status is out_for_delivery, generate new OTP
      if (status === "out_for_delivery") {
        order.otp = {
          code: Math.floor(100000 + Math.random() * 900000).toString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          verified: false,
        };

        // Send OTP to user
        await sendOTPEmail(order.user.email, order.otp.code);
      }
    }

    await order.save();

    // Send update notification
    await sendDeliveryUpdateEmail(order, locationUpdate);

    res.json({
      success: true,
      message: "Order location updated successfully",
      data: { update: locationUpdate },
    });
  }),

  // Get user's active orders
  getUserActiveOrders: asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const activeOrders = await Order.find({
      user: userId,
      orderStatus: { $in: ["confirmed", "processing", "shipped"] },
    })
      .populate("items.product", "title images")
      .populate("shippingAddress")
      .sort({ updatedAt: -1 });

    const ordersWithTracking = activeOrders.map((order) => ({
      ...order.toObject(),
      tracking: {
        currentStatus: order.deliveryStatus,
        estimatedDelivery: order.estimatedDelivery,
        canTrack: true,
      },
    }));

    res.json({
      success: true,
      data: { orders: ordersWithTracking },
    });
  }),

  // Get seller's pending shipments
  getSellerPendingShipments: asyncHandler(async (req, res, next) => {
    const sellerId = req.user.id;

    const pendingShipments = await Order.find({
      "items.farmer": sellerId,
      orderStatus: { $in: ["confirmed", "processing"] },
    })
      .populate("user", "name email phone")
      .populate("items.product", "title images")
      .populate("shippingAddress")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { shipments: pendingShipments },
    });
  }),

  // Confirm delivery with OTP
  confirmDelivery: asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { otpCode } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.deliveryStatus !== "out_for_delivery") {
      return next(new AppError("Order is not out for delivery", 400));
    }

    const isOTPValid = order.verifyOTP(otpCode);
    if (!isOTPValid) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    // Update order status
    order.orderStatus = "delivered";
    order.deliveryStatus = "delivered";
    order.deliveredAt = new Date();

    await order.save();

    // Send delivery confirmation
    await sendDeliveryUpdateEmail(order, {
      status: "delivered",
      timestamp: new Date(),
      notes: "Order delivered successfully",
    });

    res.json({
      success: true,
      message: "Order delivered successfully",
      data: { order },
    });
  }),

  // Resend delivery OTP
  resendDeliveryOTP: asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.deliveryStatus !== "out_for_delivery") {
      return next(
        new AppError("OTP can only be sent for orders out for delivery", 400),
      );
    }

    // Generate new OTP
    order.otp = {
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      verified: false,
    };

    await order.save();

    // Send new OTP
    await sendOTPEmail(order.user.email, order.otp.code);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  }),
};

// Helper function to generate order timeline
function generateOrderTimeline(order) {
  const timeline = [];

  // Order created
  timeline.push({
    event: "order_created",
    title: "Order Placed",
    description: "Your order has been successfully placed",
    timestamp: order.createdAt,
    status: "completed",
  });

  // Order confirmed
  if (order.orderStatus !== "pending") {
    timeline.push({
      event: "order_confirmed",
      title: "Order Confirmed",
      description: "Seller has confirmed your order",
      timestamp: order.updatedAt,
      status: "completed",
    });
  }

  // Processing
  if (["processing", "shipped", "delivered"].includes(order.orderStatus)) {
    timeline.push({
      event: "order_processing",
      title: "Order Processing",
      description: "Seller is preparing your order for shipment",
      timestamp: order.updatedAt,
      status: "completed",
    });
  }

  // Shipped
  if (["shipped", "delivered"].includes(order.orderStatus)) {
    timeline.push({
      event: "order_shipped",
      title: "Order Shipped",
      description: order.trackingNumber
        ? `Your order has been shipped. Tracking: ${order.trackingNumber}`
        : "Your order has been shipped",
      timestamp: order.updatedAt,
      status: "completed",
    });
  }

  // Delivery updates based on delivery status
  const deliveryEvents = {
    picked_up: {
      title: "Picked Up",
      description: "Your order has been picked up by the delivery partner",
    },
    in_transit: {
      title: "In Transit",
      description: "Your order is on the way to your location",
    },
    out_for_delivery: {
      title: "Out for Delivery",
      description: "Your order is out for delivery today",
    },
    delivered: {
      title: "Delivered",
      description: "Your order has been delivered successfully",
    },
  };

  if (deliveryEvents[order.deliveryStatus]) {
    timeline.push({
      event: `delivery_${order.deliveryStatus}`,
      ...deliveryEvents[order.deliveryStatus],
      timestamp: order.deliveredAt || order.updatedAt,
      status: "completed",
    });
  }

  // Add estimated delivery
  timeline.push({
    event: "estimated_delivery",
    title: "Estimated Delivery",
    description: `Expected delivery by ${order.estimatedDelivery.toDateString()}`,
    timestamp: order.estimatedDelivery,
    status: "pending",
  });

  return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

module.exports = trackingController;
