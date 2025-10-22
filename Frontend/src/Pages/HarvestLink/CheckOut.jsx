import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import OrderService, {
  CheckoutService,
  OrderUtils,
} from "../../API/OrderService";
import AgrimarketService from "../../API/AgrimarketService";
import AddressService from "../../API/AddressService";
import CartBar from "./Cartbar";

// Enhanced loading spinner with progress
const LoadingSpinner = ({ message = "Loading...", progress = null }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 dark:border-green-400"></div>
      {progress !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-green-600 dark:text-green-400">
            {progress}%
          </span>
        </div>
      )}
    </div>
    <div className="text-center">
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{message}</p>
      {progress !== null && (
        <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
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
          timeLeft < 60
            ? "text-red-600 dark:text-red-400"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        ⏱️ {formatTime(timeLeft)}
      </div>
      {timeLeft === 0 && (
        <button
          onClick={onResend}
          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm font-medium transition"
        >
          Resend OTP
        </button>
      )}
    </div>
  );
};

// Enhanced Order Status Badge
const OrderStatusBadge = ({ status, size = "md" }) => {
  const statusConfig = {
    pending: {
      label: "Pending Verification",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      dark: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
    },
    pending_verification: {
      label: "Pending OTP",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      dark: "bg-orange-900/30 text-orange-300 border-orange-700",
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      dark: "bg-blue-900/30 text-blue-300 border-blue-700",
    },
    processing: {
      label: "Processing",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      dark: "bg-purple-900/30 text-purple-300 border-purple-700",
    },
    shipped: {
      label: "Shipped",
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      dark: "bg-indigo-900/30 text-indigo-300 border-indigo-700",
    },
    delivered: {
      label: "Delivered",
      color: "bg-green-100 text-green-800 border-green-300",
      dark: "bg-green-900/30 text-green-300 border-green-700",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800 border-red-300",
      dark: "bg-red-900/30 text-red-300 border-red-700",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`
      inline-flex items-center font-medium rounded-full border
      ${sizeClasses[size]}
      ${config.color} dark:${config.dark}
    `}
    >
      {config.label}
    </span>
  );
};

// Quick Notes Component
const QuickNotes = ({ value, onChange, className = "" }) => {
  const quickNotes = [
    "Leave at doorstep if not home",
    "Call before delivery",
    "Fragile items - handle with care",
    "Office delivery - reception",
    "Weekend delivery preferred",
    "Ring doorbell twice",
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Delivery Instructions
      </label>

      {/* Quick Notes Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickNotes.map((note, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(note)}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {note}
          </button>
        ))}
      </div>

      {/* Custom Notes Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add custom delivery instructions..."
        rows="3"
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100 resize-none transition-colors"
        maxLength="500"
      />

      {/* Character Counter */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {value.length}/500 characters
        </span>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

// Online Payment Coming Soon Component
const OnlinePaymentNotice = () => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6">
    <div className="flex items-start space-x-4">
      <div className="text-3xl">🚀</div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
          Online Payments Coming Soon!
        </h4>
        <p className="text-blue-700 dark:text-blue-400 mb-3">
          We're working hard to bring you secure online payment options. In the meantime,
          you can always pay securely at your doorstep with Cash on Delivery.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Why choose Cash on Delivery?</strong>
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
            <li>• Pay only when you receive your order</li>
            <li>• No online payment risks</li>
            <li>• Verify products before payment</li>
            <li>• Secure OTP verification for every order</li>
          </ul>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          We'll notify you as soon as online payments are available!
        </p>
      </div>
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState(0);

  // Enhanced checkout data state with localStorage persistence
  const [checkoutData, setCheckoutData] = useState(() => {
    const saved = localStorage.getItem('checkoutData');
    return saved ? JSON.parse(saved) : {
      shippingAddressId: "",
      paymentMethod: "",
      notes: "",
      totalAmountFrontend: 0,
    };
  });

  // Enhanced data states
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('checkoutCart');
    return saved ? JSON.parse(saved) : null;
  });
  const [addresses, setAddresses] = useState([]);
  const [orderResult, setOrderResult] = useState(() => {
    const saved = localStorage.getItem('orderResult');
    return saved ? JSON.parse(saved) : null;
  });
  const [otpCode, setOtpCode] = useState("");
  const [orderSummary, setOrderSummary] = useState(() => {
    const saved = localStorage.getItem('orderSummary');
    return saved ? JSON.parse(saved) : null;
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Payment method configuration - Only COD available for now
  const paymentMethods = [
    {
      id: "cod",
      icon: "💰",
      title: "Cash on Delivery",
      description: "Pay securely when you receive your order",
      supported: true,
      requiresOTP: true,
      recommended: true,
    },
    {
      id: "card",
      icon: "💳",
      title: "Credit/Debit Card",
      description: "Secure card payments (Coming Soon)",
      supported: false,
    },
    {
      id: "upi",
      icon: "📱",
      title: "UPI Payment",
      description: "Instant UPI payment (Coming Soon)",
      supported: false,
    },
  ];

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (pageLoaded) {
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }
  }, [checkoutData, pageLoaded]);

  useEffect(() => {
    if (pageLoaded && cart) {
      localStorage.setItem('checkoutCart', JSON.stringify(cart));
    }
  }, [cart, pageLoaded]);

  useEffect(() => {
    if (pageLoaded && orderResult) {
      localStorage.setItem('orderResult', JSON.stringify(orderResult));
    }
  }, [orderResult, pageLoaded]);

  useEffect(() => {
    if (pageLoaded && orderSummary) {
      localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    }
  }, [orderSummary, pageLoaded]);

  // Clear localStorage when checkout is complete
  const clearCheckoutStorage = () => {
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('checkoutCart');
    localStorage.removeItem('orderResult');
    localStorage.removeItem('orderSummary');
  };

  // Handle page refresh warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentStep > 1 || orderResult) {
        e.preventDefault();
        e.returnValue = 'You have an order in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, orderResult]);

  // Update progress helper
  const updateProgress = useCallback((newProgress) => {
    setProgress(newProgress);
  }, []);

  // Load pending orders requiring OTP verification
  const loadPendingOrders = useCallback(async () => {
    try {
      const response = await OrderService.getUserOrders({
        status: "pending_verification",
      });

      if (response.success && response.data?.orders) {
        setPendingOrders(response.data.orders);
      }
    } catch (err) {
      console.error("Failed to load pending orders:", err);
    }
  }, []);

  // Enhanced order summary generation
  const generateAndSetOrderSummary = useCallback((cartData) => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      console.warn("Cannot generate order summary: Cart is empty or invalid");
      setOrderSummary(null);
      return null;
    }

    try {
      const summary = OrderUtils.generateOrderSummary(cartData);
      console.log("Generated Order Summary:", summary);

      // Validate summary structure
      if (
        summary &&
        typeof summary.total === "string" &&
        parseFloat(summary.total) > 0
      ) {
        setOrderSummary(summary);
        return summary;
      } else {
        console.error("Invalid order summary generated:", summary);
        setOrderSummary(null);
        return null;
      }
    } catch (err) {
      console.error("Error generating order summary:", err);
      setOrderSummary(null);
      return null;
    }
  }, []);

  // Update checkout data with total amount
  const updateCheckoutTotal = useCallback((summary) => {
    if (summary && parseFloat(summary.total) > 0) {
      setCheckoutData((prev) => ({
        ...prev,
        totalAmountFrontend: parseFloat(summary.total),
      }));
      return true;
    }
    return false;
  }, []);

  // Enhanced cart data loading with progress
  const loadCartData = async () => {
    try {
      updateProgress(25);
      console.log("Loading cart data...");

      // Use existing cart data if available, otherwise fetch fresh
      let cartData = cart;
      if (!cartData) {
        const cartResponse = await AgrimarketService.CartService.getCart();
        console.log("Cart Response:", cartResponse);

        if (!cartResponse || !cartResponse.success || !cartResponse.cart) {
          throw new Error(cartResponse?.message || "Failed to load cart");
        }
        cartData = cartResponse.cart;
      }

      // Validate cart structure
      if (!cartData.items || cartData.items.length === 0) {
        setError("Your cart is empty");
        setTimeout(() => navigate("/harvestLink/cart"), 2000);
        return null;
      }

      // Enhanced stock validation
      const stockErrors = [];
      const outOfStockItems = [];

      cartData.items.forEach((item) => {
        const availableQty = item.listing?.availableQty || 0;
        const requestedQty = item.qty || 0;

        if (availableQty === 0) {
          outOfStockItems.push(item.product?.title || "Unknown product");
        } else if (requestedQty > availableQty) {
          stockErrors.push(
            `${
              item.product?.title || "Unknown product"
            }: Available ${availableQty}, Requested ${requestedQty}`
          );
        }
      });

      if (outOfStockItems.length > 0) {
        setError(`Out of stock: ${outOfStockItems.join(", ")}`);
        return null;
      }

      if (stockErrors.length > 0) {
        setError(`Stock issues: ${stockErrors.join("; ")}`);
        return null;
      }

      setCart(cartData);
      updateProgress(50);
      return cartData;
    } catch (err) {
      console.error("Cart loading error:", err);
      setError(err.message || "Failed to load cart data");
      return null;
    }
  };

  // Enhanced address loading
  const loadUserAddresses = async () => {
    try {
      const res = await AddressService.getUserAddresses();
      if (!res || res.length === 0) {
        setError("No addresses found. Please add an address first.");
        setTimeout(() => navigate("/harvestLink/addresses"), 1500);
        return [];
      }
      return res;
    } catch (err) {
      console.error("Error loading addresses:", err);
      setError("Failed to load addresses");
      return [];
    }
  };

  // Main data loading function with enhanced progress tracking
  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");
      setDataLoaded(false);
      updateProgress(0);

      // Load cart data first
      const cartData = await loadCartData();
      if (!cartData) {
        updateProgress(0);
        return;
      }

      // Generate order summary from cart
      const summary = generateAndSetOrderSummary(cartData);
      if (!summary) {
        setError("Failed to calculate order total. Please try again.");
        updateProgress(0);
        return;
      }

      // Update checkout total
      const totalUpdated = updateCheckoutTotal(summary);
      if (!totalUpdated) {
        setError("Invalid order total. Please check your cart items.");
        updateProgress(0);
        return;
      }

      // Load addresses
      updateProgress(75);
      const addressesResponse = await loadUserAddresses();
      const user = JSON.parse(localStorage.getItem("userDetails"));

      if (user && user.id) {
        const filteredAddresses =
          addressesResponse.data?.filter(
            (addr) => addr.user && addr.user.toString() === user.id
          ) || [];

        setAddresses(filteredAddresses);

        // Set default address if available and not already set
        if (filteredAddresses.length > 0 && !checkoutData.shippingAddressId) {
          const defaultAddress =
            filteredAddresses.find((addr) => addr.isDefault) ||
            filteredAddresses[0];
          setCheckoutData((prev) => ({
            ...prev,
            shippingAddressId: defaultAddress._id,
          }));
        }
      }

      // Load pending orders
      await loadPendingOrders();

      setDataLoaded(true);
      setPageLoaded(true);
      updateProgress(100);
      console.log(
        "Checkout data loaded successfully. Total amount:",
        summary.total
      );

      // Auto-show pending orders if any exist
      if (pendingOrders.length > 0) {
        setShowPendingOrders(true);
      }

      // Restore step from existing order result
      if (orderResult && orderResult.requiresOTP) {
        setCurrentStep(3);
      }
    } catch (err) {
      console.error("Checkout data loading error:", err);
      setError(err.message || "Failed to load checkout data");
      updateProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadCheckoutData();
  }, []);

  // Recalculate order summary when cart changes
  useEffect(() => {
    if (cart) {
      const summary = generateAndSetOrderSummary(cart);
      if (summary) {
        updateCheckoutTotal(summary);
      }
    }
  }, [cart, generateAndSetOrderSummary, updateCheckoutTotal]);

  const handleInputChange = (field, value) => {
    setCheckoutData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  // Enhanced validation with specific error messages
  const validateStep = (step) => {
    setError("");

    switch (step) {
      case 1: // Shipping
        if (!checkoutData.shippingAddressId) {
          setError("Please select a shipping address");
          return false;
        }
        return true;

      case 2: // Payment
        if (!checkoutData.paymentMethod) {
          setError("Please select a payment method");
          return false;
        }

        // Critical: Validate total amount before proceeding to payment
        if (
          !checkoutData.totalAmountFrontend ||
          checkoutData.totalAmountFrontend <= 0
        ) {
          setError(
            "Invalid order total. Please refresh the page or check your cart."
          );
          return false;
        }

        return true;

      case 3: // OTP
        if (!otpCode || otpCode.length !== 6) {
          setError("Please enter a valid 6-digit OTP");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  // Enhanced order placement with robust error handling
  const handlePlaceOrder = async () => {
    if (!validateStep(currentStep)) return;

    // Final validation: Ensure total amount is valid before sending
    if (
      !checkoutData.totalAmountFrontend ||
      checkoutData.totalAmountFrontend <= 0
    ) {
      setError(
        "Cannot place order: Invalid total amount. Please check your cart."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const orderData = {
        ...checkoutData,
        // Ensure we're sending the latest calculated total
        totalAmountFrontend: checkoutData.totalAmountFrontend,
      };

      console.log("Placing order with data:", orderData);
      console.log("Total amount being sent:", orderData.totalAmountFrontend);

      const result = await CheckoutService.processCheckout(orderData, cart);
      console.log("Order placement result:", result);

      if (result.success) {
        setOrderResult(result.data);
        setCurrentStep(3);
        setSuccess(
          "Order created successfully! Please verify OTP to confirm your order."
        );

        // Clear cart on successful order creation
        try {
          await AgrimarketService.CartService.clearCart();
          localStorage.removeItem('checkoutCart');
        } catch (cartError) {
          console.warn("Failed to clear cart:", cartError);
        }

        // Reload pending orders
        await loadPendingOrders();
      } else {
        setError(result.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced OTP verification
  const handleVerifyOTP = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      setError("");

      if (!orderResult || !orderResult.order) {
        throw new Error("Order information not found");
      }

      const result = await CheckoutService.completeCheckout(
        orderResult.order._id,
        otpCode
      );
      console.log("OTP verification result:", result);

      if (result.success) {
        setSuccess(
          "Order confirmed successfully! Redirecting to order details..."
        );

        // Clear storage and reload pending orders
        clearCheckoutStorage();
        await loadPendingOrders();

        setTimeout(() => {
          navigate(`/harvestLink/orders/${orderResult.order._id}`);
        }, 2000);
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced OTP resend functionality
  const handleResendOTP = async () => {
    try {
      setError("");
      setLoading(true);

      if (!orderResult || !orderResult.order) {
        throw new Error("Order information not found");
      }

      const result = await OrderService.resendOrderOTP(orderResult.order._id);

      if (result.success) {
        setSuccess("A new OTP has been sent to your registered email and phone.");
      } else {
        setError(result.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("OTP resend error:", err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pending order actions
  const handlePendingOrderAction = async (orderId, action) => {
    try {
      setLoading(true);
      setError("");

      if (action === "verify") {
        // Navigate to order verification page
        navigate(`/orders/${orderId}/verify`);
      } else if (action === "cancel") {
        const confirmCancel = window.confirm(
          "Are you sure you want to cancel this order? This action cannot be undone."
        );

        if (confirmCancel) {
          const result = await OrderService.cancelOrder(
            orderId,
            "User cancelled pending order"
          );
          if (result.success) {
            setSuccess("Order cancelled successfully");
            await loadPendingOrders();
          } else {
            setError(result.message || "Failed to cancel order");
          }
        }
      }
    } catch (err) {
      console.error("Pending order action error:", err);
      setError(err.message || "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh Warning Component
  const RefreshWarning = () => (
    <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
            Please don't refresh this page
          </p>
          <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
            Your order progress will be saved, but refreshing may cause temporary issues.
          </p>
        </div>
      </div>
    </div>
  );

  // Pending Orders Panel Component
  const PendingOrdersPanel = () => {
    if (!showPendingOrders || pendingOrders.length === 0) return null;

    return (
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            ⚡ Orders Pending Verification
          </h3>
          <button
            onClick={() => setShowPendingOrders(false)}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
          You have {pendingOrders.length} order(s) waiting for OTP verification.
          Verify them to complete your purchase.
        </p>

        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-300 dark:border-yellow-600"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <OrderStatusBadge status={order.orderStatus} size="sm" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Order #{order.orderId}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total: ₹{order.totalAmount} • {order.items.length} item(s)
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⏰ Expires{" "}
                  {new Date(order.otp?.expiresAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePendingOrderAction(order._id, "verify")}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify
                </button>
                <button
                  onClick={() => handlePendingOrderAction(order._id, "cancel")}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced Step Indicator Component
  const renderStepIndicator = () => (
    <div className="relative flex justify-between max-w-4xl mx-auto mb-12">
      {[
        { step: 1, label: "Shipping", icon: "🚚" },
        { step: 2, label: "Payment", icon: "💳" },
        { step: 3, label: "Confirmation", icon: "✅" },
      ].map(({ step, label, icon }) => (
        <div key={step} className="flex flex-col items-center z-10">
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-full font-bold text-white transition-all duration-300 shadow-lg ${
              currentStep >= step
                ? "bg-green-600 dark:bg-green-500 ring-4 ring-green-200 dark:ring-green-800"
                : "bg-gray-400 dark:bg-gray-600"
            }`}
          >
            {currentStep > step ? "✓" : icon}
          </div>
          <div
            className={`mt-2 text-sm font-medium transition-colors duration-300 ${
              currentStep >= step
                ? "text-green-700 dark:text-green-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {label}
          </div>
        </div>
      ))}
      {/* Progress line */}
      <div className="absolute top-7 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-700 z-0"></div>
      <div
        className="absolute top-7 left-0 h-2 bg-green-600 dark:bg-green-500 z-0 transition-all duration-500 ease-in-out"
        style={{
          width: `${
            currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%"
          }`,
        }}
      ></div>
    </div>
  );

  // Enhanced Shipping Step
  const renderShippingStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
        🚚 1. Shipping Information
      </h3>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No addresses found
          </p>
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            onClick={() => navigate("/harvestLink/addresses")}
          >
            Add Shipping Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-x-auto">
          <div className="min-w-[300px]">
            <button
              className="w-full h-full min-h-32 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl flex flex-col items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              onClick={() => navigate("/harvestLink/addresses")}
            >
              <span className="text-2xl mb-2">+</span>
              <span className="font-semibold">Add New Address</span>
            </button>
          </div>
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition duration-200 ${
                checkoutData.shippingAddressId === address._id
                  ? "border-green-500 bg-green-50 dark:bg-gray-700 ring-2 ring-green-200 dark:ring-green-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300"
              }`}
              onClick={() =>
                handleInputChange("shippingAddressId", address._id)
              }
            >
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {address.name}
                </h4>
                <div className="flex space-x-1">
                  {address.isDefault && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                      Default
                    </span>
                  )}
                  {checkoutData.shippingAddressId === address._id && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">
                      Selected
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {address.street}, {address.city}, {address.state}{" "}
                {address.zipCode}
              </p>
              {address.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  📞 {address.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <QuickNotes
        value={checkoutData.notes}
        onChange={(notes) => handleInputChange("notes", notes)}
        className="pt-4"
      />
    </div>
  );

  // Enhanced Payment Step
  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
        💳 2. Payment Method
      </h3>

      {/* Online Payment Notice */}
      <OnlinePaymentNotice />

      {/* Total amount validation display */}
      {checkoutData.totalAmountFrontend > 0 ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
          <p className="text-green-700 dark:text-green-300 font-semibold text-lg">
            Order Total: ₹{checkoutData.totalAmountFrontend.toFixed(2)}
          </p>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-700 dark:text-red-300">
            Unable to calculate order total. Please refresh the page.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition duration-200 ${
              checkoutData.paymentMethod === method.id
                ? "border-green-500 bg-green-50 dark:bg-gray-700 ring-2 ring-green-200 dark:ring-green-800"
                : method.supported
                ? "border-gray-200 dark:border-gray-700 hover:border-green-300"
                : "border-gray-100 dark:border-gray-800"
            } ${!method.supported ? "opacity-60 cursor-not-allowed" : ""} ${
              method.recommended ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""
            }`}
            onClick={() =>
              method.supported && handleInputChange("paymentMethod", method.id)
            }
          >
            <div className="text-3xl mr-4">{method.icon}</div>
            <div className="flex-grow">
              <div className="flex items-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {method.title}
                </h4>
                {method.recommended && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
                {method.requiresOTP && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded">
                    OTP Required
                  </span>
                )}
                {!method.supported && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {method.description}
              </p>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={checkoutData.paymentMethod === method.id}
              readOnly
              className="h-5 w-5 text-green-600 focus:ring-green-500"
              disabled={!method.supported}
            />
          </div>
        ))}
      </div>

      {/* OTP Information */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          🔐 <strong>Secure OTP Verification:</strong> For your security, all orders require OTP verification.
          A 6-digit OTP will be sent to your registered email and phone. The OTP is valid for 10 minutes.
        </p>
      </div>
    </div>
  );

  // Enhanced OTP Step
  const renderOTPStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
        🔐 3. Verify Your Order
      </h3>

      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📧</div>
          <div className="flex-1">
            <p className="text-gray-700 dark:text-yellow-200 mb-4">
              We've sent a 6-digit verification code to your registered email
              and phone. Please enter it below to confirm your order.
              <br />
              <span className="text-sm font-medium">
                OTP is valid for 10 minutes
              </span>
            </p>

            {/* OTP Timer */}
            {orderResult?.order?.otp?.expiresAt && (
              <OTPTimer
                expiresAt={orderResult.order.otp.expiresAt}
                onExpire={() =>
                  setError("OTP has expired. Please resend a new one.")
                }
                onResend={handleResendOTP}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="flex-1">
            <input
              type="text"
              maxLength="6"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setOtpCode(value);
                setError("");
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full p-4 text-center text-2xl font-mono border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100 transition-colors"
            />
          </div>

          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="px-6 py-3 border border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>

      {orderResult?.order && orderSummary && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Order Preview
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Order ID:
              </span>
              <p className="font-mono text-gray-900 dark:text-gray-100">
                {orderResult.order.orderId}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <p className="font-semibold text-green-600 dark:text-green-400">
                ₹{orderSummary.total}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Payment:</span>
              <p className="capitalize">
                {checkoutData.paymentMethod.replace("_", " ")}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <OrderStatusBadge
                status={orderResult.order.orderStatus}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced Order Summary
  const renderOrderSummary = () => {
    if (!orderSummary) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Order Summary
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Calculating order total...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Order Summary
        </h3>

        <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
          {orderSummary.items.map((item, index) => (
            <div key={item._id || index} className="flex items-center gap-3">
              <img
                src={item.productImage}
                alt={item.productTitle}
                className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.productTitle}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.quantity} × ₹{item.price}
                </p>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ₹{item.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal:</span>
            <span>₹{orderSummary.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Discount:</span>
            <span className="text-red-600 dark:text-red-400 font-bold">
              - ₹{orderSummary.discount}
            </span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Shipping:</span>
            <span>₹{orderSummary.shipping}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tax (5%):</span>
            <span>₹{orderSummary.tax}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
            <span>Total:</span>
            <span className="text-green-600 dark:text-green-400">
              ₹{orderSummary.total}
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <span>🔒</span>
            <span>Secure Checkout • SSL Encrypted</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/harvestLink/browse")}
              className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/harvestLink/cart")}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner
          message="Loading your cart and calculating total..."
          progress={progress}
        />
      </div>
    );
  }

  if (!cart || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 dark:text-red-400 text-2xl font-semibold mb-4">
            Oops! Your cart seems empty.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            It looks like you haven't added any items yet. Let's get you back to
            shopping!
          </p>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 justify-center">
            <button
              onClick={loadCheckoutData}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/harvestLink/cart")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Go to Cart
            </button>
            <button
              onClick={() => navigate("/harvestLink/browse")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-44 min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <CartBar />
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Checkout
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete your purchase securely
            </p>
          </div>
          <button
            onClick={() => navigate("/harvestLink/cart")}
            className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition"
          >
            <span>←</span>
            <span>Back to Cart</span>
          </button>
        </div>

        {/* Refresh Warning */}
        {(currentStep > 1 || orderResult) && <RefreshWarning />}

        {/* Pending Orders Panel */}
        <PendingOrdersPanel />

        {/* Step Indicator */}
        {renderStepIndicator()}

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* Enhanced Alerts */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded flex items-start space-x-3">
                  <span className="text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded flex items-start space-x-3">
                  <span className="text-lg">✅</span>
                  <div className="flex-1">
                    <p className="font-medium">Success</p>
                    <p>{success}</p>
                  </div>
                  <button
                    onClick={() => setSuccess("")}
                    className="text-green-500 hover:text-green-700 dark:hover:text-green-400"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Step Content */}
              {currentStep === 1 && renderShippingStep()}
              {currentStep === 2 && renderPaymentStep()}
              {currentStep === 3 && renderOTPStep()}

              {/* Enhanced Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                {currentStep > 1 && (
                  <button
                    onClick={handlePreviousStep}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    <span>←</span>
                    <span>Previous</span>
                  </button>
                )}

                <div className={currentStep === 1 ? "ml-auto" : ""}>
                  {currentStep < 3 ? (
                    <button
                      onClick={
                        currentStep === 2 ? handlePlaceOrder : handleNextStep
                      }
                      disabled={
                        loading ||
                        (currentStep === 2 &&
                          (!checkoutData.totalAmountFrontend ||
                            checkoutData.totalAmountFrontend <= 0))
                      }
                      className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <span>
                        {loading
                          ? "Processing..."
                          : currentStep === 2
                          ? "Place Order"
                          : "Continue"}
                      </span>
                      {currentStep !== 2 && <span>→</span>}
                    </button>
                  ) : (
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otpCode.length !== 6}
                      className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <span>{loading ? "Verifying..." : "Confirm Order"}</span>
                      <span>✓</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            {renderOrderSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;