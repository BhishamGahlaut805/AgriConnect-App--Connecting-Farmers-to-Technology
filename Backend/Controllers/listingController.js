// controllers/ListingController.js
const Listing = require("../models/Listing");
const Product = require("../models/Product");
const OTPVerification = require("../Models/OTPVerification");
const emailService = require("../Utils/emailService");
const { validationResult } = require("express-validator");

class ListingController {
  // Create listing with OTP verification
  async createListing(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        product,
        pricePerUnit,
        availableQty,
        minOrderQty,
        description,
        email,
      } = req.body;

      // Verify product exists and belongs to user
      const productDoc = await Product.findOne({
        _id: product,
        seller: req.user._id,
        isActive: true,
      });

      if (!productDoc) {
        return res.status(404).json({
          success: false,
          message: "Product not found or access denied",
        });
      }

      // Generate OTP
      const otp = emailService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Store listing data with OTP
      const otpRecord = await OTPVerification.create({
        email,
        otp,
        products: [
          {
            product,
            pricePerUnit: parseFloat(pricePerUnit),
            availableQty: parseInt(availableQty),
            minOrderQty: parseInt(minOrderQty) || 1,
            description,
            farmer: req.user._id,
          },
        ],
        expiresAt,
      });

      // Send OTP email
      await emailService.sendOTP(email, otp, 1);

      res.status(200).json({
        success: true,
        message: "OTP sent to your email for listing verification",
        verificationId: otpRecord._id,
        expiresAt: otpRecord.expiresAt,
      });
    } catch (error) {
      console.error("Create listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create listing",
        error: error.message,
      });
    }
  }

  // Verify OTP and create listing
  async verifyAndCreateListing(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { verificationId, otp } = req.body;

      // Find OTP record
      const otpRecord = await OTPVerification.findOne({
        _id: verificationId,
        verified: false,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 },
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "Invalid, expired OTP or too many attempts",
        });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();

        const attemptsLeft = 5 - otpRecord.attempts;
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${attemptsLeft} attempts left.`,
        });
      }

      // Mark OTP as verified
      otpRecord.verified = true;
      await otpRecord.save();

      // Create listing
      const listingData = otpRecord.products[0];
      const listing = await Listing.create({
        ...listingData,
        status: req.user.role === "Admin" ? "active" : "pending",
      });

      const populatedListing = await Listing.findById(listing._id)
        .populate("product", "title category images")
        .populate("farmer", "name email");

      // Send admin notification if listing is pending
      if (req.user.role !== "Admin") {
        await emailService.sendAdminNotification(otpRecord.email, 1, "listing");
      }

      res.status(201).json({
        success: true,
        message:
          req.user.role === "Admin"
            ? "Listing created and activated successfully"
            : "Listing created successfully and submitted for admin approval",
        data: populatedListing,
      });
    } catch (error) {
      console.error("Verify and create listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create listing",
        error: error.message,
      });
    }
  }

  // List all listings with filters
  async listListings(req, res) {
    try {
      const {
        status,
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filter = { isActive: true };
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // Apply status filter based on user role
      if (req.user && req.user.role === "Admin") {
        if (status) filter.status = status;
      } else {
        filter.status = "active";
      }

      if (minPrice || maxPrice) {
        filter.pricePerUnit = {};
        if (minPrice) filter.pricePerUnit.$gte = parseFloat(minPrice);
        if (maxPrice) filter.pricePerUnit.$lte = parseFloat(maxPrice);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let query = Listing.find(filter)
        .populate("product", "title category images unit specs")
        .populate("farmer", "name email phone rating")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Apply category filter through product population
      if (category) {
        query = query.populate({
          path: "product",
          match: { category },
        });
      }

      const listings = await query.lean();

      // Filter out listings where product didn't match category
      const filteredListings = category
        ? listings.filter((listing) => listing.product !== null)
        : listings;

      const total = await Listing.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: filteredListings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("List listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch listings",
        error: error.message,
      });
    }
  }

  // Get user's listings
  async getMyListings(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const filter = {
        farmer: req.user._id,
        isActive: true,
      };

      if (status) filter.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const listings = await Listing.find(filter)
        .populate("product", "title category images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Listing.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get my listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch your listings",
        error: error.message,
      });
    }
  }

  // Update listing
  async updateListing(req, res) {
    try {
      const listing = await Listing.findOne({
        _id: req.params.id,
        farmer: req.user._id,
        isActive: true,
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found or access denied",
        });
      }

      // If non-admin updates active listing, set back to pending
      if (req.user.role !== "Admin" && listing.status === "active") {
        req.body.status = "pending";
      }

      const updatedListing = await Listing.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      )
        .populate("product", "title category images")
        .populate("farmer", "name email");

      res.status(200).json({
        success: true,
        message: "Listing updated successfully",
        data: updatedListing,
      });
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update listing",
        error: error.message,
      });
    }
  }

  // Delete listing (soft delete)
  async deleteListing(req, res) {
    try {
      const listing = await Listing.findOne({
        _id: req.params.id,
        farmer: req.user._id,
        isActive: true,
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found or access denied",
        });
      }

      listing.isActive = false;
      await listing.save();

      res.status(200).json({
        success: true,
        message: "Listing deleted successfully",
      });
    } catch (error) {
      console.error("Delete listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete listing",
        error: error.message,
      });
    }
  }

  // Toggle listing status
  async toggleListingStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ["active", "inactive", "soldout"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const listing = await Listing.findOne({
        _id: req.params.id,
        farmer: req.user._id,
        isActive: true,
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found or access denied",
        });
      }

      listing.status = status;
      await listing.save();

      res.status(200).json({
        success: true,
        message: `Listing status updated to ${status}`,
        data: listing,
      });
    } catch (error) {
      console.error("Toggle listing status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update listing status",
        error: error.message,
      });
    }
  }
}

module.exports = new ListingController();
