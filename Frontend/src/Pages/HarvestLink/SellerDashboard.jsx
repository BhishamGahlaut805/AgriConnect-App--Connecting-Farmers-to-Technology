import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaList,
  FaChartLine,
  FaSpinner,
  FaArrowRight,
  FaClock,
  FaShoppingCart,
  FaUsers,
  FaMoneyBillWave,
  FaTruck,
  FaCheck,
  FaTimes,
  FaEye,
  FaEdit,
  FaChartBar,
  FaCog,
  FaWarehouse,
  FaFileInvoice,
  FaSearch,
  FaBoxOpen,
} from "react-icons/fa";
import AgrimarketService from "../../API/AgrimarketService";
import OrderService from "../../API/OrderService";
import CartBar from "./Cartbar"; // Assuming this is needed, though not directly used in the dashboard logic

// --- Helper Functions (Moved for clean main component) ---

const getStatusColor = (status) => {
  const statusColors = {
    pending: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-500",
    },
    confirmed: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-500",
    },
    processing: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      text: "text-indigo-700 dark:text-indigo-400",
      border: "border-indigo-500",
    },
    shipped: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      text: "text-cyan-700 dark:text-cyan-400",
      border: "border-cyan-500",
    },
    delivered: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-500",
    },
    cancelled: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-500",
    },
  };
  return (
    statusColors[status] || {
      bg: "bg-gray-50 dark:bg-gray-700/20",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-300",
    }
  );
};

const getStatusIcon = (status) => {
  const statusIcons = {
    pending: FaClock,
    confirmed: FaCheck,
    processing: FaCog,
    shipped: FaTruck,
    delivered: FaCheck,
    cancelled: FaTimes,
  };
  return statusIcons[status] || FaBox;
};

// --- Main Component ---

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalListings: 0,
    activeListings: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Load user details securely (assuming user details are necessary for API calls)
  const user = JSON.parse(localStorage.getItem("userDetails")) || {
    name: "Seller",
    _id: "default-seller-id", // Add a fallback ID for safety
  };

  useEffect(() => {
    fetchSellerStats();
    fetchSellerOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, activeFilter, searchTerm, sortBy]);

  // --- Data Fetching Logic ---

  const fetchSellerStats = async () => {
    try {
      setLoading(true);
      const userId = user?._id;

      // Note: Assuming API calls are mocked or external and not visible here.
      // The original code uses:
      // AgrimarketService.ProductService.getMyProducts()
      // AgrimarketService.ListingService.mine(userId)
      // OrderService.getSellerOrders()

      const [productsRes, listingsRes, ordersRes] = await Promise.all([
        AgrimarketService.ProductService.getMyProducts(),
        AgrimarketService.ListingService.mine(userId),
        OrderService.getSellerOrders(),
      ]);

      const products = productsRes.data || productsRes.products || [];
      const listings = listingsRes.data || listingsRes.listings || [];
      const sellerOrders = ordersRes.data?.orders || ordersRes.orders || [];

      // Calculate order statistics
      const pendingOrders = sellerOrders.filter((order) =>
        ["pending", "confirmed", "processing", "shipped"].includes(
          order.orderStatus
        )
      ).length;

      const completedOrders = sellerOrders.filter(
        (order) => order.orderStatus === "delivered"
      ).length;

      // Calculate total revenue from delivered orders
      const totalRevenue = sellerOrders
        .filter((order) => order.orderStatus === "delivered")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalProducts: products.length,
        pendingProducts: products.filter((p) => p.status === "pending").length,
        totalListings: listings.length,
        activeListings: listings.filter((l) => l.status === "active").length,
        totalOrders: sellerOrders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await OrderService.getSellerOrders();
      const sellerOrders = response.data?.orders || response.orders || [];
      setOrders(sellerOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // --- Filtering and Sorting Logic ---

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.product?.title
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "quantity":
          const totalA =
            a.items?.reduce(
              (sum, item) => sum + (item.qty || item.quantity || 0),
              0
            ) || 0;
          const totalB =
            b.items?.reduce(
              (sum, item) => sum + (item.qty || item.quantity || 0),
              0
            ) || 0;
          return totalB - totalA;
        case "amount":
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  // --- Order Utility Functions ---

  const calculateOrderProgress = (order) => {
    const totalItems = order.items?.length || 0;
    // Assuming fulfillmentStatus for individual items is the indicator
    const fulfilledItems =
      order.items?.filter((item) => item.fulfillmentStatus === "fulfilled")
        .length || 0;

    // Fallback: If no item-level fulfillment status, use order-level status
    if (totalItems > 0 && fulfilledItems === 0) {
      if (order.orderStatus === "delivered") return 100;
      if (order.orderStatus === "shipped") return 75;
      if (["confirmed", "processing"].includes(order.orderStatus)) return 50;
      return 25; // pending/initial
    }

    return totalItems > 0 ? Math.round((fulfilledItems / totalItems) * 100) : 0;
  };

  const getRemainingQuantity = (order) => {
    return (
      order.items?.reduce((total, item) => {
        // Use 'quantity' or 'qty' from the order item, which is a common pattern
        const itemQty = item.qty || item.quantity || 0;
        if (item.fulfillmentStatus !== "fulfilled") {
          return total + itemQty;
        }
        return total;
      }, 0) || 0
    );
  };

  // --- Loading State ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // --- Component Render ---

  return (
    <>
      {/* Top spacing to account for fixed header/navbar */}
      <div className="mt-20 pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section - Colorful and Welcoming */}
        <section className="relative bg-gradient-to-br from-indigo-700 via-blue-600 to-green-500 text-white py-16 px-6 md:px-12 shadow-2xl">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              Dashboard for <span className="text-yellow-300">{user.name}</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-3xl">
              Monitor your farm's performance, manage listings, and fulfill
              orders efficiently.
            </p>
          </div>
          <CartBar />
        </section>
        {/* --- Key Performance Indicators (KPI) Cards --- */}
        <div className="mt-4 max-w-7xl mx-auto px-6 -mt-12 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Orders",
              icon: <FaShoppingCart />,
              color: "bg-gradient-to-tr from-indigo-500 to-indigo-700",
              value: stats.totalOrders,
              link: "#orders",
            },
            {
              title: "Pending Orders",
              icon: <FaClock />,
              color: "bg-gradient-to-tr from-yellow-500 to-orange-500",
              value: stats.pendingOrders,
              link: "#orders",
            },
            {
              title: "Total Revenue",
              icon: <FaMoneyBillWave />,
              color: "bg-gradient-to-tr from-green-500 to-emerald-600",
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              link: "/harvestLink/analytics",
            },
            {
              title: "Active Listings",
              icon: <FaList />,
              color: "bg-gradient-to-tr from-cyan-500 to-blue-500",
              value: stats.activeListings,
              link: "/harvestLink/my-listings",
            },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`text-white rounded-xl p-5 shadow-2xl transition-all duration-300 transform hover:scale-[1.03] ${item.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xl p-3 bg-white/20 rounded-full">
                  {item.icon}
                </div>
                <p className="text-4xl font-extrabold">{item.value}</p>
              </div>
              <p className="text-sm mt-3 font-semibold text-white/80">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
        {/* --- Quick Access Links --- */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "My Products",
                description: "Manage your product catalog",
                icon: FaBox,
                link: "/harvestLink/my-products",
                color: "from-purple-600 to-pink-600",
              },
              {
                title: "Order Management",
                description: "Process and fulfill orders now",
                icon: FaShoppingCart,
                link: "#orders",
                color: "from-blue-600 to-indigo-600",
              },
              {
                title: "Analytics & Reports",
                description: "View sales performance",
                icon: FaChartBar,
                link: "/harvestLink/analytics",
                color: "from-teal-500 to-green-500",
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={index}
                  to={item.link}
                  className={`group bg-gradient-to-r ${item.color} text-white rounded-xl p-6 shadow-lg flex flex-col justify-between h-32 transition-all duration-300 hover:ring-4 hover:ring-opacity-50 hover:ring-white/50`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/30 p-3 rounded-xl">
                      <IconComponent className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl group-hover:text-yellow-200 transition">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="text-white/60 self-end mt-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>
        {/* --- Order Management Section --- */}
        <section id="orders" className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-4 dark:border-gray-700">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Order Management
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Total of {orders.length} orders to manage.
                </p>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                >
                  <option value="date">Sort by Date (Newest)</option>
                  <option value="amount">Sort by Amount (High)</option>
                  <option value="quantity">Sort by Quantity (High)</option>
                </select>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { key: "all", label: "All Orders", count: orders.length },
                {
                  key: "pending",
                  label: "Pending",
                  count: orders.filter((o) => o.orderStatus === "pending")
                    .length,
                },
                {
                  key: "confirmed",
                  label: "Confirmed",
                  count: orders.filter((o) => o.orderStatus === "confirmed")
                    .length,
                },
                {
                  key: "shipped",
                  label: "Shipped",
                  count: orders.filter((o) => o.orderStatus === "shipped")
                    .length,
                },
                {
                  key: "delivered",
                  label: "Delivered",
                  count: orders.filter((o) => o.orderStatus === "delivered")
                    .length,
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    activeFilter === filter.key
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-md hover:bg-indigo-700"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Orders Grid/List */}
            {ordersLoading ? (
              <div className="flex justify-center items-center py-16">
                <FaSpinner className="animate-spin text-4xl text-indigo-600" />
                <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                  Loading Orders...
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <FaBoxOpen className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Orders Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || activeFilter !== "all"
                    ? "Try adjusting your search or filter selection."
                    : "No orders match the current criteria."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusColor(order.orderStatus);
                  const StatusIcon = getStatusIcon(order.orderStatus);
                  const progress = calculateOrderProgress(order);
                  const remainingQty = getRemainingQuantity(order);

                  return (
                    <div
                      key={order._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-600"
                    >
                      {/* Order Header */}
                      <div className="flex justify-between items-start mb-4 border-b dark:border-gray-700 pb-3">
                        <div>
                          <h3 className="font-extrabold text-xl text-indigo-600 dark:text-indigo-400">
                            #
                            {order.orderId ||
                              order._id?.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Placed:{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <StatusIcon className="w-4 h-4 mr-1.5" />
                          {order.orderStatus.toUpperCase().slice(0,10)}
                        </span>
                      </div>

                      {/* Order Items Summary */}
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                          Items ({order.items?.length || 0}):
                        </p>
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm border-l-2 border-green-400 pl-3"
                          >
                            <span className="text-gray-800 dark:text-gray-200 truncate font-medium flex-1">
                              {item.product?.title || "Unknown Product"}
                            </span>
                            <span className="text-gray-900 dark:text-white font-bold ml-2">
                              {item.qty || item.quantity} ×
                              <span className="text-xs ml-1">
                                ₹
                                {item.listing?.pricePerUnit ||
                                  item.product?.price ||
                                  0}
                              </span>
                            </span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                            ... and {order.items.length - 3} more items
                          </div>
                        )}
                      </div>

                      {/* Progress Bar & Summary */}
                      <div className="mb-4 pt-3 border-t dark:border-gray-700">
                        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          <span>Fulfillment Progress</span>
                          <span
                            className={`${
                              progress === 100
                                ? "text-green-600"
                                : "text-indigo-600"
                            }`}
                          >
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`${
                              progress === 100
                                ? "bg-green-600"
                                : "bg-indigo-500"
                            } h-2.5 rounded-full transition-all duration-700`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action & Financial Summary */}
                      <div className="flex justify-between items-center text-sm pt-3 border-t dark:border-gray-700">
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">
                            Remaining Items:{" "}
                            <span className="font-extrabold text-orange-600 dark:text-orange-400">
                              {remainingQty}
                            </span>
                          </div>
                          <div className="text-lg text-gray-900 dark:text-white font-extrabold mt-1">
                            Total: ₹{order.totalAmount?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            title="View Order Details"
                            className="p-3 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 transition-colors shadow-md"
                          >
                            <FaEye />
                          </button>
                          <button
                            title="Edit/Update Order"
                            className="p-3 text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-md"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        {/* --- Seller Resources Section (Simple Cards) --- */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Seller Resources
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Seller Guide",
                description: "Maximize your sales potential",
                icon: FaFileInvoice,
                link: "/seller-guide",
                iconColor: "text-red-500",
              },
              {
                title: "Pricing Tips",
                description: "Optimize your product pricing",
                icon: FaMoneyBillWave,
                link: "/pricing-tips",
                iconColor: "text-yellow-500",
              },
              {
                title: "Shipping Help",
                description: "Delivery and logistics guidelines",
                icon: FaTruck,
                link: "/shipping-help",
                iconColor: "text-blue-500",
              },
              {
                title: "Support Center",
                description: "Get help when you need it",
                icon: FaUsers,
                link: "/support",
                iconColor: "text-green-500",
              },
            ].map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <Link
                  key={index}
                  to={resource.link}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-indigo-400 dark:border-indigo-600 group hover:-translate-y-0.5"
                >
                  <IconComponent
                    className={`text-3xl ${resource.iconColor} mb-3 group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {resource.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        <div className="py-10"></div> {/* Bottom Padding */}
      </div>
    </>
  );
}
