// DashboardService.js
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
    console.error("Dashboard API call failed:", error);
    throw error;
  }
}

export const DashboardService = {
  // User Dashboard
  getUserDashboard: async () => {
    return handleApiCall(`${BASE_URL}/dashboard/user/overview`);
  },

  getUserAnalytics: async (period = "month") => {
    const queryParams = new URLSearchParams({ period }).toString();
    return handleApiCall(`${BASE_URL}/dashboard/user/analytics?${queryParams}`);
  },

  // Seller Dashboard
  getSellerDashboard: async () => {
    return handleApiCall(`${BASE_URL}/dashboard/seller/overview`);
  },

  getSellerAnalytics: async (period = "month") => {
    const queryParams = new URLSearchParams({ period }).toString();
    return handleApiCall(
      `${BASE_URL}/dashboard/seller/analytics?${queryParams}`
    );
  },

  getSellerProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return handleApiCall(
      `${BASE_URL}/dashboard/seller/products?${queryParams}`
    );
  },

  // Admin Dashboard
  getAdminDashboard: async () => {
    return handleApiCall(`${BASE_URL}/dashboard/admin/overview`);
  },

  getAdminAnalytics: async (period = "month") => {
    const queryParams = new URLSearchParams({ period }).toString();
    return handleApiCall(
      `${BASE_URL}/dashboard/admin/analytics?${queryParams}`
    );
  },

  getAdminReports: async (reportType, startDate, endDate) => {
    const queryParams = new URLSearchParams({
      reportType,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }).toString();
    return handleApiCall(`${BASE_URL}/dashboard/admin/reports?${queryParams}`);
  },

  // Quick Stats
  getQuickStats: async (userType = "user") => {
    switch (userType) {
      case "seller":
        return DashboardService.getSellerDashboard();
      case "admin":
        return DashboardService.getAdminDashboard();
      default:
        return DashboardService.getUserDashboard();
    }
  },

  // Sales Reports
  generateSalesReport: async (startDate, endDate) => {
    return DashboardService.getAdminReports("sales", startDate, endDate);
  },

  generateInventoryReport: async () => {
    return DashboardService.getAdminReports("inventory");
  },

  generateUserReport: async (startDate, endDate) => {
    return DashboardService.getAdminReports("users", startDate, endDate);
  },
};

export default DashboardService;
