// src/services/adminService.js
import axios from "axios";

// Base URL - Update this to match your Flask backend URL
const BASE_URL = import.meta.env.VITE_BACKEND_FLASK_URL + "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout for admin operations
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get scraping status from admin panel
 * @returns {Promise<Object>} Current scraping status and timestamps
 *
 * Usage:
 * const status = await adminService.getScrapingStatus();
 * console.log(status.data.last_scrape_times);
 */
export const getScrapingStatus = async () => {
  try {
    const response = await api.get("/agribot/admin/status");
    return {
      success: true,
      data: response.data.data || response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch scraping status: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Trigger weather data scraping
 * @param {Array} locations - Optional custom locations array
 * @returns {Promise<Object>} Scraping results
 *
 * Usage:
 * // With default locations
 * await adminService.scrapeWeather();
 *
 * // With custom locations
 * await adminService.scrapeWeather([
 *   { state: "Haryana", lat: 29.0588, lon: 76.0856 }
 * ]);
 */
export const scrapeWeather = async (locations = null) => {
  try {
    const payload = locations ? { locations } : {};
    const response = await api.post("/agribot/admin/scrape/weather", payload);
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Weather scraping failed: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Trigger news data scraping
 * @returns {Promise<Object>} News scraping results
 */
export const scrapeNews = async () => {
  try {
    const response = await api.post("/agribot/admin/scrape/news");
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "News scraping failed: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Trigger bulletin scraping for specific states
 * @param {Array} states - Array of state names
 * @returns {Promise<Object>} Bulletin scraping results
 *
 * Usage:
 * await adminService.scrapeBulletins(['Haryana', 'Punjab']);
 */
export const scrapeBulletins = async (
  states = ["Haryana", "Delhi", "Uttar Pradesh"]
) => {
  try {
    const response = await api.post("/agribot/admin/scrape/bulletins", {
      states,
    });
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Bulletin scraping failed: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Trigger disease information update
 * @returns {Promise<Object>} Disease data scraping results
 */
export const scrapeDiseases = async () => {
  try {
    const response = await api.post("/agribot/admin/scrape/diseases");
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Disease info scraping failed: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Trigger complete scraping cycle (all data types)
 * @returns {Promise<Object>} Complete scraping results
 *
 * Usage:
 * const results = await adminService.scrapeAll();
 * console.log(results.data.results);
 */
export const scrapeAll = async () => {
  try {
    const response = await api.post("/agribot/admin/scrape/all");
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Complete scraping failed: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check overall system health
 * @returns {Promise<Object>} System health information
 */
export const checkSystemHealth = async () => {
  try {
    const response = await api.get("/agribot/health");
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Health check failed: " + error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// src/services/adminService.js - Add these functions

/**
 * Upload PDF file to specific Pinecone index
 * @param {File} file - PDF file to upload
 * @param {string} indexType - Target Pinecone index
 * @returns {Promise<Object>} Upload results
 *
 * Usage:
 * const file = document.getElementById('pdf-upload').files[0];
 * const result = await adminService.uploadPdf(file, 'diseases');
 */
export const uploadPdf = async (file, indexType) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('index_type', indexType);

    const response = await api.post('/agribot/admin/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for large PDFs
    });

    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: 'PDF upload failed: ' + (error.response?.data?.message || error.message),
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get list of uploaded PDF files
 * @returns {Promise<Object>} List of uploaded files with metadata
 *
 * Usage:
 * const files = await adminService.getUploadedFiles();
 * console.log(files.data.files);
 */
export const getUploadedFiles = async () => {
  try {
    const response = await api.get('/agribot/admin/uploaded-files');
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch uploaded files: ' + error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Delete an uploaded PDF file
 * @param {string} filename - Name of file to delete
 * @param {string} indexType - Index type of the file
 * @returns {Promise<Object>} Delete result
 *
 * Usage:
 * await adminService.deleteUploadedFile('document.pdf', 'diseases');
 */
export const deleteUploadedFile = async (filename, indexType) => {
  try {
    const response = await api.delete('/agribot/admin/delete-uploaded-file', {
      data: { filename, index_type: indexType }
    });
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: 'File deletion failed: ' + (error.response?.data?.message || error.message),
      timestamp: new Date().toISOString()
    };
  }
};

// src/services/adminService.js - Add these new functions

/**
 * Get system analytics and usage statistics
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalytics = async () => {
  try {
    // This would typically call your backend analytics endpoint
    // For now, returning mock data
    return {
      success: true,
      data: {
        totalQueries: 1250,
        activeUsers: 47,
        documentsIndexed: 389,
        systemUptime: '99.8%',
        queryDistribution: {
          weather: 35,
          diseases: 25,
          news: 20,
          general: 15,
          bulletins: 5
        },
        responseTimes: {
          average: 1.2,
          fastest: 0.8,
          slowest: 3.5
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch analytics: ' + error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get system performance metrics
 * @returns {Promise<Object>} Performance data
 */
export const getPerformanceMetrics = async () => {
  try {
    // Mock performance data - integrate with your monitoring system
    return {
      success: true,
      data: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 78,
        networkLatency: 120,
        activeConnections: 23
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch performance metrics: ' + error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
    getAnalytics,
  getPerformanceMetrics,
  uploadPdf,
  getUploadedFiles,
  deleteUploadedFile,
  getScrapingStatus,
  scrapeWeather,
  scrapeNews,
  scrapeBulletins,
  scrapeDiseases,
  scrapeAll,
  checkSystemHealth,
};
