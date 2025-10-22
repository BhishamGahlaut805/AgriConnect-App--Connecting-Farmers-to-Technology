import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaRupeeSign,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaClock,
  FaSync,
  FaArrowRight,
} from "react-icons/fa";
import CartBar from "./Cartbar";
import Links from "./Links";
import OrderService from "../../API/OrderService";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await OrderService.getUserOrders();
      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err.message || "Unable to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending_verification:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      pending:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      confirmed:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      shipped:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      delivered:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || "bg-gray-100 text-gray-700 dark:bg-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "pending_verification":
        return <FaClock className="text-yellow-500" />;
      case "confirmed":
        return <FaClipboardList className="text-blue-500" />;
      case "shipped":
        return <FaTruck className="text-indigo-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-36">
      <CartBar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShoppingBag className="text-3xl text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Review all your order statuses and details
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 inline-flex items-center px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            <FaSync className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-3" />
            {error}
          </div>
        )}

        {/* No Orders */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaClipboardList className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your orders will appear here once you start shopping.
            </p>
            <Link
              to="/harvestLink/browse"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-300"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-green-500 to-lime-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      {getStatusIcon(order.orderStatus)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-green-100 text-sm">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-xl">
                      ₹{order.totalAmount?.toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FaBox className="mr-2 text-green-600" />
                  Items ({order.items?.length || 0})
                </h4>
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="truncate">
                        {item.product?.title || "Product"}
                      </span>
                      <span className="font-medium">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  Delivery Address
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {order.shippingAddress?.completeAddress ||
                    `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
                <Link
                  to={`/harvestLink/orders/${order._id}`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium text-center transition flex items-center justify-center space-x-2"
                >
                  <span>View Details</span>
                  <FaArrowRight className="text-sm" />
                </Link>

                {order.orderStatus === "pending_verification" && (
                  <Link
                    to={`/harvestLink/users/orders/${order._id}/verify`}
                    className="px-4 py-3 border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                  >
                    Verify OTP
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Help Section */}
        {orders.length > 0 && (
          <div className="mt-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Need Help with Your Orders?
            </h3>
            <p className="text-blue-700 dark:text-blue-400 mb-3 text-sm">
              If your order is delayed or needs attention, please check the
              order details or contact our support team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/harvestLink/users/orders/pending"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
              >
                Pending Verifications
              </Link>
              <Link
                to="/harvestLink/cart"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
              >
                Go to Cart
              </Link>
              <Link
                to="/harvestLink/checkout"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Checkout
              </Link>
              <Link
                to="/harvestLink/browse"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>

      <Links />
    </div>
  );
};

export default AllOrders;
