const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/OrderController");
const { auth, authorize } = require("../Middlewares/auth");
const requireRole = require("../Middlewares/requireRole");
// const validate = require("../Services/Validate");
const {
  createOrderValidation,
  updateOrderStatusValidation,
  cancelOrderValidation,
  verifyOTPValidation,
  validate
} = require("../Services/orderValidations");

// All routes are protected
router.use(auth);

// Order creation and management
router.post(
  "/checkout",
  // validate(createOrderValidation),
  orderController.createOrder
);

router.post(
  "/:id/verify-otp",
  // validate(verifyOTPValidation),
  orderController.verifyOrderOTP
);

router.get("/my-orders", orderController.getUserOrders);

router.get("/:id", orderController.getOrderById);
router.post("/:orderId/resend-otp", orderController.resendOrderOTP);

router.put(
  "/:id/cancel",
  validate(cancelOrderValidation),
  orderController.cancelOrder
);

// Seller routes
router.get(
  "/seller/orders",
  requireRole("farmer", "admin", "trader"),
  orderController.getSellerOrders
);

// Admin routes
router.get("/", requireRole("admin"), orderController.getAllOrders);

router.put(
  "/:id/status",
  requireRole("admin", "farmer","trader"),
  validate(updateOrderStatusValidation),
  orderController.updateOrderStatus
);

router.delete("/:id", requireRole("admin"), orderController.deleteOrder);

module.exports = router;
