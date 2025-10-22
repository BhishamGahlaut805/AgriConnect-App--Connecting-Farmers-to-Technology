import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaExclamationTriangle,
  FaTrash,
  FaEdit,
  FaShare,
  FaPrint,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaStore,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaIdCard,
    FaTimes,
      FaSync,
} from "react-icons/fa";
import OrderService from "../../API/OrderService";
import TrackingService from "../../API/TrackingService";
import CartBar from "./Cartbar";
import Links from "./Links";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showOrderDetails, setShowOrderDetails] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [customReason, setCustomReason] = useState("");
const [cancelling, setCancelling] = useState(false);
 const [message, setMessage] = useState({ text: "", type: "" });
    // const inputRefs = useRef([]);
    // const intervalRef = useRef(null);

    // Cancel reasons for dropdown
    const cancelReasons = [
      "Changed my mind",
      "Found better price elsewhere",
      "Delivery time too long",
      "Product not needed anymore",
      "Payment issues",
      "Other reason",
    ];
  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderResponse, trackingResponse] = await Promise.all([
        OrderService.getOrderById(orderId),
        TrackingService.trackOrder(orderId).catch((err) => ({
          success: false,
          error: err.message,
        })),
      ]);

      console.log("Order Response:", orderResponse);

      if (orderResponse.success) {
        setOrder(orderResponse.data.order);

        if (trackingResponse.success) {
          setTrackingInfo(trackingResponse.data);
        }
      } else {
        setError(orderResponse.message || "Failed to load order details");
      }
    } catch (err) {
      console.error("Order details loading error:", err);
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setVerifyingOTP(true);
      setError("");

      const result = await OrderService.verifyOrderOTP(orderId, otpCode);
      console.log("OTP Verification Result:", result);

      if (result.success) {
        setSuccess("Order verified successfully!");
        setOtpCode("");
        await loadOrderDetails();
      } else {
        setError(result.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "OTP verification failed");
    } finally {
      setVerifyingOTP(false);
    }
  };

   // --------------------
    // CANCEL ORDER
    // --------------------
    const handleCancelOrder = async () => {
      if (!cancelReason) {
        setMessage({
          text: "Please select a reason for cancellation",
          type: "error",
        });
        return;
      }

      const finalReason =
        cancelReason === "Other reason" ? customReason : cancelReason;
      if (!finalReason.trim()) {
        setMessage({
          text: "Please provide a cancellation reason",
          type: "error",
        });
        return;
      }

      setCancelling(true);
      setMessage({ text: "Cancelling your order...", type: "info" });

      try {
        const response = await OrderService.cancelOrder(orderId, finalReason);
        console.log("Order cancellation response:", response);

        if (response.success) {
          setMessage({
            text: "Order cancelled successfully. Redirecting...",
            type: "success",
          });
          clearTimer();
          setTimeout(() => navigate("/harvestLink/orders"), 2000);
        } else {
          throw new Error(response.message || "Failed to cancel order");
        }
      } catch (err) {
        setMessage({
          text: err.message || "Failed to cancel order. Please try again.",
          type: "error",
        });
      } finally {
        setCancelling(false);
        setShowCancelDialog(false);
        setCancelReason("");
        setCustomReason("");
      }
    };

    const openCancelDialog = () => {
      setShowCancelDialog(true);
      setCancelReason("");
      setCustomReason("");
    };

    const closeCancelDialog = () => {
      setShowCancelDialog(false);
      setCancelReason("");
      setCustomReason("");
    };

  const getStatusConfig = (status) => {
    const statusConfig = {
      pending: {
        icon: FaClock,
        color: "text-yellow-600 bg-yellow-100",
        darkColor: "text-yellow-400 bg-yellow-900/30",
        label: "Pending",
        description: "Order is being processed",
      },
      pending_verification: {
        icon: FaClock,
        color: "text-orange-600 bg-orange-100",
        darkColor: "text-orange-400 bg-orange-900/30",
        label: "Pending OTP Verification",
        description: "Verify OTP to confirm order",
      },
      confirmed: {
        icon: FaCheckCircle,
        color: "text-blue-600 bg-blue-100",
        darkColor: "text-blue-400 bg-blue-900/30",
        label: "Confirmed",
        description: "Order confirmed and being processed",
      },
      processing: {
        icon: FaBox,
        color: "text-purple-600 bg-purple-100",
        darkColor: "text-purple-400 bg-purple-900/30",
        label: "Processing",
        description: "Preparing your order",
      },
      shipped: {
        icon: FaTruck,
        color: "text-indigo-600 bg-indigo-100",
        darkColor: "text-indigo-400 bg-indigo-900/30",
        label: "Shipped",
        description: "Your order is on the way",
      },
      delivered: {
        icon: FaCheckCircle,
        color: "text-green-600 bg-green-100",
        darkColor: "text-green-400 bg-green-900/30",
        label: "Delivered",
        description: "Order successfully delivered",
      },
      cancelled: {
        icon: FaExclamationTriangle,
        color: "text-red-600 bg-red-100",
        darkColor: "text-red-400 bg-red-900/30",
        label: "Cancelled",
        description: "Order has been cancelled",
      },
    };

    return statusConfig[status] || statusConfig.pending;
  };

  const getProgressSteps = () => {
    const steps = [
      {
        status: "pending_verification",
        label: "Order Placed",
        description: "OTP Verification",
        icon: FaClock,
      },
      {
        status: "confirmed",
        label: "Confirmed",
        description: "Order Confirmed",
        icon: FaCheckCircle,
      },
      {
        status: "processing",
        label: "Processing",
        description: "Preparing Order",
        icon: FaBox,
      },
      {
        status: "shipped",
        label: "Shipped",
        description: "On the Way",
        icon: FaTruck,
      },
      {
        status: "delivered",
        label: "Delivered",
        description: "Order Complete",
        icon: FaCheckCircle,
      },
    ];

    const currentStatusIndex = steps.findIndex(
      (step) => step.status === order?.orderStatus
    );

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      current: index === currentStatusIndex,
    }));
  };

  const calculateOrderSummary = () => {
    if (!order) return null;

    const subtotal = order.totalAmount;
    const shipping = 50; // Fixed shipping cost
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const formatOrderItems = (items) => {
    return items.map((item) => ({
      ...item,
      productTitle: item.product?.title || "Unknown Product",
      productImage: item.product?.images?.[0] || "/placeholder-image.jpg",
      farmerName: item.farmer?.name || "Unknown Farmer",
      totalPrice: (item.price * item.quantity).toFixed(2),
      formattedPrice: `₹${item.price.toFixed(2)}`,
      formattedTotal: `₹${(item.price * item.quantity).toFixed(2)}`,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-36 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadOrderDetails}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/harvestLink/orders")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-36 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Order not found
          </p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.orderStatus);
  const StatusIcon = statusConfig.icon;
  const progressSteps = getProgressSteps();
  const orderSummary = calculateOrderSummary();
  const formattedItems = formatOrderItems(order.items);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-36">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CartBar />
        {/* Cancel Order Dialog */}
        {showCancelDialog && (
          <div   className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ease-out"
  aria-hidden="true">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  Cancel Order
                </h3>
                <button
                  onClick={closeCancelDialog}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="mb-4 text-gray-600">
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  <option value="">Select a reason</option>
                  {cancelReasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {cancelReason === "Other reason" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter your reason for cancellation..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    rows="3"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={closeCancelDialog}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReason}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 space-y-6 lg:space-y-0 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/harvestLink/orders")}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaArrowLeft className="text-lg" />
              <span className="hidden sm:inline font-medium">
                Back to Orders
              </span>
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Order{" "}
                <span className="text-green-600 dark:text-green-400">
                  #{order.orderId}
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <FaCalendarAlt className="text-sm mr-2 text-green-500" />
                Placed on{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200 ml-1">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-800 hover:text-green-700 dark:hover:text-green-200 transition">
              <FaPrint className="text-sm" />
              <span className="font-medium">Print</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-800 hover:text-green-700 dark:hover:text-green-200 transition">
              <FaShare className="text-sm" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-lg flex items-center">
            <FaCheckCircle className="mr-3 flex-shrink-0" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Status & Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-full ${statusConfig.color} dark:${statusConfig.darkColor}`}
                  >
                    <StatusIcon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {statusConfig.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {statusConfig.description}
                    </p>
                  </div>
                </div>

                {order.orderStatus === "pending_verification" && order.otp && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      OTP Expires
                    </p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {new Date(order.otp.expiresAt).toLocaleTimeString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Steps */}
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {progressSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center flex-1 relative z-10"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            step.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : step.current
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                          }`}
                        >
                          {step.completed ? (
                            <FaCheckCircle className="text-sm" />
                          ) : (
                            <StepIcon className="text-sm" />
                          )}
                        </div>
                        <div className="text-center mt-3 max-w-24">
                          <p
                            className={`text-xs font-medium ${
                              step.completed || step.current
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                  <div
                    className="h-0.5 bg-green-500 transition-all duration-500"
                    style={{
                      width: `${
                        ((progressSteps.filter((step) => step.completed)
                          .length -
                          1) /
                          (progressSteps.length - 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* OTP Verification Section */}
            {order.orderStatus === "pending_verification" && order.otp && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔐</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2">
                      Verify Your Order
                    </h3>
                    <Link
                      to="/harvestLink/users/orders/pending"
                      className="text-orange-700 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium transition-colors mb-4 inline-block"
                    >
                      Verify your order →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order Items ({order.items?.length || 0})
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total:{" "}
                  {formattedItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </span>
              </div>

              <div className="space-y-4">
                {formattedItems.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.productTitle}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          <FaStore className="mr-1 text-xs" />
                          {item.farmerName}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        ₹{item.totalPrice}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-green-600" />
                  Shipping Address
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FaUser className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.shippingAddress.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.completeAddress}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaPhone className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.phone}
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaTruck className="mr-2 text-blue-600" />
                  Delivery Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated Delivery
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(order.estimatedDelivery).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Delivery Status
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          order.deliveryStatus === "pending"
                            ? "bg-yellow-500"
                            : order.deliveryStatus === "shipped"
                            ? "bg-blue-500"
                            : order.deliveryStatus === "delivered"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {order.deliveryStatus.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Delivery Instructions
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 top-32">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{orderSummary?.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>₹{orderSummary?.shipping}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (5%)</span>
                  <span>₹{orderSummary?.tax}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{orderSummary?.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-green-600" />
                  Payment
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Method:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {order.paymentMethod?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "completed"
                          ? "text-green-600 dark:text-green-400"
                          : order.paymentStatus === "pending"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Actions
              </h3>

              <div className="space-y-3">
                {order.orderStatus === "pending_verification" && (
                  <button
                    onClick={() =>
                      navigate("/harvestLink/users/orders/pending")
                    }
                    disabled={verifyingOTP || otpCode.length !== 6}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {verifyingOTP ? "Verifying OTP..." : "Verify Order"}
                  </button>
                )}

                {["pending", "pending_verification", "confirmed"].includes(
                  order.orderStatus
                ) && (
                  <button
                    onClick={openCancelDialog}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    {cancelling ? (
                      <span className="flex items-center">
                        <FaSync className="animate-spin mr-2" />
                        Cancelling...
                      </span>
                    ) : (
                      <>
                        <FaTrash />
                        <span>Cancel Order</span>
                      </>
                    )}
                  </button>
                )}

                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                  Contact Support
                </button>

                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Order Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <FaIdCard className="mr-2" />
                    Order ID:
                  </span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {order.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Placed:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Est. Delivery:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order Age:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {order.orderAge} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Links />
      </div>
    </div>
  );
};

export default OrderDetails;
