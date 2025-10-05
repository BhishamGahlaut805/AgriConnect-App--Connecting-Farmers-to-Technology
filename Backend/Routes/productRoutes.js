// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const productController = require("../Controllers/ProductController");
const { auth } = require("../middlewares/auth");
const requireRole  = require("../middlewares/requireRole");
const upload = require("../utils/upload");

// Validation rules
const productValidation = [
  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required"),
  body("products.*.title").notEmpty().withMessage("Product title is required"),
  body("products.*.description")
    .notEmpty()
    .withMessage("Product description is required"),
  body("products.*.category")
    .isIn([
      "VEGETABLE",
      "FRUIT",
      "GRAIN",
      "DAIRY",
      "MACHINERY",
      "FERTILIZER",
      "SEED",
      "PESTICIDE",
      "TOOLS",
      "OTHER",
    ])
    .withMessage("Invalid category"),
  body("products.*.price")
    .isFloat({ min: 0.01 })
    .withMessage("Valid price is required"),
  body("products.*.stock")
    .isInt({ min: 0 })
    .withMessage("Valid stock quantity is required"),
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
router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

// Protected routes - OTP verified product creation
router.post(
  "/initiate",
  auth,
  requireRole("Farmer", "Trader", "Admin"),
  productValidation,
  productController.initiateProductCreation
);

router.post(
  "/verify-create",
  auth,
  requireRole("Farmer", "Trader", "Admin"),
  otpValidation,
  upload.array("images", 6),
  productController.verifyAndCreateProducts
);

// User's products
router.get("/user/my-products", auth, productController.getMyProducts);

// Update and delete
router.patch("/:id", auth, productController.updateProduct);
router.delete("/:id", auth, productController.deleteProduct);

module.exports = router;
