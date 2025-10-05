import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies
});

// Add request interceptor to include token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (token expired, invalid, etc.)
      localStorage.removeItem("token");
      window.location.href = "/auth/v1/app?session_expired=true";
    }
    return Promise.reject(error);
  }
);

// Auth Service
const authService = {
  // Register User
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      if (response.data.user) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  },

  // Login User
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      if (response.data.user) {
        localStorage.setItem("token", response.data.token);
      }
      // console.log("Login successful:", response.data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  },

  // Logout User
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("LoginToken");
      localStorage.removeItem("UserDetails");

      return { message: "Logged out successfully." };
    } catch (error) {
      localStorage.removeItem("token");
       localStorage.removeItem("LoginToken");
       localStorage.removeItem("UserDetails");
      throw new Error(
        error.response?.data?.message || "Logout failed. Please try again."
      );
    }
  },

  // Forgot Password
  forgotPassword: async (contact) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", {
        contact,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Password reset request failed. Please try again."
      );
    }
  },

  // Reset Password
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    }
  },

  // Google Login
  googleLogin: async (googleToken) => {
    try {
      const response = await apiClient.post("/auth/google-login", {
        token: googleToken,
      });
      if (response.data.user) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Google login failed. Please try again."
      );
    }
  },

  // Get Current User
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data.user;
    } catch (error) {
      // If 401, the token is invalid/expired - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login?session_expired=true";
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch user data."
      );
    }
  },

initGoogleAuth: (onSuccess, onFailure) => {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;

  script.onload = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response.credential) {
            try {
              const result = await authService.googleLogin(response.credential);
              onSuccess(result);
            } catch (error) {
              onFailure(error);
            }
          } else {
            onFailure(new Error("Google sign-in failed: No credentials."));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      //  Render colorful Google button
      window.google.accounts.id.renderButton(document.getElementById("googleBtn"), {
        theme: "filled_blue", // "filled_black", "outline"
        size: "large",
        width: 280,
        shape: "pill",
        type: "standard",
        text: "signin_with",
        logo_alignment: "left",
      });

      // Optional One Tap Prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.warn("One Tap not shown:", notification.getNotDisplayedReason());
        }
      });

      // Timeout for extra safety
      setTimeout(() => {
        if (!document.getElementById("googleBtn")?.firstChild) {
          onFailure(new Error("Google Sign-In failed to load. Please try again."));
        }
      }, 7000);
    } else {
      onFailure(new Error("Google API not available"));
    }
  };

  script.onerror = () => {
    onFailure(new Error("Failed to load Google API script"));
  };

  document.body.appendChild(script);
},
};

export default authService;
