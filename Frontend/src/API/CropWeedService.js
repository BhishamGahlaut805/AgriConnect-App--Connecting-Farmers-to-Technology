import { io } from "socket.io-client";

class CropWeedService {
  constructor() {
    // Ensure baseURL is properly set
    let envUrl = import.meta.env.VITE_BACKEND_FLASK_URL;

    // If no env URL, use default
    if (!envUrl) {
      envUrl = "http://localhost:5505";
    }

    // Remove trailing slash if present
    this.baseURL = envUrl.replace(/\/+$/, "");

    console.log("🔧 CropWeedService initialized with baseURL:", this.baseURL);

    // Also log the full URL for detection endpoint
    console.log("🔧 Detection endpoint:", `${this.baseURL}/api/weed/detect`);

    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.frameHandlers = [];
    this.errorHandlers = [];
    this.isWebcamStarted = false;
    this.isVideoStarted = false;
  }

  // Initialize socket connection
  initSocket() {
    try {
      if (this.socket && this.socket.connected) {
        return this.socket;
      }

      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      console.log("🔌 Connecting to WebSocket:", `${this.baseURL}/weed`);

      this.socket = io(`${this.baseURL}/weed`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to weed detection server");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from weed detection server:", reason);
        this.isConnected = false;
        if (reason === "io server disconnect") {
          this.socket = null;
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("⚠️ Connection error:", error.message);
        this.isConnected = false;
      });

      this.socket.on("reconnect_attempt", (attempt) => {
        this.reconnectAttempts = attempt;
        console.log(
          `🔄 Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`,
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

      // Frame events from backend
      this.socket.on("frame", (data) => {
        this.frameHandlers.forEach((handler) => {
          try {
            handler(data);
          } catch (e) {
            console.error("Frame handler error:", e);
          }
        });
      });

      this.socket.on("error", (data) => {
        this.errorHandlers.forEach((handler) => {
          try {
            handler(data);
          } catch (e) {
            console.error("Error handler error:", e);
          }
        });
      });

      return this.socket;
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      throw new Error("Socket connection failed");
    }
  }

  // Add frame event listener
  onFrame(handler) {
    if (typeof handler === "function") {
      this.frameHandlers.push(handler);
    }
  }

  // Remove frame event listener
  offFrame(handler) {
    this.frameHandlers = this.frameHandlers.filter((h) => h !== handler);
  }

  // Add error event listener
  onError(handler) {
    if (typeof handler === "function") {
      this.errorHandlers.push(handler);
    }
  }

  // Remove error event listener
  offError(handler) {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
  }

  // Upload image to /api/weed/detect
  // CropWeedService.js - Fix the uploadImage method with better error handling

  async uploadImage(file) {
    try {
      if (!this.isValidImageFile(file)) {
        throw new Error(
          "Invalid image file type. Supported: JPG, PNG, BMP, GIF, WEBP",
        );
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `Image file too large (max ${this.formatFileSize(maxSize)})`,
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      // Log the exact URL being called
      const url = `${this.baseURL}/api/weed/detect`;
      console.log("📤 Uploading image to:", url);
      console.log("📤 File being uploaded:", file.name, file.size, "bytes");

      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(url, {
          method: "POST",
          body: formData,
          // Remove credentials: "include" if causing issues
          credentials: "same-origin",
          signal: controller.signal,
          // Add CORS headers
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        console.log("📥 Response status:", response.status);
        console.log("📥 Response headers:", response.headers);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("📥 Error response:", errorData);
          throw new Error(
            errorData.error ||
              `Upload failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("📥 Image upload response:", data);

        if (data.success && data.results) {
          return {
            success: true,
            results: data.results,
            image_url: data.results.annotated_image || "",
            counts: data.results.counts || { Soil: 0, Weed: 0, Cotton: 0 },
            confidences: data.results.confidences || {
              Soil: 0,
              Weed: 0,
              Cotton: 0,
            },
            detections: data.results.detections || [],
            graphs: data.graphs || null,
          };
        }

        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error("❌ Fetch error details:", fetchError);
        if (fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out. Please check your connection and try again.",
          );
        }
        if (fetchError.message === "Failed to fetch") {
          throw new Error(
            `Cannot connect to backend at ${url}. Please ensure the backend server is running.`,
          );
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload video - Prepare for streaming via WebSocket
  // CropWeedService.js - Replace uploadVideo method
  // Upload video - Send file directly to backend for streaming
  async uploadVideo(file) {
    try {
      if (!this.isValidVideoFile(file)) {
        throw new Error(
          "Invalid video file type. Supported: MP4, AVI, MOV, MKV, WEBM, M4V",
        );
      }

      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `Video file too large (max ${this.formatFileSize(maxSize)})`,
        );
      }

      // Upload video file directly to backend
      const formData = new FormData();
      formData.append("file", file);

      console.log(
        "📤 Uploading video to:",
        `${this.baseURL}/api/weed/start_video`,
      );

      const response = await fetch(`${this.baseURL}/api/weed/start_video`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Video upload failed: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("📥 Video upload response:", data);

      if (data.success) {
        return {
          success: true,
          message: data.message || "Video uploaded and ready for streaming",
          videoId: data.video_path || file.name,
          streaming: false,
        };
      } else {
        throw new Error(data.message || "Failed to upload video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  }

  // Start webcam - Call the route directly
  async startWebcam() {
    try {
      // Check if already started
      if (this.isWebcamStarted) {
        console.log("Webcam already started");
        return {
          success: true,
          message: "Webcam already running",
          streaming: true,
        };
      }

      console.log(
        "📤 Starting webcam via:",
        `${this.baseURL}/api/weed/start_webcam`,
      );

      const response = await fetch(`${this.baseURL}/api/weed/start_webcam`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to start webcam: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("📥 Webcam start response:", data);

      if (data.success) {
        this.isWebcamStarted = true;
        // Initialize socket connection for receiving frames
        this.initSocket();
        return {
          success: true,
          message: data.message || "Webcam stream started",
          streaming: true,
        };
      } else {
        throw new Error(data.message || "Failed to start webcam");
      }
    } catch (error) {
      console.error("Error starting webcam:", error);
      throw new Error(error.message || "Webcam start failed");
    }
  }

  // Stop webcam - Call the route directly
  async stopWebcam() {
    try {
      if (!this.isWebcamStarted) {
        console.log("Webcam not running");
        return { success: false, message: "Webcam not running" };
      }

      console.log(
        "📤 Stopping webcam via:",
        `${this.baseURL}/api/weed/stop_webcam`,
      );

      const response = await fetch(`${this.baseURL}/api/weed/stop_webcam`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to stop webcam: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("📥 Webcam stop response:", data);

      this.isWebcamStarted = false;
      // Clean up socket
      this.disconnect();

      return {
        success: data.success || false,
        message: data.message || "Webcam stopped",
      };
    } catch (error) {
      console.error("Error stopping webcam:", error);
      this.isWebcamStarted = false;
      return { success: false, message: error.message };
    }
  }

  // Start video - Call the route directly
  // CropWeedService.js - Replace startVideo method
  // Start video - Send filename to backend (video already uploaded)
  async startVideo(videoId) {
    try {
      if (this.isVideoStarted) {
        console.log("Video already started");
        return {
          success: true,
          message: "Video already playing",
          streaming: true,
        };
      }

      if (!videoId) {
        throw new Error("No video ID provided");
      }

      console.log(
        "📤 Starting video via:",
        `${this.baseURL}/api/weed/start_video`,
      );

      // Send just the filename/path to start streaming
      const response = await fetch(`${this.baseURL}/api/weed/start_video`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: videoId,
          video_path: videoId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to start video: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("📥 Video start response:", data);

      if (data.success) {
        this.isVideoStarted = true;
        // Initialize socket connection for receiving frames
        this.initSocket();
        return {
          success: true,
          message: data.message || "Video stream started",
          videoId: videoId,
          streaming: true,
        };
      } else {
        throw new Error(data.message || "Failed to start video");
      }
    } catch (error) {
      console.error("Error starting video:", error);
      throw new Error(
        error.message || `Failed to start video: ${error.message}`,
      );
    }
  }

  // Stop video - Call the route directly
  async stopVideo() {
    try {
      if (!this.isVideoStarted) {
        console.log("Video not playing");
        return { success: false, message: "Video not playing" };
      }

      console.log(
        "📤 Stopping video via:",
        `${this.baseURL}/api/weed/stop_video`,
      );

      const response = await fetch(`${this.baseURL}/api/weed/stop_video`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to stop video: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("📥 Video stop response:", data);

      this.isVideoStarted = false;
      // Clean up socket
      this.disconnect();

      return {
        success: data.success || false,
        message: data.message || "Video stopped",
      };
    } catch (error) {
      console.error("Error stopping video:", error);
      this.isVideoStarted = false;
      return { success: false, message: error.message };
    }
  }

  // Start live stream with callbacks (uses WebSocket for frames)
  startLiveStream(onFrame, onError, streamType = "webcam") {
    try {
      const socket = this.initSocket();
      if (!socket) {
        if (onError) onError(new Error("Socket connection not available"));
        return false;
      }

      // Register handlers
      if (onFrame) this.onFrame(onFrame);
      if (onError) this.onError(onError);

      console.log(`🎥 Listening to ${streamType} stream`);
      return true;
    } catch (error) {
      console.error("Error starting live stream:", error);
      if (onError) onError(error);
      return false;
    }
  }

  // Stop live stream
  stopLiveStream() {
    try {
      this.disconnect();
      this.isWebcamStarted = false;
      this.isVideoStarted = false;
      console.log("🛑 Stream stopped");
      return { success: true, message: "Stream stopped" };
    } catch (error) {
      console.error("Error stopping live stream:", error);
      return { success: false, message: error.message };
    }
  }

  // Stop streaming (unified)
  async stopStreaming() {
    try {
      console.log(
        "📤 Stopping streaming via:",
        `${this.baseURL}/api/weed/stop_streaming`,
      );

      const response = await fetch(`${this.baseURL}/api/weed/stop_streaming`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Stop streaming response not OK:", errorData);
      }

      const data = await response.json().catch(() => ({}));
      console.log("📥 Stop streaming response:", data);

      this.isWebcamStarted = false;
      this.isVideoStarted = false;
      this.disconnect();

      return {
        success: data.success || true,
        message: data.message || "Streaming stopped",
      };
    } catch (error) {
      console.error("Error stopping streaming:", error);
      this.isWebcamStarted = false;
      this.isVideoStarted = false;
      this.disconnect();
      return { success: false, message: error.message };
    }
  }

  // Disconnect completely
  disconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.isConnected = false;
      this.frameHandlers = [];
      this.errorHandlers = [];
      console.log("🔌 Disconnected from weed detection server");
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }

  // Format detection results for display
  formatDetectionResults(results) {
    console.log("📊 Formatting detection results:", results);

    if (!results) {
      throw new Error("No results to format");
    }

    const backendURL =
      import.meta.env.VITE_BACKEND_FLASK_URL || "http://localhost:5505";

    // Handle weed detection results from /api/weed/detect
    if (results.success && results.results) {
      const result = results.results;
      return {
        imageUrl: backendURL + (result.annotated_image || ""),
        annotatedImage: backendURL + (result.annotated_image || ""),
        disease: results.disease || "Unknown",
        confidence: 0,
        counts: result.counts || { Soil: 0, Weed: 0, Cotton: 0 },
        confidences: result.confidences || { Soil: 0, Weed: 0, Cotton: 0 },
        detections: result.detections || [],
        graphs: results.graphs || null,
      };
    }

    // Handle disease prediction results
    if (results.status === "success" && results.results) {
      const formattedResults = {
        total_images: results.total_images || 0,
        diseased_images: results.diseased_images || 0,
        healthy_images: results.healthy_images || 0,
        timestamp: results.timestamp,
        results: results.results.map((result) => ({
          imageUrl: backendURL + (result.image_url || ""),
          disease: result.disease || "Unknown",
          confidence: result.confidence || 0,
          counts: result.counts || { Soil: 0, Weed: 0, Cotton: 0 },
          detections: result.detections || [],
          latitude: result.latitude,
          longitude: result.longitude,
        })),
      };
      return formattedResults;
    }

    return results;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.warn("Health check failed:", error);
      return false;
    }
  }

  // Utility: Validate image file
  isValidImageFile(file) {
    const allowedExtensions = ["jpg", "jpeg", "png", "bmp", "gif", "webp"];
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Utility: Validate video file
  isValidVideoFile(file) {
    const allowedExtensions = ["mp4", "avi", "mov", "mkv", "webm", "m4v"];
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Utility: Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
      isWebcamStarted: this.isWebcamStarted,
      isVideoStarted: this.isVideoStarted,
    };
  }
}

// Create and export singleton instance
const cropWeedService = new CropWeedService();
export default cropWeedService;
