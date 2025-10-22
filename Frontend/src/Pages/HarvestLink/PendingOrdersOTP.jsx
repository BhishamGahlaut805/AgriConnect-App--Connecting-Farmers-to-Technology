import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClock,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaShoppingBag,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSync,
} from "react-icons/fa";
import OrderService from "../../API/OrderService";
import CartBar from "./Cartbar";
import Links from "./Links";
const PendingOrdersOTP = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendingOTP, setResendingOTP] = useState(null);
    const navigate = useNavigate();
  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await OrderService.getUserOrders({
        status: "pending_verification",
      });

      if (response.success) {
        setPendingOrders(response.data.orders || []);
      } else {
        setError(response.message || "Failed to load pending orders");
      }
    } catch (err) {
      console.error("Error loading pending orders:", err);
      setError(err.message || "Failed to load pending orders");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (orderId) => {
    try {
      setResendingOTP(orderId);
      setError("");

      // This would call a new API endpoint to resend OTP
      // For now, we'll simulate it by reloading the orders
      await loadPendingOrders();

      // In a real implementation, you would call:
      // const result = await OrderService.resendOrderOTP(orderId);

      setResendingOTP(null);
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError(err.message || "Failed to resend OTP");
      setResendingOTP(null);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;

    if (diffMs <= 0) {
      return { expired: true, text: "Expired" };
    }

    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return { expired: false, text: `${minutes}m ${seconds}s` };
    } else {
      return { expired: false, text: `${seconds}s` };
    }
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      cod: { text: "Cash on Delivery", color: "text-green-600 bg-green-100" },
      upi: { text: "UPI Payment", color: "text-blue-600 bg-blue-100" },
      card: { text: "Card Payment", color: "text-purple-600 bg-purple-100" },
      credit_card: {
        text: "Credit Card",
        color: "text-purple-600 bg-purple-100",
      },
      debit_card: {
        text: "Debit Card",
        color: "text-purple-600 bg-purple-100",
      },
      net_banking: {
        text: "Net Banking",
        color: "text-orange-600 bg-orange-100",
      },
    };

    return (
      methodMap[method] || { text: method, color: "text-gray-600 bg-gray-100" }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading pending orders...
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
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClock className="text-3xl text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pending Order Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Verify your orders with OTP to complete the process
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* No Pending Orders */}
        {pendingOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Verifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              All your orders are verified and processing smoothly.
            </p>
            <Link
              to="/harvestLink/orders"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              View All Orders
            </Link>
          </div>
        )}

        {/* Pending Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingOrders.map((order) => {
            const timeRemaining = getTimeRemaining(order.otp?.expiresAt);
            const paymentMethod = getPaymentMethodDisplay(order.paymentMethod);

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-orange-200 dark:border-orange-700 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <FaShoppingBag className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-orange-100 text-sm">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentMethod.color} dark:bg-opacity-20`}
                      >
                        {paymentMethod.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* OTP Status */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          timeRemaining.expired
                            ? "bg-red-500"
                            : "bg-green-500 animate-pulse"
                        }`}
                      ></div>
                      <span
                        className={`font-medium ${
                          timeRemaining.expired
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {timeRemaining.expired ? "OTP Expired" : "OTP Active"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expires in
                      </p>
                      <p
                        className={`font-mono font-bold ${
                          timeRemaining.expired
                            ? "text-red-600 dark:text-red-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {timeRemaining.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <FaShoppingBag className="mr-2 text-green-600" />
                    Order Items ({order.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                          {item.product?.title || "Product"}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium ml-2">
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

                {/* Shipping Address Preview */}
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
                <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <Link
                      to={`/harvestLink/users/orders/${order._id}/verify`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium text-center transition flex items-center justify-center space-x-2"
                    >
                      <span>Verify OTP</span>
                      <FaArrowRight className="text-sm" />
                    </Link>

                    <button
                      onClick={() =>
                        navigate(
                          `/harvestLink/users/orders/${order._id}/verify`
                        )
                      }
                      disabled={
                        resendingOTP === order._id || !timeRemaining.expired
                      }
                      className="px-4 py-3 border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendingOTP === order._id ? (
                        <FaSync className="animate-spin" />
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  </div>

                  {timeRemaining.expired && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                      OTP expired. Please resend to get a new code.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Help Section */}
        {pendingOrders.length > 0 && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 Need Help with OTP Verification?
            </h3>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              If you're not receiving OTP codes or facing issues with
              verification:
            </p>
            <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-sm">
              <li>• Check your registered email and phone number</li>
              <li>• Ensure you have network connectivity</li>
              <li>• Wait for 30 seconds before requesting a new OTP</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        )}
      </div>
      <Links />
    </div>
  );
};

export default PendingOrdersOTP;
