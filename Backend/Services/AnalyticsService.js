// services/analyticsService.js
const Order = require("../Models/Order");
const Listing = require("../Models/Listing");

const analyticsService = {
  generateAnalytics: async (userId, role, period) => {
    const dateFilter = getDateFilter(period);

    if (role === "admin") {
      return await generateAdminAnalytics(dateFilter);
    } else if (role === "farmer") {
      return await generateSellerAnalytics(userId, dateFilter);
    } else {
      return await generateUserAnalytics(userId, dateFilter);
    }
  },
};

const getDateFilter = (period) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "day":
      startDate.setDate(now.getDate() - 1);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  return { $gte: startDate };
};

const generateAdminAnalytics = async (dateFilter) => {
  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
    topProducts,
    revenueByMonth,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: dateFilter }),
    Order.aggregate([
      { $match: { createdAt: dateFilter, paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ orderStatus: "pending", createdAt: dateFilter }),
    Order.countDocuments({ orderStatus: "delivered", createdAt: dateFilter }),
    Order.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: dateFilter, paymentStatus: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingOrders,
    completedOrders,
    topProducts,
    revenueByMonth,
    conversionRate:
      totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0,
  };
};

const generateSellerAnalytics = async (sellerId, dateFilter) => {
  const sellerOrders = await Order.find({
    "items.farmer": sellerId,
    createdAt: dateFilter,
  }).populate("items.product");

  const totalRevenue = sellerOrders.reduce((sum, order) => {
    const sellerItems = order.items.filter(
      (item) => item.farmer.toString() === sellerId
    );
    return (
      sum +
      sellerItems.reduce(
        (itemSum, item) => itemSum + item.quantity * item.price,
        0
      )
    );
  }, 0);

  const listings = await Listing.find({ farmer: sellerId });
  const lowStockItems = listings.filter((listing) => listing.availableQty < 10);

  return {
    totalOrders: sellerOrders.length,
    totalRevenue,
    lowStockItems: lowStockItems.length,
    pendingOrders: sellerOrders.filter(
      (order) => order.orderStatus === "pending"
    ).length,
    popularProducts: await getSellerPopularProducts(sellerId, dateFilter),
  };
};

const generateUserAnalytics = async (userId, dateFilter) => {
  const userOrders = await Order.find({ user: userId, createdAt: dateFilter });

  return {
    totalOrders: userOrders.length,
    totalSpent: userOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    pendingOrders: userOrders.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.orderStatus)
    ).length,
    favoriteCategory: await getUserFavoriteCategory(userId, dateFilter),
  };
};

module.exports = analyticsService;
