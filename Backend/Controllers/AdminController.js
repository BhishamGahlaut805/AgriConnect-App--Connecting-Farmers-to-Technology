// controllers/AdminController.js
const Product = require("../Models/Product");
const User = require("../Models/userModel");
const Order = require("../Models/Order");
const Listing = require("../Models/Listing");
// const Inventory = require("../models/Inventory");
const Auction = require("../Models/Auction");
const Crop = require("../Models/Crop");
const Payment = require("../Models/Payment");
const Farm = require("../Models/farmmodel");
const DiseaseReport = require("../Models/DiseaseReportsmodel");
const YieldPrediction = require("../Models/YieldPredictions");
const Category = require("../Models/Category");
const FarmStats = require("../Models/farmstatmodel");
const CropData = require("../Models/CropData");
const Transaction = require("../Models/Transaction");
const UserSummary = require("../Models/usersummarymodel");

class AdminController {
  // Get dashboard metrics
  // Enhanced Admin Analytics Function
  async getMetrics(req, res) {
    try {
      const [
        // User & Authentication Metrics
        usersCount,
        kycPendingCount,
        activeUsersCount,

        // Product & Listing Metrics
        totalProductsCount,
        pendingProductsCount,
        approvedProductsCount,
        rejectedProductsCount,
        totalListingsCount,
        pendingListingsCount,
        activeListingsCount,
        soldOutListingsCount,

        // Order & Revenue Metrics
        totalOrdersCount,
        completedOrdersCount,
        pendingOrdersCount,
        cancelledOrdersCount,
        revenueData,

        // Inventory & Cart Metrics
        // totalInventoryItems,
        lowStockItems,

        // Auction & Crop Metrics
        activeAuctionsCount,
        scheduledAuctionsCount,
        closedAuctionsCount,
        totalCropsCount,
        listedCropsCount,
        soldCropsCount,

        // Payment & Transaction Metrics
        successfulPaymentsCount,
        failedPaymentsCount,
        totalTransactionValue,

        // Farm & Disease Metrics
        totalFarmsCount,
        totalDiseaseReports,
        recentDiseaseReports,

        // Yield Prediction Metrics
        yieldPredictionsCount,
        recentYieldPredictions,

        // Recent Activity
        recentOrders,
        recentProducts,
        recentUsers,

        // Category & Platform Metrics
        totalCategoriesCount,
        activeCategoriesCount,
      ] = await Promise.all([
        // User & Authentication Metrics
        User.countDocuments(),
        User.countDocuments({ kycStatus: "pending" }),
        User.countDocuments({ isActive: true }),

        // Product & Listing Metrics
        Product.countDocuments(),
        Product.countDocuments({ status: "pending", isActive: true }),
        Product.countDocuments({ status: "approved", isActive: true }),
        Product.countDocuments({ status: "rejected", isActive: true }),
        Listing.countDocuments(),
        Listing.countDocuments({ status: "pending", isActive: true }),
        Listing.countDocuments({ status: "active", isActive: true }),
        Listing.countDocuments({ status: "soldout", isActive: true }),

        // Order & Revenue Metrics
        Order.countDocuments(),
        Order.countDocuments({ status: "DELIVERED" }),
        Order.countDocuments({
          status: { $in: ["CREATED", "CONFIRMED", "PACKED", "IN_TRANSIT"] },
        }),
        Order.countDocuments({ status: "CANCELLED" }),
        Order.aggregate([
          { $match: { "payment.status": "PAID" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
              averageOrderValue: { $avg: "$total" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),

        // Inventory & Cart Metrics
        // Inventory.countDocuments(),
        // Inventory.countDocuments({ quantity: { $lt: 10 } }),

        // Auction & Crop Metrics
        Auction.countDocuments({ status: "OPEN" }),
        Auction.countDocuments({ status: "SCHEDULED" }),
        Auction.countDocuments({ status: "CLOSED" }),
        Crop.countDocuments(),
        Crop.countDocuments({ status: "LISTED" }),
        Crop.countDocuments({ status: "SOLD" }),

        // Payment & Transaction Metrics
        Payment.countDocuments({ status: "SUCCESS" }),
        Payment.countDocuments({ status: "FAILED" }),
        Payment.aggregate([
          { $match: { status: "SUCCESS" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        // Farm & Disease Metrics
        Farm.countDocuments(),
        DiseaseReport.countDocuments(),
        DiseaseReport.find().sort({ timestamp: -1 }).limit(10).lean(),

        // Yield Prediction Metrics
        YieldPrediction.countDocuments(),
        YieldPrediction.find().sort({ createdAt: -1 }).limit(5).lean(),

        // Recent Activity
        Order.find()
          .populate("buyer", "name email")
          .populate("seller", "name email")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Product.find({ status: "approved" })
          .populate("seller", "name email")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        User.find().sort({ createdAt: -1 }).limit(5).lean(),

        // Category & Platform Metrics
        Category.countDocuments(),
        Category.countDocuments({ isActive: true }),
      ]);

      // Additional Aggregated Analytics
      const [monthlyRevenue, productCategoryStats, userRegistrationStats] =
        await Promise.all([
          // Monthly Revenue Trend
          Order.aggregate([
            {
              $match: {
                "payment.status": "PAID",
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                dailyRevenue: { $sum: "$total" },
                orderCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 },
          ]),

          // Product Category Distribution
          Product.aggregate([
            { $match: { status: "approved" } },
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
                avgPrice: { $avg: "$price" },
              },
            },
            { $sort: { count: -1 } },
          ]),

          // User Registration Trend
          User.aggregate([
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                registrations: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 },
          ]),
        ]);

      // Farm Statistics
      const farmStats = await FarmStats.aggregate([
        {
          $group: {
            _id: null,
            totalImagesAnalyzed: { $sum: "$total_images_analyzed" },
            totalDiseasedImages: { $sum: "$diseased_images_found" },
            avgMaxRiskPercent: { $avg: "$max_risk_percent" },
          },
        },
      ]);

      // Crop Data Analytics
      const cropDataStats = await CropData.aggregate([
        {
          $group: {
            _id: "$crop",
            totalEntries: { $sum: 1 },
            diseasedCount: {
              $sum: {
                $cond: [{ $eq: ["$isDiseased", "Yes"] }, 1, 0],
              },
            },
            healthyCount: {
              $sum: {
                $cond: [{ $eq: ["$isDiseased", "No"] }, 1, 0],
              },
            },
          },
        },
        { $sort: { totalEntries: -1 } },
      ]);

      // Transaction Summary (if Transaction model exists)
      const transactionSummary =
        (await Transaction?.aggregate([
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
        ])) || [];

      // User Summary Analytics (if UserSummary model exists)
      const userSummary = (await UserSummary?.findOne().lean()) || {};

      // Platform Health Metrics
      const platformHealth = {
        database: "connected", // You can add actual DB health check
        api: "healthy",
        storage: "normal",
        uptime: process.uptime(),
      };

      // Compile the comprehensive response
      const metrics = {
        // Basic Counts
        overview: {
          totalUsers: usersCount,
          activeUsers: activeUsersCount,
          kycPending: kycPendingCount,
          totalProducts: totalProductsCount,
          totalListings: totalListingsCount,
          totalOrders: totalOrdersCount,
          totalFarms: totalFarmsCount,
          totalCategories: totalCategoriesCount,
          activeCategories: activeCategoriesCount,
        },

        // Approval Queue
        pendingApprovals: {
          products: pendingProductsCount,
          listings: pendingListingsCount,
          kyc: kycPendingCount,
        },

        // Product Analytics
        products: {
          total: totalProductsCount,
          pending: pendingProductsCount,
          approved: approvedProductsCount,
          rejected: rejectedProductsCount,
          byCategory: productCategoryStats,
        },

        // Listing Analytics
        listings: {
          total: totalListingsCount,
          pending: pendingListingsCount,
          active: activeListingsCount,
          soldOut: soldOutListingsCount,
        },

        // Order Analytics
        orders: {
          total: totalOrdersCount,
          completed: completedOrdersCount,
          pending: pendingOrdersCount,
          cancelled: cancelledOrdersCount,
          statusDistribution: {
            created: await Order.countDocuments({ status: "CREATED" }),
            confirmed: await Order.countDocuments({ status: "CONFIRMED" }),
            packed: await Order.countDocuments({ status: "PACKED" }),
            inTransit: await Order.countDocuments({ status: "IN_TRANSIT" }),
            delivered: completedOrdersCount,
            cancelled: cancelledOrdersCount,
          },
        },

        // Financial Analytics
        financial: {
          totalRevenue: revenueData.length ? revenueData[0].totalRevenue : 0,
          averageOrderValue: revenueData.length
            ? revenueData[0].averageOrderValue
            : 0,
          totalTransactions: successfulPaymentsCount,
          transactionValue: totalTransactionValue.length
            ? totalTransactionValue[0].total
            : 0,
          monthlyRevenueTrend: monthlyRevenue,
          paymentSuccessRate:
            totalOrdersCount > 0
              ? (successfulPaymentsCount / totalOrdersCount) * 100
              : 0,
        },

        // // Inventory & Cart Analytics
        // inventory: {
        //   totalItems: totalInventoryItems,
        //   lowStockItems: lowStockItems,
        //   lowStockPercentage:
        //     totalInventoryItems > 0
        //       ? (lowStockItems / totalInventoryItems) * 100
        //       : 0,
        // },

        // Auction & Crop Analytics
        auctions: {
          active: activeAuctionsCount,
          scheduled: scheduledAuctionsCount,
          closed: closedAuctionsCount,
          crops: {
            total: totalCropsCount,
            listed: listedCropsCount,
            sold: soldCropsCount,
          },
        },

        // Farm & Disease Analytics
        farmAnalytics: {
          totalFarms: totalFarmsCount,
          totalDiseaseReports: totalDiseaseReports,
          imagesAnalyzed: farmStats.length
            ? farmStats[0].totalImagesAnalyzed
            : 0,
          diseasedImages: farmStats.length
            ? farmStats[0].totalDiseasedImages
            : 0,
          diseaseRate:
            farmStats.length && farmStats[0].totalImagesAnalyzed > 0
              ? (farmStats[0].totalDiseasedImages /
                  farmStats[0].totalImagesAnalyzed) *
                100
              : 0,
          cropHealthStats: cropDataStats,
        },

        // Yield Prediction Analytics
        yieldPredictions: {
          total: yieldPredictionsCount,
          recent: recentYieldPredictions,
        },

        // User Analytics
        users: {
          registrationTrend: userRegistrationStats,
          summary: userSummary,
        },

        // Transaction Analytics
        transactions: {
          summary: transactionSummary,
        },

        // Recent Activity
        recentActivity: {
          orders: recentOrders,
          products: recentProducts,
          users: recentUsers,
          diseaseReports: recentDiseaseReports,
        },

        // Platform Health
        platformHealth: platformHealth,

        // Timestamp
        lastUpdated: new Date(),
        dataRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      };

      res.status(200).json({
        success: true,
        data: metrics,
        message: "Comprehensive platform metrics retrieved successfully",
      });
    } catch (error) {
      console.error("Get comprehensive metrics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch comprehensive metrics",
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
        },
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
        },
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
        { new: true },
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

  // Additional methods for listing management can be added here
  // Get pending listings for approval
  async getPendingListings(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      // console.log("Fetching pending listings with pagination:", {
      //   page,
      //   limit,
      //   skip,
      // });
      const listings = await Listing.find({
        status: "pending",
        isActive: true,
      })
        .populate("farmer", "name email phone")
        .populate("product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      // console.log("Pending listings fetched:", listings);

      const total = await Listing.countDocuments({
        status: "pending",
        isActive: true,
      });
      console.log("Total pending listings count:", total);
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
      console.error("Get pending listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending listings",
        error: error.message,
      });
    }
  }
  // Approve single listing
  async approveListing(req, res) {
    try {
      const listing = await Listing.findById(req.params.id);
      console.log("Approving listing with ID:", req.params.id, listing);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found",
        });
      }
      if (listing.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Listing is not pending approval",
        });
      }
      listing.status = "active";
      listing.verifiedBy = req.user._id;
      listing.verifiedAt = new Date();
      await listing.save();
      const populatedListing = await Listing.findById(listing._id)
        .populate("farmer", "name email")
        .populate("verifiedBy", "name");
      res.status(200).json({
        success: true,
        message: "Listing approved successfully",
        data: populatedListing,
      });
    } catch (error) {
      console.error("Approve listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve listing",
        error: error.message,
      });
    }
  }
  // Reject single listing
  async rejectListing(req, res) {
    try {
      const { reason } = req.body;
      console.log(
        "Rejecting listing with ID:",
        req.params.id,
        "Reason:",
        reason,
      );
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found",
        });
      }
      if (listing.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Listing is not pending approval",
        });
      }
      listing.status = "rejected";
      listing.rejectionReason = reason.trim();
      listing.verifiedBy = req.user._id;
      listing.verifiedAt = new Date();
      await listing.save();
      res.status(200).json({
        success: true,
        message: "Listing rejected successfully",
        data: listing,
      });
    } catch (error) {
      console.error("Reject listing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject listing",
        error: error.message,
      });
    }
  }
  // Bulk approve listings
  async bulkApproveListings(req, res) {
    try {
      const { listingIds } = req.body;
      console.log("Bulk approving listings with IDs:", listingIds);
      if (!Array.isArray(listingIds) || listingIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Listing IDs array is required",
        });
      }
      const result = await Listing.updateMany(
        {
          _id: { $in: listingIds },
          status: "pending",
          isActive: true,
        },
        {
          $set: {
            status: "active",
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
          },
        },
      );
      res.status(200).json({
        success: true,

        message: `${result.modifiedCount} listing(s) approved successfully`,
        approvedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Bulk approve listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve listings",
        error: error.message,
      });
    }
  }

  // Bulk reject listings

  async bulkRejectListings(req, res) {
    try {
      const { listingIds, reason } = req.body;
      console.log(
        "Bulk rejecting listings with IDs:",
        listingIds,
        "Reason:",
        reason,
      );
      if (!Array.isArray(listingIds) || listingIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Listing IDs array is required",
        });
      }
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }
      const result = await Listing.updateMany(
        {
          _id: { $in: listingIds },

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
        },
      );
      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} listing(s) rejected`,
        rejectedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Bulk reject listings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject listings",
        error: error.message,
      });
    }
  }

  // Get listing statistics
  async getListingStats(req, res) {
    try {
      const stats = await Listing.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: {
              $sum: { $multiply: ["$pricePerUnit", "$availableQty"] },
            },
          },
        },
      ]);
      const totalListings = await Listing.countDocuments({ isActive: true });
      const recentListings = await Listing.find({ isActive: true })

        .populate("farmer", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      const productStats = await Listing.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$product",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 1,
            count: 1,
            productName: "$product.name",
            category: "$product.category",
          },
        },
      ]);
      res.status(200).json({
        success: true,
        data: {
          statusStats: stats,
          productStats,
          totalListings,
          recentListings,
        },
      });
    } catch (error) {
      console.error("Get listing stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch listing statistics",
        error: error.message,
      });
    }
  }
}

module.exports = new AdminController();
