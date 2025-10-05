// AdminService.js
import AgrimarketService from "./AgrimarketService";

export class AdminService {
  // Dashboard Metrics
  static async getDashboardMetrics() {
    try {
      const response = await AgrimarketService.AdminService.getMetrics();
      return response.data || response;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }

  // Enhanced Product Management
  static async getPendingProducts(page = 1, limit = 20) {
    try {
      const response = await AgrimarketService.AdminService.listPendingProducts(
        page,
        limit
      );
      return {
        data: response.data || response.products || [],
        pagination: response.pagination || {
          page,
          limit,
          total: response.total || 0,
          totalPages: Math.ceil((response.total || 0) / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching pending products:", error);
      throw error;
    }
  }

  static async approveProduct(productId) {
    try {
      const response = await AgrimarketService.AdminService.approveProduct(
        productId
      );
      return response.data || response;
    } catch (error) {
      console.error("Error approving product:", error);
      throw error;
    }
  }

  static async rejectProduct(productId, reason) {
    try {
      const response = await AgrimarketService.AdminService.rejectProduct(
        productId,
        reason
      );
      return response.data || response;
    } catch (error) {
      console.error("Error rejecting product:", error);
      throw error;
    }
  }

  // Bulk product operations
  static async bulkApproveProducts(productIds) {
    try {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new Error("Product IDs array is required");
      }

      const response = await AgrimarketService.AdminService.bulkApproveProducts(
        productIds
      );
      return response;
    } catch (error) {
      console.error("Error bulk approving products:", error);
      throw error;
    }
  }

  static async bulkRejectProducts(productIds, reason) {
    try {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new Error("Product IDs array is required");
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error("Rejection reason is required");
      }

      const response = await AgrimarketService.AdminService.bulkRejectProducts(
        productIds,
        reason
      );
      return response;
    } catch (error) {
      console.error("Error bulk rejecting products:", error);
      throw error;
    }
  }

  static async getProductStats() {
    try {
      const response = await AgrimarketService.AdminService.getProductStats();
      return response.data || response;
    } catch (error) {
      console.error("Error fetching product stats:", error);
      throw error;
    }
  }

  // Listing Management
  static async getPendingListings(page = 1, limit = 20) {
    try {
      const response = await AgrimarketService.AdminService.listPendingListings(
        page,
        limit
      );
      return {
        data: response.data || response.listings || [],
        pagination: response.pagination || {
          page,
          limit,
          total: response.total || 0,
          totalPages: Math.ceil((response.total || 0) / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching pending listings:", error);
      throw error;
    }
  }

  static async approveListing(listingId) {
    try {
      const response = await AgrimarketService.AdminService.approveListing(
        listingId
      );
      return response.data || response;
    } catch (error) {
      console.error("Error approving listing:", error);
      throw error;
    }
  }

  static async rejectListing(listingId, reason) {
    try {
      const response = await AgrimarketService.AdminService.rejectListing(
        listingId,
        reason
      );
      return response.data || response;
    } catch (error) {
      console.error("Error rejecting listing:", error);
      throw error;
    }
  }

  // User Management
  static async getPendingKYC() {
    try {
      const response = await AgrimarketService.AdminService.listKycPending();
      return {
        data: response.data || response.users || [],
        count: response.count || (response.data ? response.data.length : 0),
      };
    } catch (error) {
      console.error("Error fetching pending KYC:", error);
      throw error;
    }
  }

  static async verifyKYC(userId) {
    try {
      const response = await AgrimarketService.AdminService.verifyKyc(userId);
      return response.data || response;
    } catch (error) {
      console.error("Error verifying KYC:", error);
      throw error;
    }
  }

  static async updateUserRole(userId, newRole) {
    try {
      const response = await AgrimarketService.AdminService.updateUserRole(
        userId,
        newRole
      );
      return response.data || response;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Analytics and Reports
  static async generateSalesReport(startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }

      const response = await AgrimarketService.AdminService.generateSalesReport(
        startDate,
        endDate
      );
      return response.data || response;
    } catch (error) {
      console.error("Error generating sales report:", error);
      throw error;
    }
  }

  static async getUserAnalytics() {
    try {
      const response = await AgrimarketService.AdminService.getUserAnalytics();
      return response.data || response;
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw error;
    }
  }

  static async getPlatformAnalytics(period = "monthly") {
    try {
      const response =
        await AgrimarketService.AdminService.getPlatformAnalytics(period);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching platform analytics:", error);
      throw error;
    }
  }

  // System Management
  static async getSystemHealth() {
    try {
      const response = await AgrimarketService.AdminService.getSystemHealth();
      return response.data || response;
    } catch (error) {
      console.error("Error fetching system health:", error);
      throw error;
    }
  }

  static async clearCache(cacheType = "all") {
    try {
      const response = await AgrimarketService.AdminService.clearCache(
        cacheType
      );
      return response.data || response;
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  }

  // Utility methods for admin
  static async exportData(type, filters = {}) {
    try {
      // This would call a backend endpoint for data export
      const queryParams = new URLSearchParams({ type, ...filters }).toString();
      const response = await fetch(
        `${AgrimarketService.BASE_URL}/admin/export?${queryParams}`,
        {
          headers: AgrimarketService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }

  static async sendBulkNotification(notificationData) {
    try {
      const response = await fetch(
        `${AgrimarketService.BASE_URL}/admin/notifications/bulk`,
        {
          method: "POST",
          headers: AgrimarketService.getHeaders(),
          body: JSON.stringify(notificationData),
        }
      );

      if (!response.ok) {
        throw new Error(`Notification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending bulk notification:", error);
      throw error;
    }
  }
}

export default AdminService;
