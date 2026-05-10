// controllers/ListingController.js
const Listing = require("../Models/Listing");
const Product = require("../Models/Product");
const OTPVerification = require("../Models/OTPVerification");
const emailService = require("../Utils/emailService");
const { validationResult } = require("express-validator");

class ListingController {
  // Create listing with OTP verification
  async createListing(req, res) {
    // console.log("Create listing request body:", req.body);
    try {
      const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Validation failed",
      //     errors: errors.array(),
      //   });
      // }
      console.log("Errors are : ", errors.array());
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
      console.log("Request body for verifyAndCreateListing:", req.body);
      console.log("Errors are : ", errors.array());

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
      console.log("Fetching listings for user:", req.userId);
      const { status, page = 1, limit = 20 } = req.query;

      const filter = {
        farmer: req.userId,
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
        { new: true, runValidators: true },
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
  async getAllListings(req, res) {
    try {
      console.log("MAKING REQUESTS HERE");
      const { status, page = 1, limit = 20 } = req.query;
      const filter = { isActive: true };
      if (status) filter.status = status;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const listings = await Listing.find(filter)
        .populate("product", "title category images")
        .populate("farmer", "name email phone rating")
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
      console.error("Get all listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch listings",
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

  async initiateBulkListingCreation(req, res) {
    // Implementation for bulk listing creation initiation
    const { listings } = req.body;
    console.log("Bulk listings request body:", req.body);
    try {
      // Validate listings array
      if (!Array.isArray(listings) || listings.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Listings array is required and cannot be empty",
        });
      }
      // Generate OTP
      const otp = emailService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      // Store listings data with OTP
      const otpRecord = await OTPVerification.create({
        email: req.body.email,
        otp,
        products: listings.map((listing) => ({
          ...listing,
          farmer: req.user._id,
        })),
        expiresAt,
      });
      // Send OTP email
      await emailService.sendOTP(req.body.email, otp, listings.length);
      res.status(200).json({
        success: true,
        message: "OTP sent to your email for bulk listing verification",
        verificationId: otpRecord._id,
        expiresAt: otpRecord.expiresAt,
      });
    } catch (error) {
      console.error("Initiate bulk listing creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate bulk listing creation",
        error: error.message,
      });
    }
  }

  async verifyAndCreateBulkListings(req, res) {
    // Implementation for bulk listing verification and creation
    try {
      const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Validation failed",
      //     errors: errors.array(),
      //   });
      // }
      const { verificationId, otp } = req.body;
      // Find OTP record
      const otpRecord = await OTPVerification.findOne({
        _id: verificationId,
        otp,
        expiresAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      // Create listings
      const createdListings = await Listing.insertMany(otpRecord.products);
      // Delete OTP record
      await OTPVerification.deleteOne({ _id: verificationId });

      res.status(201).json({
        success: true,
        message: "Bulk listings created successfully",
        data: createdListings,
      });
    } catch (error) {
      console.error("Verify and create bulk listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify and create bulk listings",
        error: error.message,
      });
    }
  }

  async getBulkCreationStatus(req, res) {
    // Implementation for fetching bulk creation status
    const { verificationId } = req.params;
    try {
      const otpRecord = await OTPVerification.findById(verificationId).lean();
      if (!otpRecord) {
        return res.status(404).json({
          success: false,
          message: "Verification record not found",
        });
      }
      res.status(200).json({
        success: true,
        data: {
          verified: otpRecord.verified,
          expiresAt: otpRecord.expiresAt,
        },
      });
    } catch (error) {
      console.error("Get bulk creation status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch bulk creation status",
        error: error.message,
      });
    }
  }
  async bulkUpdateListings(req, res) {
    // Implementation for bulk updating listings
    try {
      const { listingIds, updateData } = req.body;
      if (!Array.isArray(listingIds) || listingIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "listingIds array is required and cannot be empty",
        });
      }
      const result = await Listing.updateMany(
        { _id: { $in: listingIds }, farmer: req.user._id, isActive: true },
        { $set: updateData },
      );
      res.status(200).json({
        success: true,
        message: `${result.nModified} listings updated successfully`,
        data: result,
      });
    } catch (error) {
      console.error("Bulk update listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk update listings",
        error: error.message,
      });
    }
  }

  async bulkDeleteListings(req, res) {
    // Implementation for bulk deleting listings
    try {
      const { listingIds } = req.body;
      if (!Array.isArray(listingIds) || listingIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "listingIds array is required and cannot be empty",
        });
      }
      const result = await Listing.updateMany(
        { _id: { $in: listingIds }, farmer: req.user._id, isActive: true },
        { $set: { isActive: false } },
      );
      res.status(200).json({
        success: true,
        message: `${result.nModified} listings deleted successfully`,
        data: result,
      });
    } catch (error) {
      console.error("Bulk delete listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk delete listings",
        error: error.message,
      });
    }
  }
  async bulkToggleListingStatus(req, res) {
    // Implementation for bulk toggling listing status
    try {
      const { listingIds, status } = req.body;
      const validStatuses = ["active", "inactive", "soldout"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      if (!Array.isArray(listingIds) || listingIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "listingIds array is required and cannot be empty",
        });
      }
      const result = await Listing.updateMany(
        { _id: { $in: listingIds }, farmer: req.user._id, isActive: true },
        { $set: { status } },
      );
      res.status(200).json({
        success: true,
        message: `${result.nModified} listings status updated to ${status} successfully`,
        data: result,
      });
    } catch (error) {
      console.error("Bulk toggle listing status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk toggle listing status",
        error: error.message,
      });
    }
  }
  async getListing(req, res) {
    try {
      // console.log("MAKING REQUESTS FROM HERE ", req.params.id);
      // if(req.params.id=="all"){
      //   return getAllListings(req, res);
      // }
      const listing = await Listing.findOne({
        _id: req.params.id,
        isActive: true,
      })

        .populate("product", "title category images unit specs description")
        .populate("farmer", "name email phone rating");
      console.log("Listing found: ", listing);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found",
        });
      }
      console.log("Returning listing: ", listing);
      res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      console.error("Get listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch listing",
        error: error.message,
      });
    }
  }
}

module.exports = new ListingController();
