// AgrimarketService.js
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

function getMultipartHeaders() {
  return {
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
      localStorage.removeItem("LoginToken");
      localStorage.removeItem("userDetails");
      window.dispatchEvent(new Event("unauthorized"));
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
    console.error("API call failed:", error);
    throw error;
  }
}

// Authentication helper functions
export const AuthService = {
  isAuthenticated: () => {
    const token = localStorage.getItem("LoginToken");
    return !!token;
  },

  logout: () => {
    localStorage.removeItem("LoginToken");
    localStorage.removeItem("userDetails");
    window.dispatchEvent(new Event("logout"));
  },

  getToken: () => localStorage.getItem("LoginToken"),

  getUser: () => {
    const user = localStorage.getItem("userDetails");
    return user ? JSON.parse(user) : null;
  },
};

// Enhanced Products Service with OTP Verification
export const ProductService = {
  // List products with advanced filtering
  listProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/products${queryParams ? `?${queryParams}` : ""}`;
    return handleApiCall(url);
  },

  getProduct: async (id) => {
    return handleApiCall(`${BASE_URL}/products/${id}`);
  },

  // OTP-based product creation for multiple products
  initiateProductCreation: async (products, email) => {
    return handleApiCall(`${BASE_URL}/products/initiate`, {
      method: "POST",
      body: JSON.stringify({ products, email }),
    });
  },

  verifyAndCreateProducts: async (verificationId, otp, images) => {
    const formData = new FormData();
    formData.append("verificationId", verificationId);
    formData.append("otp", otp);

    // Append images for all products
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(`${BASE_URL}/products/verify-create`, {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  },

  // Single product creation (legacy support)
  createProduct: async (productData, images) => {
    // Convert single product to array for consistency
    const products = [productData];
    const user = AuthService.getUser();
    const email = user?.email;

    if (!email) {
      throw new Error("User email is required for product creation");
    }

    // Use OTP flow for single product as well
    const initiation = await ProductService.initiateProductCreation(
      products,
      email
    );

    // For single product, we can auto-verify if needed or proceed with OTP
    return initiation;
  },

  updateProduct: async (id, updates) => {
    return handleApiCall(`${BASE_URL}/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  deleteProduct: async (id) => {
    return handleApiCall(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
  },

  // Get user's products (for sellers)
  getMyProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/products/user/my-products${
      queryParams ? `?${queryParams}` : ""
    }`;
    return handleApiCall(url);
  },

  // Bulk product operations
  bulkUpdateProducts: async (productIds, updates) => {
    return handleApiCall(`${BASE_URL}/products/bulk-update`, {
      method: "PATCH",
      body: JSON.stringify({ productIds, updates }),
    });
  },
};

// Enhanced Listing Service with OTP Verification
export const ListingService = {
  // List all listings with advanced filtering
  listListings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/listings${queryParams ? `?${queryParams}` : ""}`;
    return handleApiCall(url);
  },

  // OTP-based listing creation
  createListing: async (listingData) => {
    const {
      product,
      pricePerUnit,
      availableQty,
      minOrderQty,
      description,
      email,
    } = listingData;

    return handleApiCall(`${BASE_URL}/listings`, {
      method: "POST",
      body: JSON.stringify({
        product,
        pricePerUnit,
        availableQty,
        minOrderQty,
        description,
        email,
      }),
    });
  },

  verifyAndCreateListing: async (verificationId, otp) => {
    return handleApiCall(`${BASE_URL}/listings/verify`, {
      method: "POST",
      body: JSON.stringify({ verificationId, otp }),
    });
  },

  getListing: async (id) => {
    return handleApiCall(`${BASE_URL}/listings/${id}`);
  },

  updateListing: async (id, updates) => {
    return handleApiCall(`${BASE_URL}/listings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  deleteListing: async (id) => {
    return handleApiCall(`${BASE_URL}/listings/${id}`, {
      method: "DELETE",
    });
  },

  // Toggle listing status
  toggleListingStatus: async (id, status) => {
    return handleApiCall(`${BASE_URL}/listings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Get user's listings
  getMyListings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/listings/my-listings${
      queryParams ? `?${queryParams}` : ""
    }`;
    return handleApiCall(url);
  },

  // Search listings
  searchListings: async (query, filters = {}) => {
    const searchParams = new URLSearchParams({
      q: query,
      ...filters,
    }).toString();
    return handleApiCall(`${BASE_URL}/listings?${searchParams}`);
  },
};

// Enhanced Admin Service with Bulk Operations
export const AdminService = {
  // Dashboard Metrics
  getMetrics: async () => {
    return handleApiCall(`${BASE_URL}/admin/metrics`);
  },

  // User Management
  updateUserRole: async (userId, newRole) => {
    return handleApiCall(`${BASE_URL}/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
  },

  listKycPending: async () => {
    return handleApiCall(`${BASE_URL}/admin/kyc/pending`);
  },

  verifyKyc: async (kycId) => {
    return handleApiCall(`${BASE_URL}/admin/kyc/${kycId}/verify`, {
      method: "PATCH",
    });
  },

  // Enhanced Product Management
  listPendingProducts: async (page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({ page, limit }).toString();
    return handleApiCall(`${BASE_URL}/admin/products/pending?${queryParams}`);
  },

  approveProduct: async (productId) => {
    return handleApiCall(`${BASE_URL}/admin/products/${productId}/approve`, {
      method: "PATCH",
    });
  },

  rejectProduct: async (productId, reason) => {
    return handleApiCall(`${BASE_URL}/admin/products/${productId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  // Bulk product operations
  bulkApproveProducts: async (productIds) => {
    return handleApiCall(`${BASE_URL}/admin/products/bulk-approve`, {
      method: "POST",
      body: JSON.stringify({ productIds }),
    });
  },

  bulkRejectProducts: async (productIds, reason) => {
    return handleApiCall(`${BASE_URL}/admin/products/bulk-reject`, {
      method: "POST",
      body: JSON.stringify({ productIds, reason }),
    });
  },

  getProductStats: async () => {
    return handleApiCall(`${BASE_URL}/admin/products/stats`);
  },

  // Listing Management
  listPendingListings: async (page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({
      status: "pending",
      page,
      limit,
    }).toString();
    return handleApiCall(`${BASE_URL}/listings?${queryParams}`);
  },

  approveListing: async (listingId) => {
    return handleApiCall(`${BASE_URL}/admin/listings/${listingId}/approve`, {
      method: "PATCH",
    });
  },

  rejectListing: async (listingId, reason) => {
    return handleApiCall(`${BASE_URL}/admin/listings/${listingId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  // Analytics and Reports
  generateSalesReport: async (startDate, endDate) => {
    const queryParams = new URLSearchParams({
      start: startDate,
      end: endDate,
    }).toString();
    return handleApiCall(`${BASE_URL}/admin/reports/sales?${queryParams}`);
  },

  getUserAnalytics: async () => {
    return handleApiCall(`${BASE_URL}/admin/analytics/users`);
  },

  getPlatformAnalytics: async (period = "monthly") => {
    return handleApiCall(
      `${BASE_URL}/admin/analytics/platform?period=${period}`
    );
  },

  // System Management
  getSystemHealth: async () => {
    return handleApiCall(`${BASE_URL}/admin/system/health`);
  },

  clearCache: async (cacheType) => {
    return handleApiCall(`${BASE_URL}/admin/system/clear-cache`, {
      method: "POST",
      body: JSON.stringify({ cacheType }),
    });
  },
};

// Enhanced OTP Service
export const OTPService = {
  // Resend OTP
  resendOTP: async (verificationId, email) => {
    return handleApiCall(`${BASE_URL}/otp/resend`, {
      method: "POST",
      body: JSON.stringify({ verificationId, email }),
    });
  },

  // Validate OTP without action
  validateOTP: async (verificationId, otp) => {
    return handleApiCall(`${BASE_URL}/otp/validate`, {
      method: "POST",
      body: JSON.stringify({ verificationId, otp }),
    });
  },

  // Get OTP status
  getOTPStatus: async (verificationId) => {
    return handleApiCall(`${BASE_URL}/otp/status/${verificationId}`);
  },
};

// Notification Service
export const NotificationService = {
  getUserNotifications: async (page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({ page, limit }).toString();
    return handleApiCall(`${BASE_URL}/notifications?${queryParams}`);
  },

  markAsRead: async (notificationId) => {
    return handleApiCall(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  markAllAsRead: async () => {
    return handleApiCall(`${BASE_URL}/notifications/read-all`, {
      method: "PATCH",
    });
  },

  getUnreadCount: async () => {
    return handleApiCall(`${BASE_URL}/notifications/unread-count`);
  },
};

// Existing services (updated with proper error handling)
export const CropService = {
  listCrops: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/crops${queryParams ? `?${queryParams}` : ""}`;
    return handleApiCall(url);
  },

  getCrop: async (id) => {
    return handleApiCall(`${BASE_URL}/crops/${id}`);
  },

  createCrop: async (cropData, images) => {
    const formData = new FormData();

    Object.keys(cropData).forEach((key) => {
      formData.append(key, cropData[key]);
    });

    if (images) {
      Array.from(images).forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(`${BASE_URL}/crops`, {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  },

  updateCrop: async (id, updates) => {
    return handleApiCall(`${BASE_URL}/crops/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  createAuctionForCrop: async (cropId, auctionData) => {
    return handleApiCall(`${BASE_URL}/crops/${cropId}/auction`, {
      method: "POST",
      body: JSON.stringify(auctionData),
    });
  },
};

export const AuctionService = {
  listAuctions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/auctions${queryParams ? `?${queryParams}` : ""}`;
    return handleApiCall(url);
  },

  getAuction: async (id) => {
    return handleApiCall(`${BASE_URL}/auctions/${id}`);
  },

  placeBid: async (auctionId, bidAmount) => {
    return handleApiCall(`${BASE_URL}/auctions/${auctionId}/bid`, {
      method: "POST",
      body: JSON.stringify({ amount: bidAmount }),
    });
  },
};

export const CartService = {
  getCart: async () => {
    return handleApiCall(`${BASE_URL}/cart`);
  },

  addItem: async (listingId, quantity) => {
    return handleApiCall(`${BASE_URL}/cart/add`, {
      method: "POST",
      body: JSON.stringify({ listingId, qty: quantity }),
    });
  },

  updateItem: async (listingId, quantity) => {
    return handleApiCall(`${BASE_URL}/cart/update`, {
      method: "PUT",
      body: JSON.stringify({ listingId, qty: quantity }),
    });
  },

  removeItem: async (listingId) => {
    return handleApiCall(`${BASE_URL}/cart/remove`, {
      method: "DELETE",
      body: JSON.stringify({ listingId }),
    });
  },

  clearCart: async () => {
    return handleApiCall(`${BASE_URL}/cart/clear`, {
      method: "DELETE",
    });
  },
};

export const OrderService = {
  createOrderFromCart: async () => {
    return handleApiCall(`${BASE_URL}/orders`, {
      method: "POST",
    });
  },

  createDirectOrder: async (orderData) => {
    return handleApiCall(`${BASE_URL}/orders/direct`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  getOrder: async (id) => {
    return handleApiCall(`${BASE_URL}/orders/${id}`);
  },

  getMyOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/orders/my-orders${
      queryParams ? `?${queryParams}` : ""
    }`;
    return handleApiCall(url);
  },

  cancelOrder: async (id) => {
    return handleApiCall(`${BASE_URL}/orders/${id}/cancel`, {
      method: "POST",
    });
  },

  advanceOrderStatus: async (id) => {
    return handleApiCall(`${BASE_URL}/orders/${id}/advance`, {
      method: "POST",
    });
  },
};

export const PaymentService = {
  createPaymentIntent: async (orderData) => {
    return handleApiCall(`${BASE_URL}/payments/create`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  confirmPayment: async (paymentId) => {
    return handleApiCall(`${BASE_URL}/payments/${paymentId}/confirm`, {
      method: "POST",
    });
  },

  getPaymentMethods: async () => {
    return handleApiCall(`${BASE_URL}/payments/methods`);
  },
};

export const InventoryService = {
  listInventory: async () => {
    return handleApiCall(`${BASE_URL}/inventory`);
  },

  updateInventory: async (inventoryData) => {
    return handleApiCall(`${BASE_URL}/inventory`, {
      method: "POST",
      body: JSON.stringify(inventoryData),
    });
  },

  getInventoryStats: async () => {
    return handleApiCall(`${BASE_URL}/inventory/stats`);
  },
};

export const ReviewService = {
  listReviews: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/reviews${queryParams ? `?${queryParams}` : ""}`;
    return handleApiCall(url);
  },

  createReview: async (reviewData) => {
    return handleApiCall(`${BASE_URL}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  getProductReviews: async (productId) => {
    return handleApiCall(`${BASE_URL}/reviews/product/${productId}`);
  },

  getSellerReviews: async (sellerId) => {
    return handleApiCall(`${BASE_URL}/reviews/seller/${sellerId}`);
  },
};

export const ShipmentService = {
  getQuote: async (shipmentData) => {
    return handleApiCall(`${BASE_URL}/shipment/quote`, {
      method: "POST",
      body: JSON.stringify(shipmentData),
    });
  },

  bookShipment: async (bookingData) => {
    return handleApiCall(`${BASE_URL}/shipment/book`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  trackShipment: async (trackingId) => {
    return handleApiCall(`${BASE_URL}/shipment/track/${trackingId}`);
  },
};

export const ChatService = {
  listThreads: async () => {
    return handleApiCall(`${BASE_URL}/chat/threads`);
  },

  createThread: async (userId) => {
    return handleApiCall(`${BASE_URL}/chat/threads/${userId}`, {
      method: "POST",
    });
  },

  getThread: async (threadId) => {
    return handleApiCall(`${BASE_URL}/chat/threads/${threadId}`);
  },

  sendMessage: async (threadId, message) => {
    return handleApiCall(`${BASE_URL}/chat/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  markAsRead: async (threadId) => {
    return handleApiCall(`${BASE_URL}/chat/threads/${threadId}/read`, {
      method: "PATCH",
    });
  },
};

export const CMSService = {
  listPages: async () => {
    return handleApiCall(`${BASE_URL}/cms`);
  },

  getPage: async (id) => {
    return handleApiCall(`${BASE_URL}/cms/${id}`);
  },

  createPage: async (pageData) => {
    return handleApiCall(`${BASE_URL}/cms`, {
      method: "POST",
      body: JSON.stringify(pageData),
    });
  },

  updatePage: async (id, updates) => {
    return handleApiCall(`${BASE_URL}/cms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

// Utility functions
export const ServiceUtils = {
  // File upload helper
  uploadFiles: async (files, endpoint = "/upload") => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "File upload failed");
    }

    return await response.json();
  },

  // Pagination helper
  buildPaginationParams: (page, limit, filters = {}) => {
    return {
      page: page || 1,
      limit: limit || 20,
      ...filters,
    };
  },

  // Error handler
  handleServiceError: (error, defaultMessage = "Operation failed") => {
    console.error("Service error:", error);
    if (error.message && error.message !== "Failed to fetch") {
      throw error;
    }
    throw new Error(defaultMessage);
  },
};

// Export main service object
const AgrimarketService = {
  AuthService,
  ProductService,
  ListingService,
  AdminService,
  OTPService,
  NotificationService,
  CropService,
  AuctionService,
  CartService,
  OrderService,
  PaymentService,
  InventoryService,
  ReviewService,
  ShipmentService,
  ChatService,
  CMSService,
  ServiceUtils,
};

export default AgrimarketService;

// Global error event listener for authentication
if (typeof window !== "undefined") {
  window.addEventListener("unauthorized", () => {
    console.warn("Authentication expired. Redirecting to login...");
    if (window.location.pathname !== "/login") {
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
    }
  });

  window.addEventListener("logout", () => {
    console.log("User logged out");
  });
}
