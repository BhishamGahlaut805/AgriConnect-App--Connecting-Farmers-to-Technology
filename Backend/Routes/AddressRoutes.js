const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { auth } = require("../middlewares/auth"); // Ensure user is authenticated

// All routes require authentication
router.use(auth);

// Create a new address
router.post("/", addressController.createAddress);

// Get all addresses of the user
router.get("/", addressController.getUserAddresses);

// Get default address
router.get("/default", addressController.getDefaultAddress);

// Get a single address by ID
router.get("/:id", addressController.getAddressById);

// Update an address
router.put("/:id", addressController.updateAddress);

// Delete an address (soft delete)
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
