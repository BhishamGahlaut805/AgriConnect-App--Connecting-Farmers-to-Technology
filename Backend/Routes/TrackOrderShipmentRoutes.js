const express = require("express");
const router = express.Router();
const trackingController = require("../Controllers/trackingController");
const { auth } = require("../Middlewares/auth");
const requireRole = require("../Middlewares/requireRole");
// All routes are protected
router.use(auth);

// Order tracking for users, sellers, and admins
router.get("/:orderId", trackingController.trackOrder);

router.get("/:orderId/timeline", trackingController.getOrderTimeline);

router.post(
  "/:orderId/update-location",
  requireRole("admin"),
  trackingController.updateOrderLocation,
);

router.get("/user/active-orders", trackingController.getUserActiveOrders);

router.get(
  "/seller/pending-shipments",
  requireRole("farmer", "admin"),
  trackingController.getSellerPendingShipments,
);

// Delivery management
router.post("/:orderId/confirm-delivery", trackingController.confirmDelivery);

router.post("/:orderId/resend-otp", trackingController.resendDeliveryOTP);

module.exports = router;
