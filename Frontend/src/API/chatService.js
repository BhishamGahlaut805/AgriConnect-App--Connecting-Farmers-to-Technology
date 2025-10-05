// src/services/chatService.js
import axios from "axios";

// Base URL - Update this to match your Flask backend URL
const BASE_URL = import.meta.env.VITE_BACKEND_FLASK_URL + "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout for agricultural queries
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

/**
 * Send a message to the AgriConnect chatbot
 * @param {string} message - The user's agricultural query
 * @returns {Promise<Object>} Response from the chatbot
 *
 * Usage:
 * try {
 *   const response = await chatService.sendMessage("What is late blight of potato?");
 *   console.log(response.data);
 * } catch (error) {
 *   console.error('Chat error:', error);
 * }
 */
export const sendMessage = async (message) => {
  try {
    // Using form data as per your Flask endpoint
    const formData = new URLSearchParams();
    formData.append("msg", message);

    const response = await api.post("/agribot/chat", formData);

    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Chat service error:", error);

    // Enhanced error handling for agricultural context
    let errorMessage = "Failed to get agricultural advice. ";

    if (error.code === "NETWORK_ERROR") {
      errorMessage += "Please check your internet connection.";
    } else if (error.response?.status === 503) {
      errorMessage +=
        "Agricultural service is updating. Please try again shortly.";
    } else if (error.response?.status === 500) {
      errorMessage +=
        "Technical difficulties. Our farming experts are working on it.";
    } else {
      errorMessage += "Please try again or contact agricultural support.";
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check health status of the AgriConnect service
 * @returns {Promise<Object>} Health status information
 *
 * Usage:
 * const health = await chatService.checkHealth();
 * if (health.status === 'healthy') {
 *   // Service is ready
 * }
 */
export const checkHealth = async () => {
  try {
    const response = await api.get("/Agribot/health");
    return {
      success: true,
      status: response.data.status,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      status: "unavailable",
      error: error.message,
    };
  }
};

export default {
  sendMessage,
  checkHealth,
};
