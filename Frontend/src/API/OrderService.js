// OrderService.js - Fixed version
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/Agrimarket/v1/api`;

// Helper: get token from localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
}

async function handleApiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      throw new Error("Authentication required. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Order API call failed:", error);
    throw error;
  }
}

export const OrderService = {
  // Orderservice.js
  createOrder: async (orderData) => {
    console.log(
      "Order Data being sent to createOrder by Orderservice:",
      orderData
    );
    const response = await handleApiCall(`${BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ← important
      },
      body: JSON.stringify(orderData),
    });
    console.log("Response from createOrder in Orderservice:", response);
    return response;
  },

  // Verify OTP and confirm order
  verifyOrderOTP: async (orderId, otpCode) => {
    console.log(
      "Verifying OTP for Order ID:",
      orderId,
      "with OTP Code:",
      otpCode
    );
    console.log("Order ID type:", typeof orderId, "OTP Code type:", typeof otpCode);
    const response = await handleApiCall(
      `${BASE_URL}/orders/${orderId}/verify-otp`,
      {
        method: "POST",
        body: JSON.stringify({ otpCode: otpCode , orderId: orderId }),
      }
    );
    console.log("Response from verifyOrderOTP in Orderservice:", response);
    return response;
  },

  // Get user orders with filters
  getUserOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return handleApiCall(`${BASE_URL}/orders/my-orders?${queryParams}`);
  },

  // Get seller orders
  getSellerOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return handleApiCall(`${BASE_URL}/orders/seller/orders?${queryParams}`);
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    return handleApiCall(`${BASE_URL}/orders/${orderId}`);
  },

  // Update order status
  updateOrderStatus: async (orderId, statusData) => {
    return handleApiCall(`${BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    return handleApiCall(`${BASE_URL}/orders/${orderId}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  // Get all orders (Admin only)
  getAllOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return handleApiCall(`${BASE_URL}/orders?${queryParams}`);
  },

  // Delete order (Admin only)
  deleteOrder: async (orderId) => {
    return handleApiCall(`${BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
    });
  },
  // Add to OrderService object
  resendOrderOTP: async (orderId) => {
    console.log("Resending OTP for Order ID:", orderId);
    const response = await handleApiCall(
      `${BASE_URL}/orders/${orderId}/resend-otp`,
      {
        method: "POST",
      }
    );
    console.log("Response from resendOrderOTP in Orderservice:", response);
    return response;
  },
};

// Order-related utility functions - FIXED for your cart structure
export const OrderUtils = {
  // Calculate order total from cart items
  calculateOrderTotal: (items) => {
    return items.reduce((total, item) => {
      const price = item.listing?.pricePerUnit || item.product?.price || 0;
      const quantity = item.qty || 0;
      return total + price * quantity;
    }, 0);
  },

  // Format order status for display
  formatOrderStatus: (status) => {
    const statusMap = {
      pending: { text: "Pending", color: "orange", variant: "warning" },
      confirmed: { text: "Confirmed", color: "blue", variant: "info" },
      processing: { text: "Processing", color: "purple", variant: "secondary" },
      shipped: { text: "Shipped", color: "teal", variant: "secondary" },
      delivered: { text: "Delivered", color: "green", variant: "success" },
      cancelled: { text: "Cancelled", color: "red", variant: "danger" },
      refunded: { text: "Refunded", color: "gray", variant: "light" },
    };

    return (
      statusMap[status] || { text: status, color: "gray", variant: "light" }
    );
  },

  // Format payment status for display
  formatPaymentStatus: (status) => {
    const statusMap = {
      pending: { text: "Pending", color: "orange", variant: "warning" },
      completed: { text: "Paid", color: "green", variant: "success" },
      failed: { text: "Failed", color: "red", variant: "danger" },
      refunded: { text: "Refunded", color: "gray", variant: "light" },
      cancelled: { text: "Cancelled", color: "red", variant: "danger" },
    };

    return (
      statusMap[status] || { text: status, color: "gray", variant: "light" }
    );
  },

  // Check if order can be cancelled
  canCancelOrder: (order) => {
    const nonCancellableStatuses = ["shipped", "delivered", "cancelled"];
    return !nonCancellableStatuses.includes(order.orderStatus);
  },

  // Check if order requires OTP verification
  requiresOTPVerification: (order) => {
    return order.orderStatus === "pending" && order.otp && !order.otp.verified;
  },

  // Format order items for display - FIXED for your cart structure
  formatOrderItems: (items) => {
    return items.map((item) => {
      const price = item.listing?.pricePerUnit || item.product?.price || 0;
      const quantity = item.qty || 0;
      const total = price * quantity;

      return {
        ...item,
        price,
        quantity,
        total,
        formattedPrice: `₹${price.toFixed(2)}`,
        formattedTotal: `₹${total.toFixed(2)}`,
        productTitle: item.product?.title || "Unknown Product",
        productImage: item.product?.images?.[0] || "/placeholder-image.jpg",
        unit: item.product?.unit || "unit",
      };
    });
  },

  // Generate order summary - FIXED for your cart structure
  generateOrderSummary: (cart, shippingCost = 50, taxRate = 0.05) => {
    if (!cart || !cart.items) {
      return {
        items: [],
        subtotal: "0.00",
        tax: "50.00",
        shipping: "50.00",
        total: "0.00",
        itemCount: 0,
        taxRate,
        discount: 150,
      };
    }

    const items = OrderUtils.formatOrderItems(cart.items);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * taxRate;
    const shipping = shippingCost;
    const discount = 150;
    const total = subtotal + tax + shipping - discount;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      itemCount,
      taxRate,
      discount: 150,
    };
  },
};

// Checkout-specific functions
export const CheckoutService = {
  // Validate checkout data
  validateCheckoutData: (checkoutData, cart) => {
    const errors = [];

    if (!checkoutData.shippingAddressId) {
      errors.push("Shipping address is required");
    }

    if (!checkoutData.paymentMethod) {
      errors.push("Payment method is required");
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      errors.push("Cart is empty");
    }

    // Validate stock availability
    if (cart && cart.items) {
      cart.items.forEach((item) => {
        const availableQty = item.listing?.availableQty || 0;
        const requestedQty = item.qty || 0;
        if (requestedQty > availableQty) {
          errors.push(
            `Insufficient stock for ${item.product?.title}. Available: ${availableQty}, Requested: ${requestedQty}`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Process checkout steps
  processCheckout: async (checkoutData, cart) => {
    // Step 1: Validate data
    const validation = CheckoutService.validateCheckoutData(checkoutData, cart);
    if (!validation.isValid) {
      throw new Error(
        `Checkout validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Step 2: Create order
    const orderResult = await OrderService.createOrder(checkoutData);
    console.log("Order created successfully:", orderResult);
    if (!orderResult.success) {
      throw new Error(orderResult.message || "Failed to create order");
    }

    return orderResult;
  },
  // Complete checkout with OTP verification
  completeCheckout: async (orderId, otpCode) => {
    const verificationResult = await OrderService.verifyOrderOTP(
      orderId,
      otpCode
    );
    console.log("OTP verification result:", verificationResult);
    if (!verificationResult.success) {
      throw new Error(verificationResult.message || "OTP verification failed");
    }

    return verificationResult;
  },
};

export default OrderService;
