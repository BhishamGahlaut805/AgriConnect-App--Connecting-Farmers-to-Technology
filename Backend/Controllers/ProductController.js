// controllers/ProductController.js
const Product = require("../models/Product");
const OTPVerification = require("../Models/OTPVerification");
const emailService = require("../Utils/emailService");
const { validationResult } = require("express-validator");

class ProductController {
  // Initiate product creation with OTP
  async initiateProductCreation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { products, email } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one product is required",
        });
      }

      // Validate each product
      for (const product of products) {
        if (
          !product.title ||
          !product.description ||
          !product.category ||
          !product.price ||
          !product.stock
        ) {
          return res.status(400).json({
            success: false,
            message: "All product fields are required",
          });
        }
      }

      // Generate OTP
      const otp = emailService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP with product data
      const otpRecord = await OTPVerification.create({
        email,
        otp,
        products,
        expiresAt,
      });

      // Send OTP email
      await emailService.sendOTP(email, otp, products.length);

      res.status(200).json({
        success: true,
        message: "OTP sent to your email",
        verificationId: otpRecord._id,
        expiresAt: otpRecord.expiresAt,
      });
    } catch (error) {
      console.error("OTP initiation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate product creation",
        error: error.message,
      });
    }
  }

  // Verify OTP and create products
  async verifyAndCreateProducts(req, res) {
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

      // Create products
      const createdProducts = [];
      for (const productData of otpRecord.products) {
        const product = await Product.create({
          ...productData,
          seller: req.user._id,
          status: req.user.role === "Admin" ? "approved" : "pending",
          images: (req.files || []).map((f) => "/uploads/" + f.filename),
        });
        createdProducts.push(product);
      }

      // Send admin notification if products are pending approval
      if (req.user.role !== "Admin") {
        await emailService.sendAdminNotification(
          otpRecord.email,
          createdProducts.length
        );
      }

      res.status(201).json({
        success: true,
        message:
          req.user.role === "Admin"
            ? `${createdProducts.length} product(s) created and approved successfully`
            : `${createdProducts.length} product(s) created successfully and submitted for admin approval`,
        products: createdProducts,
        count: createdProducts.length,
      });
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create products",
        error: error.message,
      });
    }
  }

  // List products with filtering and pagination
  async listProducts(req, res) {
    try {
      const {
        q,
        category,
        status,
        page = 1,
        limit = 20,
        minPrice,
        maxPrice,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filter = { isActive: true };
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // Apply filters based on user role
      if (!req.user || req.user.role !== "Admin") {
        filter.status = "approved";
      }

      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ];
      }

      if (category) filter.category = category;
      if (status) filter.status = status;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find(filter)
        .populate("seller", "name email phone")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Product.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("List products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  }

  // Get single product
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate("seller", "name email phone")
        .populate("verifiedBy", "name");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check if user can view pending product
      if (product.status === "pending" && req.user) {
        if (
          req.user.role !== "Admin" &&
          String(product.seller._id) !== String(req.user._id)
        ) {
          return res.status(403).json({
            success: false,
            message: "Product is under review and not available for viewing",
          });
        }
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
        error: error.message,
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check ownership or admin access
      if (
        String(product.seller) !== String(req.user._id) &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // If non-admin updates approved product, set back to pending
      if (req.user.role !== "Admin" && product.status === "approved") {
        req.body.status = "pending";
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate("seller", "name email");

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: error.message,
      });
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (
        String(product.seller) !== String(req.user._id) &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Soft delete
      product.isActive = false;
      await product.save();

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error: error.message,
      });
    }
  }

  // Get user's products
  async getMyProducts(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const filter = {
        seller: req.user._id,
        isActive: true,
      };

      if (status) filter.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Product.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get my products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch your products",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
