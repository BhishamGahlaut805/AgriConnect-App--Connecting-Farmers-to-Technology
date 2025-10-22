const Order = require("../models/Order");
const User = require("../models/UserModel");
const Product = require("../models/Product");
const Listing = require("../models/Listing");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../Services/asyncHandler");

const dashboardController = {
  // User Dashboard Overview
  getUserDashboard: asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      recentOrders,
      totalSpent,
    ] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.countDocuments({
        user: userId,
        orderStatus: { $in: ["pending", "confirmed", "processing"] },
      }),
      Order.countDocuments({
        user: userId,
        orderStatus: "delivered",
      }),
      Order.find({ user: userId })
        .populate("items.product", "title images")
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([
        { $match: { user: userId, paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalSpent: totalSpent[0]?.total || 0,
        },
        recentOrders,
        quickStats: {
          awaitingPayment: await Order.countDocuments({
            user: userId,
            paymentStatus: "pending",
          }),
          inTransit: await Order.countDocuments({
            user: userId,
            deliveryStatus: { $in: ["in_transit", "out_for_delivery"] },
          }),
        },
      },
    });
  }),

  // User Analytics
  getUserAnalytics: asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { period = "month" } = req.query;

    const dateRange = getDateRange(period);

    const [orderStats, categoryStats, monthlySpending] = await Promise.all([
      // Order statistics
      Order.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: dateRange.start },
          },
        },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Category-wise spending
      Order.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: dateRange.start },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalSpent: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalSpent: -1 } },
      ]),

      // Monthly spending
      Order.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: dateRange.start },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalSpent: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        orderStats,
        categoryStats,
        monthlySpending,
        period,
      },
    });
  }),

  // Seller Dashboard Overview
  getSellerDashboard: asyncHandler(async (req, res, next) => {
    const sellerId = req.user.id;

    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      lowStockProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments({ "items.farmer": sellerId }),
      Order.countDocuments({
        "items.farmer": sellerId,
        orderStatus: { $in: ["pending", "confirmed"] },
      }),
      Order.aggregate([
        {
          $match: {
            "items.farmer": sellerId,
            paymentStatus: "completed",
          },
        },
        { $unwind: "$items" },
        { $match: { "items.farmer": sellerId } },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
      ]),
      Listing.find({
        farmer: sellerId,
        availableQty: { $lt: 10 },
      }).populate("product", "title images"),
      Order.find({ "items.farmer": sellerId })
        .populate("user", "name")
        .populate("items.product", "title images")
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([
        { $match: { "items.farmer": sellerId } },
        { $unwind: "$items" },
        { $match: { "items.farmer": sellerId } },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          lowStockCount: lowStockProducts.length,
        },
        recentOrders,
        topProducts,
        lowStockProducts,
        inventoryStats: await getSellerInventoryStats(sellerId),
      },
    });
  }),

  // Seller Analytics
  getSellerAnalytics: asyncHandler(async (req, res, next) => {
    const sellerId = req.user.id;
    const { period = "month" } = req.query;

    const dateRange = getDateRange(period);

    const [salesData, productPerformance, customerStats] = await Promise.all([
      // Sales data over time
      Order.aggregate([
        {
          $match: {
            "items.farmer": sellerId,
            createdAt: { $gte: dateRange.start },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.farmer": sellerId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalSales: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // Product performance
      Order.aggregate([
        {
          $match: {
            "items.farmer": sellerId,
            createdAt: { $gte: dateRange.start },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.farmer": sellerId } },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            averageRating: { $avg: "$items.rating" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]),

      // Customer statistics
      Order.aggregate([
        {
          $match: {
            "items.farmer": sellerId,
            createdAt: { $gte: dateRange.start },
          },
        },
        {
          $group: {
            _id: "$user",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
        { $sort: { totalSpent: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        productPerformance,
        customerStats,
        period,
      },
    });
  }),

  // Seller Products
  getSellerProducts: asyncHandler(async (req, res, next) => {
    const sellerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { farmer: sellerId };
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .populate("product", "title images category")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Listing.countDocuments(filter);

    // Get sales data for products
    const productIds = listings.map((listing) => listing.product._id);
    const salesData = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.product": { $in: productIds } } },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
    ]);

    const listingsWithSales = listings.map((listing) => {
      const sales = salesData.find(
        (s) => s._id.toString() === listing.product._id.toString()
      );
      return {
        ...listing.toObject(),
        sales: sales || { totalSold: 0, totalRevenue: 0 },
      };
    });

    res.json({
      success: true,
      data: {
        products: listingsWithSales,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  }),

  // Admin Dashboard Overview
  getAdminDashboard: asyncHandler(async (req, res, next) => {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockItems,
      recentOrders,
      topSellers,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ orderStatus: "pending" }),
      Listing.countDocuments({ availableQty: { $lt: 10 } }),
      Order.find()
        .populate("user", "name")
        .populate("items.product", "title")
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.farmer",
            totalSales: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "farmer",
          },
        },
        { $unwind: "$farmer" },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingOrders,
          lowStockItems,
        },
        recentOrders,
        topSellers,
        systemHealth: await getSystemHealthStats(),
      },
    });
  }),

  // Admin Analytics
  getAdminAnalytics: asyncHandler(async (req, res, next) => {
    const { period = "month" } = req.query;
    const dateRange = getDateRange(period);

    const [
      revenueAnalytics,
      userGrowth,
      categoryPerformance,
      orderStatusDistribution,
    ] = await Promise.all([
      // Revenue analytics
      Order.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: dateRange.start },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // User growth
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Category performance
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),

      // Order status distribution
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start },
          },
        },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        revenueAnalytics,
        userGrowth,
        categoryPerformance,
        orderStatusDistribution,
        period,
      },
    });
  }),

  // Admin Reports
  getAdminReports: asyncHandler(async (req, res, next) => {
    const { reportType, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let reportData;

    switch (reportType) {
      case "sales":
        reportData = await generateSalesReport(dateFilter);
        break;
      case "inventory":
        reportData = await generateInventoryReport();
        break;
      case "users":
        reportData = await generateUserReport(dateFilter);
        break;
      default:
        return next(new AppError("Invalid report type", 400));
    }

    res.json({
      success: true,
      data: reportData,
    });
  }),
};

// Helper functions
function getDateRange(period) {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "day":
      start.setDate(now.getDate() - 1);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return { start, end: now };
}

async function getSellerInventoryStats(sellerId) {
  const stats = await Listing.aggregate([
    { $match: { farmer: sellerId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: "$availableQty" },
        lowStockItems: {
          $sum: {
            $cond: [{ $lt: ["$availableQty", 10] }, 1, 0],
          },
        },
        outOfStockItems: {
          $sum: {
            $cond: [{ $eq: ["$availableQty", 0] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    }
  );
}

async function getSystemHealthStats() {
  const [activeUsers, systemLoad, databaseStats] = await Promise.all([
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
    // In a real system, you would get this from your monitoring system
    Promise.resolve({ cpu: 45, memory: 60, disk: 75 }),
    // Database statistics
    Order.db.db.command({ dbStats: 1 }),
  ]);

  return {
    activeUsers,
    systemLoad,
    databaseSize: databaseStats.dataSize,
  };
}

async function generateSalesReport(dateFilter) {
  return await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);
}

async function generateInventoryReport() {
  return await Listing.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalStock: { $sum: "$availableQty" },
      },
    },
  ]);
}

async function generateUserReport(dateFilter) {
  return await User.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
}

module.exports = dashboardController;
