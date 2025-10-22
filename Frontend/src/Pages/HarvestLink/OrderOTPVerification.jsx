import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaSync,
  FaArrowLeft,
  FaShoppingBag,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaStore,
  FaHistory,
  FaTrash,
  FaMapMarkerAlt,
  FaTimes,
  FaCreditCard,
  FaList,
  FaUser,
  FaHome,
} from "react-icons/fa";
import OrderService from "../../API/OrderService";
import CheckoutService from "../../API/OrderService";
import CartBar from "./Cartbar";

// Enhanced loading spinner
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
    <p className="text-lg text-gray-700">{message}</p>
  </div>
);

// OTP Timer Component
const OTPTimer = ({ expiresAt, onExpire, onResend }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft(0);
        onExpire?.();
        return;
      }

      setTimeLeft(Math.floor(difference / 1000));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <div
        className={`text-sm font-semibold ${
          timeLeft < 60 ? "text-red-600" : "text-gray-600"
        }`}
      >
        ⏱️ {formatTime(timeLeft)}
      </div>
      {timeLeft === 0 && (
        <button
          onClick={onResend}
          className="text-green-600 hover:text-green-800 text-sm font-medium transition"
        >
          Resend OTP
        </button>
      )}
    </div>
  );
};

// Navigation Cards Component
const NavigationCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    {/* Pending Orders Card */}
    <Link
      to="/harvestLink/users/orders/pending"
      className="bg-white rounded-xl shadow-lg border border-orange-200 p-4 hover:shadow-xl transition-all duration-300 hover:border-orange-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
          <FaClock className="text-xl text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pending Orders</h3>
          <p className="text-sm text-gray-600">Verify pending orders</p>
        </div>
      </div>
    </Link>

    {/* All Orders Card */}
    <Link
      to="/harvestLink/orders"
      className="bg-white rounded-xl shadow-lg border border-blue-200 p-4 hover:shadow-xl transition-all duration-300 hover:border-blue-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <FaList className="text-xl text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">All Orders</h3>
          <p className="text-sm text-gray-600">View order history</p>
        </div>
      </div>
    </Link>

    {/* Browse Products Card */}
    <Link
      to="/harvestLink/browse"
      className="bg-white rounded-xl shadow-lg border border-green-200 p-4 hover:shadow-xl transition-all duration-300 hover:border-green-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
          <FaStore className="text-xl text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Browse Products</h3>
          <p className="text-sm text-gray-600">Continue shopping</p>
        </div>
      </div>
    </Link>

    {/* AgriConnect Card */}
    <Link
      to="/harvestLink/v1/AgriConnect"
      className="bg-white rounded-xl shadow-lg border border-purple-200 p-4 hover:shadow-xl transition-all duration-300 hover:border-purple-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
          <FaUser className="text-xl text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AgriConnect</h3>
          <p className="text-sm text-gray-600">Connect with farmers</p>
        </div>
      </div>
    </Link>

    {/* Dashboard Card */}
    <Link
      to="/harvestLink/orders"
      className="bg-white rounded-xl shadow-lg border border-indigo-200 p-4 hover:shadow-xl transition-all duration-300 hover:border-indigo-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <FaHome className="text-xl text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Dashboard</h3>
          <p className="text-sm text-gray-600">Your account overview</p>
        </div>
      </div>
    </Link>

    {/* Payment Methods Card */}
    <Link
      to="/harvestLink/browse"
      className="bg-white rounded-xl shadow-lg border border-teal-200 p-4 hover:shadow-xl transition-all duration-300 hover:border-teal-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
          <FaCreditCard className="text-xl text-teal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Manage payments</p>
        </div>
      </div>
    </Link>
  </div>
);

const OrderOTPVerification = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    expired: true,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const inputRefs = useRef([]);
  const intervalRef = useRef(null);

  // Cancel reasons for dropdown
  const cancelReasons = [
    "Changed my mind",
    "Found better price elsewhere",
    "Delivery time too long",
    "Product not needed anymore",
    "Payment issues",
    "Other reason",
  ];

  // --------------------
  // TIMER FUNCTIONS
  // --------------------
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (expiresAt) => {
      if (!expiresAt) {
        console.error("No expiry time provided for timer");
        setTimeRemaining({
          expired: true,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
        return;
      }

      // Clear any existing timer
      clearTimer();

      const endTime = new Date(expiresAt).getTime();

      // Validate the expiry time
      if (isNaN(endTime)) {
        console.error("Invalid expiry time:", expiresAt);
        setTimeRemaining({
          expired: true,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
        return;
      }

      console.log("Starting timer with expiry:", new Date(expiresAt));

      const updateTimer = () => {
        const now = Date.now();
        const diffMs = endTime - now;

        if (diffMs <= 0) {
          console.log("Timer expired");
          setTimeRemaining({
            expired: true,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
          });
          clearTimer();
          return;
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        setTimeRemaining({
          expired: false,
          minutes,
          seconds,
          totalSeconds,
        });
      };

      // Update immediately
      updateTimer();

      // Set up interval
      intervalRef.current = setInterval(updateTimer, 1000);
    },
    [clearTimer]
  );

  // --------------------
  // LOAD ORDER DETAILS - ENHANCED
  // --------------------
  const loadOrderDetails = useCallback(async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      console.log("Loading order details for:", orderId);
      const response = await OrderService.getOrderById(orderId);
      console.log("Order details response:", response);

      if (response.success && response.data?.order) {
        const orderData = response.data.order;
        setOrder(orderData);

        // Check if order requires OTP verification
        if (orderData.orderStatus !== "pending_verification") {
          setMessage({
            text: "This order does not require OTP verification or has already been verified.",
            type: "info",
          });
        }

        // Start timer if OTP exists and is not verified
        if (orderData.otp?.expiresAt && !orderData.otp?.verified) {
          console.log(
            "Starting timer with OTP expiry:",
            orderData.otp.expiresAt
          );
          startTimer(orderData.otp.expiresAt);
        } else if (orderData.metadata?.otpReference) {
          // Try to get OTP from OTPVerification collection
          try {
            const otpResponse = await OrderService.getOTPRecord(
              orderData.metadata.otpReference
            );
            if (otpResponse.success && otpResponse.data) {
              const otpRecord = otpResponse.data;
              if (otpRecord.expiresAt && !otpRecord.verified) {
                console.log(
                  "Starting timer with OTP record expiry:",
                  otpRecord.expiresAt
                );
                startTimer(otpRecord.expiresAt);
              }
            }
          } catch (otpErr) {
            console.warn("Could not fetch OTP record:", otpErr);
          }
        } else {
          console.log("No valid OTP found for timer");
          setTimeRemaining({
            expired: true,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
          });
        }

        return orderData;
      } else {
        const errorMsg = response.message || "Failed to load order details";
        setMessage({
          text: errorMsg,
          type: "error",
        });
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Error loading order details:", err);
      setMessage({
        text:
          err.message ||
          "Failed to load order details. Please check if the order exists.",
        type: "error",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId, startTimer]);

  // --------------------
  // INITIAL LOAD
  // --------------------
  useEffect(() => {
    console.log("Component mounted, loading order details...");
    loadOrderDetails();

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up timer...");
      clearTimer();
    };
  }, [loadOrderDetails, clearTimer]);

  // --------------------
  // OTP HANDLERS - ENHANCED
  // --------------------
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
    }

    // Auto-submit when all digits are filled
    if (newOtp.every((d) => d !== "") && index === 5) {
      handleVerifyOTP(newOtp.join(""));
    }

    // Clear any previous messages when user starts typing
    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...Array(6)].map((_, i) => paste[i] || "");
    setOtp(newOtp);

    // Focus on the next empty input
    const nextFocusIndex = Math.min(paste.length, 5);
    setTimeout(() => inputRefs.current[nextFocusIndex]?.focus(), 10);
  };

  // --------------------
  // VERIFY OTP - ROBUST VERSION
  // --------------------
  const handleVerifyOTP = async (otpCode = otp.join("")) => {
    if (otpCode.length !== 6) {
      setMessage({
        text: "Please enter all 6 digits of the OTP",
        type: "error",
      });
      return;
    }

    if (timeRemaining.expired) {
      setMessage({
        text: "OTP has expired. Please request a new one.",
        type: "error",
      });
      return;
    }

    if (!order) {
      setMessage({
        text: "Order information not available. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setVerifying(true);
    setMessage({ text: "Verifying OTP...", type: "info" });

    try {
      console.log("Verifying OTP for order:", orderId, "OTP:", otpCode);
      const response = await OrderService.verifyOrderOTP(orderId, otpCode);
      console.log("OTP verification response:", response);

      if (response.success) {
        setMessage({
          text: "✅ Order verified successfully! Redirecting to order details...",
          type: "success",
        });
        setOtp(Array(6).fill(""));
        clearTimer();

        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          navigate(`/harvestLink/orders/${orderId}`, {
            state: { verified: true },
          });
        }, 2000);
      } else {
        throw new Error(
          response.message || "Invalid OTP code. Please check and try again."
        );
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      let errorMessage =
        err.message || "OTP verification failed. Please try again.";

      // Handle specific error cases
      if (err.message?.includes("expired")) {
        errorMessage = "OTP has expired. Please request a new one.";
      } else if (
        err.message?.includes("Invalid") ||
        err.message?.includes("invalid")
      ) {
        errorMessage = "Invalid OTP code. Please check the code and try again.";
      } else if (err.message?.includes("attempt")) {
        errorMessage =
          "Too many failed attempts. Please wait before trying again.";
      }

      setMessage({
        text: errorMessage,
        type: "error",
      });

      // Clear OTP for security
      setOtp(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setVerifying(false);
    }
  };

  // --------------------
  // RESEND OTP - ROBUST VERSION
  // --------------------
  const handleResendOTP = async () => {
    if (resending) return;

    setResending(true);
    setMessage({ text: "", type: "" });

    try {
      console.log("Resending OTP for order:", orderId);
      const response = await CheckoutService.resendOrderOTP(orderId);
      console.log("Resend OTP response:", response);

      if (response.success) {
        setMessage({
          text: "✅ New OTP has been sent to your registered email and phone number.",
          type: "success",
        });

        // Clear current OTP and reset state
        setOtp(Array(6).fill(""));

        // Reload order details to get new OTP with fresh expiry
        await loadOrderDetails();

        // Focus first input field
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        throw new Error(
          response.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (err) {
      console.error("Error resending OTP:", err);

      let errorMessage =
        err.message || "Failed to resend OTP. Please try again.";

      // Handle specific error cases
      if (err.message?.includes("already verified")) {
        errorMessage =
          "This order has already been verified. No OTP resend required.";
      } else if (err.message?.includes("not found")) {
        errorMessage = "Order not found. Please check the order ID.";
      }

      setMessage({
        text: errorMessage,
        type: "error",
      });
    } finally {
      setResending(false);
    }
  };

  // --------------------
  // CANCEL ORDER - ENHANCED
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
          text: "✅ Order cancelled successfully. Redirecting...",
          type: "success",
        });
        clearTimer();
        setTimeout(() => navigate("/harvestLink/orders"), 2000);
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Order cancellation error:", err);
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

  // Format time for display
  const formatTime = () => {
    return `${timeRemaining.minutes
      .toString()
      .padStart(2, "0")}:${timeRemaining.seconds.toString().padStart(2, "0")}`;
  };

  // Check if verify button should be enabled
  const isVerifyEnabled = () => {
    return (
      otp.every((digit) => digit !== "") &&
      !timeRemaining.expired &&
      !verifying &&
      order?.orderStatus === "pending_verification"
    );
  };

  // Check if resend button should be enabled
  const isResendEnabled = () => {
    return (timeRemaining.expired || !order?.otp?.verified) && !resending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <CartBar />
        <div className="pt-32 flex items-center justify-center">
          <LoadingSpinner message="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <CartBar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <div className="space-y-3">
              <Link
                to="/harvestLink/orders"
                className="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View All Orders
              </Link>
              <Link
                to="/harvestLink/browse"
                className="block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethodMap = {
    cod: ["Cash on Delivery", "text-green-600 bg-green-50 border-green-200"],
    upi: ["UPI Payment", "text-blue-600 bg-blue-50 border-blue-200"],
    card: ["Card Payment", "text-purple-600 bg-purple-50 border-purple-200"],
    credit_card: [
      "Credit Card",
      "text-purple-600 bg-purple-50 border-purple-200",
    ],
    debit_card: [
      "Debit Card",
      "text-purple-600 bg-purple-50 border-purple-200",
    ],
    net_banking: [
      "Net Banking",
      "text-orange-600 bg-orange-50 border-orange-200",
    ],
  };

  const [pmText, pmColor] = paymentMethodMap[order.paymentMethod] || [
    order.paymentMethod,
    "text-gray-600 bg-gray-50 border-gray-200",
  ];

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <CartBar />

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
              Are you sure you want to cancel this order? This action cannot be
              undone.
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

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <Link
            to="/harvestLink/orders"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white transition-colors w-fit"
          >
            <FaArrowLeft />
            <span>Back to Orders</span>
          </Link>
          <div className="text-center sm:text-right">
            <h1 className="text-3xl font-bold text-gray-900">
              Verify Order #{order.orderId}
            </h1>
            <p className="text-gray-600">
              Complete your order verification with OTP
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <NavigationCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* OTP Verification */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="text-2xl text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-gray-600">
                  We've sent a 6-digit OTP to your registered email and phone
                  number. The OTP is valid for 10 minutes.
                </p>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${
                    timeRemaining.expired
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  } transition-colors`}
                >
                  <FaClock
                    className={
                      timeRemaining.expired ? "text-red-500" : "text-orange-500"
                    }
                  />
                  <span className="font-mono font-bold text-lg">
                    {formatTime()}
                  </span>
                </div>
                {timeRemaining.expired && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    OTP has expired. Please request a new one.
                  </p>
                )}
              </div>

              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-4 mb-6 rounded-lg border transition-colors ${
                    message.type === "error"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : message.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  <div className="flex items-center">
                    {message.type === "error" && (
                      <FaExclamationTriangle className="mr-3 flex-shrink-0" />
                    )}
                    {message.type === "success" && (
                      <FaCheckCircle className="mr-3 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                </div>
              )}

              {/* OTP Inputs */}
              <div className="mb-6 flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={verifying || timeRemaining.expired}
                    placeholder="0"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={() => handleVerifyOTP()}
                disabled={!isVerifyEnabled()}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isVerifyEnabled()
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {verifying ? (
                  <span className="flex items-center justify-center">
                    <FaSync className="animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Confirm Order"
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center mt-6 border-t border-gray-200 pt-4">
                <p className="mb-3 text-gray-600">Didn't receive the code?</p>
                <button
                  onClick={handleResendOTP}
                  disabled={!isResendEnabled()}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isResendEnabled()
                      ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {resending ? <FaSync className="animate-spin" /> : <FaSync />}
                  <span>{resending ? "Sending..." : "Resend OTP"}</span>
                </button>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <button
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaShoppingBag className="text-green-600" />
                  <span className="font-medium">
                    Order Details ({order.items?.length || 0} items)
                  </span>
                </div>
                {showOrderDetails ? <FaEyeSlash /> : <FaEye />}
              </button>
              {showOrderDetails && (
                <div className="px-6 pb-4 space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <img
                          src={
                            item.product?.images?.[0] ||
                            "https://via.placeholder.com/80"
                          }
                          alt={item.product?.title}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <div>
                          <Link
                            to={`/harvestlink/product/${item.product?._id}`}
                            className="font-semibold hover:text-green-600 transition-colors"
                          >
                            {item.product?.title || "Unnamed Product"}
                          </Link>
                          <p className="text-sm text-gray-600">
                            Quantity:{" "}
                            <span className="font-medium">
                              {item.quantity} {item.unit}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Farmer:{" "}
                            <span className="font-medium">
                              {item.farmer?.name || "Unknown"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right sm:w-40">
                        <p className="font-semibold text-lg">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg border p-6 space-y-3">
              <h3 className="font-semibold mb-4 text-lg">Order Summary</h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-semibold">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Placed On:</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${pmColor}`}
                >
                  {pmText}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-orange-600 font-medium">
                  {order.orderStatus === "pending_verification"
                    ? "Pending OTP Verification"
                    : order.orderStatus}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <div className="bg-white rounded-xl shadow-lg border p-6 space-y-2">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  Delivery Address
                </h3>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.completeAddress}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.phone}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg border p-6 space-y-3">
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
              <Link
                to="/harvestLink/orders"
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <FaHistory />
                <span>View All Orders</span>
              </Link>
              <Link
                to="/harvestLink/browse"
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 rounded-lg hover:bg-green-50 font-medium transition-colors"
              >
                <FaStore />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-lg border p-6 space-y-2">
              <h3 className="font-semibold mb-2 flex items-center">
                <FaShieldAlt className="mr-2 text-blue-600" />
                Security Notice
              </h3>
              <p className="text-sm text-gray-600">
                • OTP is valid for 10 minutes only
              </p>
              <p className="text-sm text-gray-600">
                • Never share your OTP with anyone
              </p>
              <p className="text-sm text-gray-600">
                • Contact support if you need assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOTPVerification;
