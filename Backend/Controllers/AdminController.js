// controllers/AdminController.js
const Product = require("../models/Product");
const User = require("../Models/userModel");
const Order = require("../models/Order");
const Listing = require("../models/Listing");

class AdminController {
  // Get dashboard metrics
  async getMetrics(req, res) {
    try {
      const [
        usersCount,
        ordersCount,
        pendingProductsCount,
        pendingListingsCount,
        totalRevenue,
        recentOrders,
      ] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments({ status: "pending", isActive: true }),
        Listing.countDocuments({ status: "pending", isActive: true }),
        Order.aggregate([
          { $match: { "payment.status": "PAID" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.find()
          .populate("user", "name email")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: usersCount,
          orders: ordersCount,
          pendingProducts: pendingProductsCount,
          pendingListings: pendingListingsCount,
          revenue: totalRevenue.length ? totalRevenue[0].total : 0,
          recentOrders,
        },
      });
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch metrics",
        error: error.message,
      });
    }
  }

  // Get pending products for approval
  async getPendingProducts(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find({
        status: "pending",
        isActive: true,
      })
        .populate("seller", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Product.countDocuments({
        status: "pending",
        isActive: true,
      });

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
      console.error("Get pending products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending products",
        error: error.message,
      });
    }
  }

  // Approve single product
  async approveProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Product is not pending approval",
        });
      }

      product.status = "approved";
      product.verifiedBy = req.user._id;
      product.verifiedAt = new Date();
      await product.save();

      const populatedProduct = await Product.findById(product._id)
        .populate("seller", "name email")
        .populate("verifiedBy", "name");

      res.status(200).json({
        success: true,
        message: "Product approved successfully",
        data: populatedProduct,
      });
    } catch (error) {
      console.error("Approve product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve product",
        error: error.message,
      });
    }
  }

  // Reject single product
  async rejectProduct(req, res) {
    try {
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Product is not pending approval",
        });
      }

      product.status = "rejected";
      product.rejectionReason = reason.trim();
      product.verifiedBy = req.user._id;
      product.verifiedAt = new Date();
      await product.save();

      res.status(200).json({
        success: true,
        message: "Product rejected successfully",
        data: product,
      });
    } catch (error) {
      console.error("Reject product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject product",
        error: error.message,
      });
    }
  }

  // Bulk approve products
  async bulkApproveProducts(req, res) {
    try {
      const { productIds } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Product IDs array is required",
        });
      }

      const result = await Product.updateMany(
        {
          _id: { $in: productIds },
          status: "pending",
          isActive: true,
        },
        {
          $set: {
            status: "approved",
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
          },
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} product(s) approved successfully`,
        approvedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Bulk approve error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve products",
        error: error.message,
      });
    }
  }

  // Bulk reject products
  async bulkRejectProducts(req, res) {
    try {
      const { productIds, reason } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Product IDs array is required",
        });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const result = await Product.updateMany(
        {
          _id: { $in: productIds },
          status: "pending",
          isActive: true,
        },
        {
          $set: {
            status: "rejected",
            rejectionReason: reason.trim(),
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
          },
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} product(s) rejected`,
        rejectedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Bulk reject error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject products",
        error: error.message,
      });
    }
  }

  // Get product statistics
  async getProductStats(req, res) {
    try {
      const stats = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          },
        },
      ]);

      const totalProducts = await Product.countDocuments({ isActive: true });
      const recentProducts = await Product.find({ isActive: true })
        .populate("seller", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const categoryStats = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          statusStats: stats,
          categoryStats,
          totalProducts,
          recentProducts,
        },
      });
    } catch (error) {
      console.error("Get product stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product statistics",
        error: error.message,
      });
    }
  }

  // User management - update role
  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      const validRoles = ["Farmer", "Trader", "Admin", "Buyer"];

      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user role",
        error: error.message,
      });
    }
  }

  // Get pending KYC applications
  async getPendingKYC(req, res) {
    try {
      const users = await User.find({
        "kyc.status": "pending",
        "kyc.submittedAt": { $exists: true },
      }).select("name email phone kyc submittedAt");

      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error("Get pending KYC error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending KYC applications",
        error: error.message,
      });
    }
  }

  // Verify KYC
  async verifyKYC(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.kyc.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "KYC is not pending verification",
        });
      }

      user.kyc.status = "verified";
      user.kyc.verifiedBy = req.user._id;
      user.kyc.verifiedAt = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: "KYC verified successfully",
        data: user,
      });
    } catch (error) {
      console.error("Verify KYC error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify KYC",
        error: error.message,
      });
    }
  }
}

module.exports = new AdminController();
