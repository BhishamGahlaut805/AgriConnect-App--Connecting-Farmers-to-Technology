import { io } from "socket.io-client";
class CropWeedService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_FLASK_URL;
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  // Initialize socket connection with robust error handling
  initSocket() {
    try {
      if (this.socket && this.socket.connected) {
        return this.socket;
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(`${this.baseURL}/weed`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to weed detection server");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from weed detection server:", reason);
        this.isConnected = false;

        if (reason === "io server disconnect") {
          // Server initiated disconnect, don't reconnect
          this.socket = null;
        }
      });

      this.socket.on("reconnect_attempt", (attempt) => {
        this.reconnectAttempts = attempt;
        console.log(
          `🔄 Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`
        );
      });

      this.socket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed after maximum attempts");
        this.socket = null;
        this.isConnected = false;
      });

      this.socket.on("error", (error) => {
        console.error("⚠️ Socket error:", error);
      });

      return this.socket;
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      throw new Error("Socket connection failed");
    }
  }

  // Upload image with improved error handling and progress tracking
  async uploadImage(file, onProgress = null) {
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        throw new Error(
          "Invalid image file type. Supported: JPG, PNG, BMP, GIF"
        );
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `Image file too large (max ${this.formatFileSize(maxSize)})`
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.baseURL}/upload_image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // CropWeedService.js
  async uploadVideo(file) {
    try {
      if (!this.isValidVideoFile(file)) {
        throw new Error(
          "Invalid video file type. Supported: MP4, AVI, MOV, MKV, WEBM"
        );
      }

      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `Video file too large (max ${this.formatFileSize(maxSize)})`
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.baseURL}/upload_video`, {
        method: "POST",
        body: formData,
        // credentials: "include", // 🔑 include cookies for Flask session
      });

      console.log("Video upload response:", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  }

  // Start webcam stream with timeout
  async startWebcam() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseURL}/start_webcam`, {
        method: "POST",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webcam start failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error starting webcam:", error);
      throw new Error(
        error.name === "AbortError" ? "Webcam start timeout" : error.message
      );
    }
  }

  // Stop webcam stream
  async stopWebcam() {
    try {
      const response = await fetch(`${this.baseURL}/stop_webcam`, {
        method: "POST",
      });

      if (!response.ok) {
        console.warn("Webcam stop response not OK:", response.statusText);
      }
      return await response.json();
    } catch (error) {
      console.error("Error stopping webcam:", error);
      // Don't throw error for stop operations
      return { success: false, message: error.message };
    }
  }

  // Start video playback
  async startVideo(videoId) {
    const res = await fetch(`${this.baseURL}/start_video`, {
      method: "POST",
      // credentials: "include", // 🔑
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename:videoId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to start video");
    }
    return data;
  }

  // Stop video playback
  async stopVideo() {
    try {
      const response = await fetch(`${this.baseURL}/stop_video`, {
        method: "POST",
      });

      if (!response.ok) {
        console.warn("Video stop response not OK:", response.statusText);
      }
      return await response.json();
    } catch (error) {
      console.error("Error stopping video:", error);
      return { success: false, message: error.message };
    }
  }

  // Start live stream with comprehensive error handling
  // Start live stream with comprehensive error handling
  startLiveStream(onFrame, onError, streamType = "webcam") {
    try {
      const socket = this.initSocket();

      if (!socket) {
        throw new Error("Socket connection not available");
      }

      // Remove existing listeners to avoid duplicates
      socket.off("frame");
      socket.off("error");
      socket.off("connect_error");

      // Listen for frame events
      socket.on("frame", (data) => {
        try {
          if (onFrame) onFrame(data);
        } catch (frameError) {
          console.error("Error processing frame:", frameError);
        }
      });

      // Listen for error events
      socket.on("error", (error) => {
        console.error("Stream error:", error);
        if (onError) onError(new Error(error.message || "Stream error"));
      });

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        if (onError) onError(new Error("Connection failed: " + error.message));
      });

      // Handle disconnections
      socket.on("disconnect", (reason) => {
        console.log("Stream disconnected:", reason);
        if (reason === "io server disconnect") {
          if (onError) onError(new Error("Server disconnected the stream"));
        }
      });

      // Start the stream with timeout
      const startTimeout = setTimeout(() => {
        if (!this.isConnected) {
          if (onError) onError(new Error("Stream start timeout"));
        }
      }, 5000);

      socket.once("connect", () => {
        clearTimeout(startTimeout);
        // 👇 Fix: Send correct type (webcam or video)
        socket.emit("start_stream", { type: streamType });
      });

      return true;
    } catch (error) {
      console.error("Error starting live stream:", error);
      if (onError) onError(error);
      return false;
    }
  }

  // Stop live stream gracefully
  stopLiveStream() {
    try {
      if (this.socket) {
        this.socket.emit("stop_stream");
        this.socket.disconnect();
        this.socket = null;
      }
      this.isConnected = false;
    } catch (error) {
      console.error("Error stopping live stream:", error);
    }
  }

  // Utility function to check if file is a valid image
  isValidImageFile(file) {
    const allowedExtensions = ["jpg", "jpeg", "png", "bmp", "gif", "webp"];
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Utility function to check if file is a valid video
  isValidVideoFile(file) {
    const allowedExtensions = ["mp4", "avi", "mov", "mkv", "webm", "m4v"];
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Utility function to format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Format detection results for display with validation
  formatDetectionResults(results) {
    console.log("Raw detection results:", results);
    if (!results || !results.success) {
      throw new Error(results?.error || "Invalid response from server");
    }
    const backendURL = import.meta.env.VITE_BACKEND_FLASK_URL;
    const formatted = {
      imageUrl: backendURL + results.image_url,
      annotatedImage: backendURL + results.results?.annotated_image,
      counts: results.results?.counts || { Soil: 0, Weed: 0, Cotton: 0 },
      confidences: results.results?.confidences || {
        Soil: 0,
        Weed: 0,
        Cotton: 0,
      },
      detections: results.results?.detections || [],
      graphs: results.graphs || null,
    };

    // Validate counts
    Object.keys(formatted.counts).forEach((key) => {
      formatted.counts[key] = parseInt(formatted.counts[key]) || 0;
    });

    // Validate confidences
    Object.keys(formatted.confidences).forEach((key) => {
      formatted.confidences[key] = parseFloat(formatted.confidences[key]) || 0;
    });

    return formatted;
  }

  // Health check for backend
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: "GET",
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.warn("Health check failed:", error);
      return false;
    }
  }
}

// Create and export a singleton instance
const cropWeedService = new CropWeedService();
export default cropWeedService;
