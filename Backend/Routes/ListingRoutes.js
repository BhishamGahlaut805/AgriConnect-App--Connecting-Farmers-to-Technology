// routes/listingRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const listingController = require("../Controllers/listingController");
const { auth } = require("../Middlewares/auth");
const requireRole = require("../Middlewares/requireRole");

// Validation rules
const createListingValidation = [
  body("product").isMongoId().withMessage("Valid product ID is required"),
  body("pricePerUnit")
    .isFloat({ min: 0.01 })
    .withMessage("Valid price is required"),
  body("availableQty")
    .isInt({ min: 1 })
    .withMessage("Valid quantity is required"),
  body("minOrderQty")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid minimum order quantity is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

const otpValidation = [
  body("verificationId")
    .isMongoId()
    .withMessage("Valid verification ID is required"),
  body("otp")
    .matches(/^\d{6}$/)
    .withMessage("OTP must be 6 digits"),
];

// Public routes
router.get("/", listingController.listListings);

// Protected routes
router.post(
  "/",
  auth,
  requireRole("farmer", "trader", "admin"),
  createListingValidation,
  listingController.createListing,
);

router.post(
  "/verify",
  auth,
  requireRole("farmer", "trader", "admin"),
  otpValidation,
  listingController.verifyAndCreateListing,
);
// Get listing details
router.get(
  "/:id",
  auth,
  requireRole("farmer", "trader", "admin", "other"),
  listingController.getListing,
);

// User's listings
router.get("/my-listings/:userId", auth, listingController.getMyListings);

router.get(
  "/all",
  auth,
  requireRole("admin"),
  listingController.getAllListings,
);
// Listing management
router.patch("/:id", auth, listingController.updateListing);
router.delete("/:id", auth, listingController.deleteListing);
router.patch(
  "/:id/status",
  auth,
  body("status")
    .isIn(["active", "inactive", "soldout"])
    .withMessage("Invalid status"),
  listingController.toggleListingStatus,
);

// Bulk OTP-based listing creation initiation
router.post(
  "/bulk/initiate",
  auth,
  requireRole("farmer", "trader", "admin"),
  listingController.initiateBulkListingCreation,
);

// Bulk OTP-based listing verification
router.post(
  "/bulk/verify",
  auth,
  requireRole("farmer", "trader", "admin"),
  otpValidation,
  listingController.verifyAndCreateBulkListings,
);

// Get bulk creation status
router.get(
  "/bulk/status/:verificationId",
  auth,
  listingController.getBulkCreationStatus,
);

// Bulk update listings
router.patch(
  "/bulk/update",
  auth,
  requireRole("admin", "trader", "farmer"),
  listingController.bulkUpdateListings,
);
// Bulk delete listings
router.delete(
  "/bulk/delete",
  auth,
  requireRole("admin", "trader", "farmer"),
  listingController.bulkDeleteListings,
);

// Bulk toggle listing status
router.patch(
  "/bulk/toggle-status",
  auth,
  requireRole("admin", "trader", "farmer"),
  listingController.bulkToggleListingStatus,
);

module.exports = router;
