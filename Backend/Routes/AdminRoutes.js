// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const adminController = require("../Controllers/AdminController");
const { auth } = require("../Middlewares/auth");
const requireRole = require("../Middlewares/requireRole");

// Admin middleware
router.use(auth);
router.use(requireRole("admin"));

// Dashboard
router.get("/metrics", adminController.getMetrics);

// Product management
router.get("/products/pending", adminController.getPendingProducts);
router.patch("/products/:id/approve", adminController.approveProduct);
router.patch(
  "/products/:id/reject",
  body("reason").notEmpty().withMessage("Rejection reason is required"),
  adminController.rejectProduct,
);
router.post(
  "/products/bulk-approve",
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("Product IDs array is required"),
  adminController.bulkApproveProducts,
);
router.post(
  "/products/bulk-reject",
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("Product IDs array is required"),
  body("reason").notEmpty().withMessage("Rejection reason is required"),
  adminController.bulkRejectProducts,
);
router.get("/products/stats", adminController.getProductStats);

//listing management
router.get("/listings/pending", adminController.getPendingListings);
router.patch("/listings/:id/approve", adminController.approveListing);
router.patch("/listings/:id/reject", adminController.rejectListing);
router.post(
  "/listings/bulk-approve",
  body("listingIds")
    .isArray({ min: 1 })
    .withMessage("Listing IDs array is required"),
  adminController.bulkApproveListings,
);
router.post(
  "/listings/bulk-reject",
  body("listingIds")
    .isArray({ min: 1 })
    .withMessage("Listing IDs array is required"),
  body("reason").notEmpty().withMessage("Rejection reason is required"),
  adminController.bulkRejectListings,
);
router.get("/listings/stats", adminController.getListingStats);

// User management
router.patch(
  "/users/:id/role",
  body("role")
    .isIn(["Farmer", "Trader", "admin", "Buyer"])
    .withMessage("Invalid role"),
  adminController.updateUserRole,
);
router.get("/kyc/pending", adminController.getPendingKYC);
router.patch("/kyc/:id/verify", adminController.verifyKYC);

module.exports = router;
