const express = require("express");
const router = express.Router();
const dashboardController = require("../Controllers/DashboardController");
const { auth, authorize } = require("../Middlewares/auth");
const requireRole = require("../Middlewares/requireRole");
// All routes are protected
router.use(auth);

// User dashboard
router.get("/user/overview", dashboardController.getUserDashboard);

router.get("/user/analytics", dashboardController.getUserAnalytics);

// Seller dashboard
router.get(
  "/seller/overview",
  requireRole("farmer", "admin","trader"),
  dashboardController.getSellerDashboard
);

router.get(
  "/seller/analytics",
  requireRole("farmer", "admin","trader"),
  dashboardController.getSellerAnalytics
);

router.get(
  "/seller/products",
  requireRole("farmer", "admin","trader"),
  dashboardController.getSellerProducts
);

// Admin dashboard
router.get(
  "/admin/overview",
  requireRole("admin"),
  dashboardController.getAdminDashboard
);

router.get(
  "/admin/analytics",
  requireRole("admin"),
  dashboardController.getAdminAnalytics
);

router.get(
  "/admin/reports",
  requireRole("admin"),
  dashboardController.getAdminReports
);

module.exports = router;
