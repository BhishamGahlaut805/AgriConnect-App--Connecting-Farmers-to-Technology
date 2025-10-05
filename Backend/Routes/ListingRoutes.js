// routes/listingRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const listingController = require("../Controllers/listingController");
const { auth } = require("../middlewares/auth");
const  requireRole = require("../middlewares/requireRole");

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
  requireRole("Farmer", "Trader", "Admin"),
  createListingValidation,
  listingController.createListing
);

router.post(
  "/verify",
  auth,
  requireRole("Farmer", "Trader", "Admin"),
  otpValidation,
  listingController.verifyAndCreateListing
);

// User's listings
router.get("/my-listings", auth, listingController.getMyListings);

// Listing management
router.patch("/:id", auth, listingController.updateListing);
router.delete("/:id", auth, listingController.deleteListing);
router.patch(
  "/:id/status",
  auth,
  body("status")
    .isIn(["active", "inactive", "soldout"])
    .withMessage("Invalid status"),
  listingController.toggleListingStatus
);

module.exports = router;
