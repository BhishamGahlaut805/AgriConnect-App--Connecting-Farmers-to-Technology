// TrackingService.js
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
    console.error("Tracking API call failed:", error);
    throw error;
  }
}

export const TrackingService = {
  // Track order by ID
  trackOrder: async (orderId) => {
    return handleApiCall(`${BASE_URL}/tracking/${orderId}`);
  },

  // Get order timeline
  getOrderTimeline: async (orderId) => {
    return handleApiCall(`${BASE_URL}/tracking/${orderId}/timeline`);
  },

  // Update order location (Admin only)
  updateOrderLocation: async (orderId, locationData) => {
    return handleApiCall(`${BASE_URL}/tracking/${orderId}/update-location`, {
      method: "POST",
      body: JSON.stringify(locationData),
    });
  },

  // Get user's active orders
  getUserActiveOrders: async () => {
    return handleApiCall(`${BASE_URL}/tracking/user/active-orders`);
  },

  // Get seller's pending shipments
  getSellerPendingShipments: async () => {
    return handleApiCall(`${BASE_URL}/tracking/seller/pending-shipments`);
  },

  // Confirm delivery with OTP
  confirmDelivery: async (orderId, otpCode) => {
    return handleApiCall(`${BASE_URL}/tracking/${orderId}/confirm-delivery`, {
      method: "POST",
      body: JSON.stringify({ otpCode }),
    });
  },

  // Resend delivery OTP
  resendDeliveryOTP: async (orderId) => {
    return handleApiCall(`${BASE_URL}/tracking/${orderId}/resend-otp`, {
      method: "POST",
    });
  },

  // Batch track multiple orders
  trackMultipleOrders: async (orderIds) => {
    const trackingPromises = orderIds.map((orderId) =>
      TrackingService.trackOrder(orderId).catch((error) => ({
        orderId,
        error: error.message,
        success: false,
      }))
    );

    const results = await Promise.all(trackingPromises);
    return {
      success: true,
      data: results,
    };
  },

  // Get delivery status summary
  getDeliveryStatusSummary: async () => {
    const activeOrders = await TrackingService.getUserActiveOrders();

    if (activeOrders.success && activeOrders.data.orders) {
      const statusCount = activeOrders.data.orders.reduce((acc, order) => {
        acc[order.deliveryStatus] = (acc[order.deliveryStatus] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalActive: activeOrders.data.orders.length,
          statusCount,
          orders: activeOrders.data.orders,
        },
      };
    }

    return activeOrders;
  },
};

// Helper functions for tracking
export const TrackingUtils = {
  // Generate tracking timeline with human-readable dates
  formatTimeline: (timeline) => {
    return timeline.map((event) => ({
      ...event,
      formattedDate: new Date(event.timestamp).toLocaleDateString(),
      formattedTime: new Date(event.timestamp).toLocaleTimeString(),
      isCompleted: event.status === "completed",
      isCurrent: event.status === "current",
      isPending: event.status === "pending",
    }));
  },

  // Calculate delivery progress percentage
  calculateProgress: (timeline) => {
    const completedEvents = timeline.filter(
      (event) => event.status === "completed"
    );
    return Math.round((completedEvents.length / timeline.length) * 100);
  },

  // Get current delivery status
  getCurrentStatus: (order) => {
    const statusMap = {
      pending: "Order Placed",
      confirmed: "Order Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      in_transit: "In Transit",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return statusMap[order.deliveryStatus] || order.deliveryStatus;
  },

  // Check if delivery can be confirmed
  canConfirmDelivery: (order) => {
    return (
      order.deliveryStatus === "out_for_delivery" &&
      order.otp &&
      !order.otp.verified
    );
  },

  // Estimate time remaining
  getTimeRemaining: (estimatedDelivery) => {
    const now = new Date();
    const deliveryDate = new Date(estimatedDelivery);
    const diffTime = deliveryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Delayed";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  },
};

export default TrackingService;
