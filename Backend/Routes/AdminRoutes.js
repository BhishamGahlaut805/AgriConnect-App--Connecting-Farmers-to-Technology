// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const adminController = require("../Controllers/AdminController");
const { auth } = require("../middlewares/auth");
const requireRole  = require("../middlewares/requireRole");

// Admin middleware
router.use(auth);
router.use(requireRole("Admin"));

// Dashboard
router.get("/metrics", adminController.getMetrics);

// Product management
router.get("/products/pending", adminController.getPendingProducts);
router.patch("/products/:id/approve", adminController.approveProduct);
router.patch(
  "/products/:id/reject",
  body("reason").notEmpty().withMessage("Rejection reason is required"),
  adminController.rejectProduct
);
router.post(
  "/products/bulk-approve",
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("Product IDs array is required"),
  adminController.bulkApproveProducts
);
router.post(
  "/products/bulk-reject",
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("Product IDs array is required"),
  body("reason").notEmpty().withMessage("Rejection reason is required"),
  adminController.bulkRejectProducts
);
router.get("/products/stats", adminController.getProductStats);

// User management
router.patch(
  "/users/:id/role",
  body("role")
    .isIn(["Farmer", "Trader", "Admin", "Buyer"])
    .withMessage("Invalid role"),
  adminController.updateUserRole
);
router.get("/kyc/pending", adminController.getPendingKYC);
router.patch("/kyc/:id/verify", adminController.verifyKYC);

module.exports = router;
