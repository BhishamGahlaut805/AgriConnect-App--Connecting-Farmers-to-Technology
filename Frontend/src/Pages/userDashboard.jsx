import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaShoppingCart,
  FaClipboardList,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShoppingBag,
  FaHistory,
  FaCog,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaArrowRight,
  FaHome,
  FaStore,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CartBar from "./HarvestLink/Cartbar";
import DashboardService from "../API/DashboardService";
import OrderService from "../API/OrderService";

const UserDashboard = () => {
  const [user, setUser] = useState({ name: "Loading...", _id: "" });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
    awaitingPayment: 0,
    inTransit: 0,
    pendingVerification: 0,
    cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    loadAllOrders();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const storedUser = JSON.parse(localStorage.getItem("userDetails"));
      if (storedUser) setUser(storedUser);

      const dashboardResponse = await DashboardService.getUserDashboard();
      console.log("Dashboard Response:", dashboardResponse);

      if (dashboardResponse?.success && dashboardResponse.data) {
        const {
          overview = {},
          quickStats = {},
          recentOrders = [],
        } = dashboardResponse.data;

        setStats({
          totalOrders: overview.totalOrders || 0,
          pendingOrders: overview.pendingOrders || 0,
          deliveredOrders: overview.deliveredOrders || 0,
          totalSpent: overview.totalSpent || 0,
          awaitingPayment: quickStats.awaitingPayment || 0,
          inTransit: quickStats.inTransit || 0,
          pendingVerification: quickStats.pendingVerification || 0,
          cancelledOrders: quickStats.cancelledOrders || 0,
        });

        setRecentOrders(recentOrders.slice(0, 5)); // Show only 5 recent orders
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllOrders = async () => {
    try {
      const ordersResponse = await OrderService.getUserOrders();
      if (ordersResponse?.success) {
        setAllOrders(ordersResponse.data?.orders || []);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "pending_verification":
        return <FaClock className="text-orange-500 animate-pulse" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "processing":
        return <FaBox className="text-purple-500" />;
      case "shipped":
        return <FaTruck className="text-indigo-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaClipboardList className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_verification":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      cod: { text: "Cash on Delivery", color: "text-green-600 bg-green-50" },
      upi: { text: "UPI", color: "text-blue-600 bg-blue-50" },
      card: { text: "Card", color: "text-purple-600 bg-purple-50" },
      credit_card: {
        text: "Credit Card",
        color: "text-purple-600 bg-purple-50",
      },
      debit_card: { text: "Debit Card", color: "text-purple-600 bg-purple-50" },
      net_banking: {
        text: "Net Banking",
        color: "text-orange-600 bg-orange-50",
      },
    };
    return (
      methodMap[method] || { text: method, color: "text-gray-600 bg-gray-50" }
    );
  };

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrdersByStatus = (status) => {
    return allOrders.filter((order) => order.orderStatus === status);
  };

  if (loading) {
    return (
      <div className="mt-36 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-36 min-h-screen bg-gray-50 dark:bg-gray-900">
      <CartBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12 px-6 md:px-12 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-lg text-green-100">
                Here's your complete marketplace overview
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">
                  ₹{stats.totalSpent.toLocaleString()}
                </p>
                <p className="text-green-100 text-sm">Total Spent</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-green-100 text-sm">Total Orders</p>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              to="/harvestLink/orders"
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition"
            >
              <FaClipboardList className="mx-auto text-xl mb-2" />
              <span className="text-sm">All Orders</span>
            </Link>
            <Link
              to="/harvestLink/users/orders/pending"
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition"
            >
              <FaClock className="mx-auto text-xl mb-2" />
              <span className="text-sm">Pending OTP</span>
              {stats.pendingVerification > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pendingVerification}
                </span>
              )}
            </Link>
            <Link
              to="/harvestLink/cart"
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition"
            >
              <FaShoppingCart className="mx-auto text-xl mb-2" />
              <span className="text-sm">Cart</span>
            </Link>
            <Link
              to="/harvestLink/addresses"
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition"
            >
              <FaMapMarkerAlt className="mx-auto text-xl mb-2" />
              <span className="text-sm">Addresses</span>
            </Link>
            <Link
              to="/harvestLink/browse"
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition"
            >
              <FaStore className="mx-auto text-xl mb-2" />
              <span className="text-sm">Browse</span>
            </Link>
            <Link
              to="/harvestLink/v1/agriConnect"
              className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition"
            >
              <FaHome className="mx-auto text-xl mb-2" />
              <span className="text-sm">Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center border-l-4 border-green-500">
            <FaClipboardList className="text-3xl text-green-600 mb-3 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalOrders}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Total Orders</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center border-l-4 border-orange-500">
            <FaClock className="text-3xl text-orange-600 mb-3 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.pendingVerification}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Pending OTP</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center border-l-4 border-blue-500">
            <FaTruck className="text-3xl text-blue-600 mb-3 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.inTransit}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">In Transit</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center border-l-4 border-emerald-500">
            <FaCheckCircle className="text-3xl text-emerald-600 mb-3 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.deliveredOrders}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Delivered</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", name: "Overview", icon: FaClipboardList },
                { id: "all-orders", name: "All Orders", icon: FaHistory },
                { id: "pending", name: "Pending OTP", icon: FaClock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="text-sm" />
                    <span>{tab.name}</span>
                    {tab.id === "pending" && stats.pendingVerification > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {stats.pendingVerification}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <Link
                  to="/harvestLink/orders"
                  className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
                >
                  <span>View All Orders</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FaClipboardList className="text-6xl text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Orders Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Link
                    to="/harvestLink/browse"
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    <FaStore className="text-sm" />
                    <span>Start Shopping</span>
                  </Link>
                </div>
              ) : (
               <div className="space-y-4">
  {recentOrders.map((order) => (
    <div
      key={order._id}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer group"
      onClick={() => navigate(`/harvestLink/orders/${order._id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getOrderStatusIcon(order.orderStatus)}
            <span className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
              #{order.orderId}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Items</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {order.items?.length || 0} products
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Amount</p>
              <p className="text-gray-900 dark:text-white font-medium">
                ₹{order.totalAmount?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Date</p>
              <p className="text-gray-900 dark:text-white">
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          {order.items?.slice(0, 2).map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 mt-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {item.product?.images?.[0] && (
                <img
                  src={item.product.images[0]}
                  alt={item.product.title || "Product"}
                  className="w-10 h-10 rounded-md object-cover border border-gray-200 dark:border-gray-600"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.product?.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end space-y-2 ml-4">
          {order.orderStatus === "pending_verification" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/harvestLink/users/orders/${order._id}/verify`);
              }}
              className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition"
            >
              Verify OTP
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/harvestLink/orders/${order._id}`);
            }}
            className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm"
          >
            <FaEye className="text-xs" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
          )}
          </div>
          )}

          {/* All Orders Tab */}
          {activeTab === "all-orders" && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  All Orders
                </h2>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white w-full"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending_verification">Pending OTP</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FaClipboardList className="text-6xl text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "You haven't placed any orders yet"}
                  </p>
                  <Link
                    to="/harvestLink/browse"
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    <FaStore className="text-sm" />
                    <span>Start Shopping</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer group"
                      onClick={() =>
                        navigate(`/harvestLink/orders/${order._id}`)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {getOrderStatusIcon(order.orderStatus)}
                            <span className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                              #{order.orderId}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus.replace("_", " ")}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                getPaymentMethodDisplay(order.paymentMethod)
                                  .color
                              }`}
                            >
                              {
                                getPaymentMethodDisplay(order.paymentMethod)
                                  .text
                              }
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Items
                              </p>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {order.items?.length || 0} products
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Amount
                              </p>
                              <p className="text-gray-900 dark:text-white font-medium">
                                ₹{order.totalAmount?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Date
                              </p>
                              <p className="text-gray-900 dark:text-white">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Delivery
                              </p>
                              <p className="text-gray-900 dark:text-white">
                                {order.estimatedDelivery
                                  ? new Date(
                                      order.estimatedDelivery
                                    ).toLocaleDateString("en-IN")
                                  : "Not set"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {order.items?.slice(0, 3).map((item, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                              >
                                {item.product?.title} ({item.quantity}{" "}
                                {item.unit})
                              </span>
                            ))}
                            {order.items?.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          {order.orderStatus === "pending_verification" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/harvestLink/users/orders/${order._id}/verify`
                                );
                              }}
                              className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition"
                            >
                              Verify OTP
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/harvestLink/orders/${order._id}`);
                            }}
                            className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm"
                          >
                            <FaEye className="text-xs" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending OTP Tab */}
          {activeTab === "pending" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pending OTP Verification
                </h2>
                <Link
                  to="/harvestLink/users/orders/pending"
                  className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
                >
                  <span>View All Pending</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>

              {getOrdersByStatus("pending_verification").length === 0 ? (
                <div className="text-center py-12">
                  <FaCheckCircle className="text-6xl text-green-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    All Orders Verified!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No pending OTP verifications at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getOrdersByStatus("pending_verification").map((order) => (
                    <div
                      key={order._id}
                      className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition cursor-pointer group"
                      onClick={() =>
                        navigate(
                          `/harvestLink/users/orders/${order._id}/verify`
                        )
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaClock className="text-orange-500 animate-pulse" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              #{order.orderId}
                            </span>
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                              Pending OTP Verification
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Amount
                              </p>
                              <p className="text-gray-900 dark:text-white font-medium">
                                ₹{order.totalAmount?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Items
                              </p>
                              <p className="text-gray-900 dark:text-white">
                                {order.items?.length || 0} products
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                OTP Expires
                              </p>
                              <p className="text-orange-600 dark:text-orange-400 font-medium">
                                {order.otp?.expiresAt
                                  ? new Date(
                                      order.otp.expiresAt
                                    ).toLocaleTimeString("en-IN")
                                  : "Soon"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/harvestLink/users/orders/${order._id}/verify`
                            );
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                        >
                          Verify Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/harvestLink/browse"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition border-2 border-transparent hover:border-green-500"
          >
            <FaStore className="text-3xl text-green-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Browse Products
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Discover fresh farm products
            </p>
          </Link>

          <Link
            to="/harvestLink/cart"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition border-2 border-transparent hover:border-blue-500"
          >
            <FaShoppingCart className="text-3xl text-blue-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              View Cart
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your shopping cart
            </p>
          </Link>

          <Link
            to="/harvestLink/addresses"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition border-2 border-transparent hover:border-purple-500"
          >
            <FaMapMarkerAlt className="text-3xl text-purple-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Addresses
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage delivery addresses
            </p>
          </Link>

          <Link
            to="/harvestLink/orders"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition border-2 border-transparent hover:border-orange-500"
          >
            <FaHistory className="text-3xl text-orange-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Order History
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View all your orders
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
