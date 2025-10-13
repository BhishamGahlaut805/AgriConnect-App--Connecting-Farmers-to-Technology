const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes");
const agriRoutes = require("./Routes/AgriRoutes");
const cropReportRoutes = require("./Routes/CropReportRoutes");
const translateRoute= require("./Routes/Translate");
const yieldRoutes = require("./Routes/YieldRoutes");
const Agrimarketroutes = require("./Routes/AgrimarketRoutes");
dotenv.config({ path: true, quiet:true}); // Load environment variables
const { publicLimiter } = require("./Middlewares/rateLimiters");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");


// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Serve static files from uploads directory
app.use('/Uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" })); // default is 100kb
// Increase limit for URL-encoded form data
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://j2rgc684-5173.inc1.devtunnels.ms",
    ],
    credentials: true,
  })
);

app.use("/dataset-images", express.static("C:/Users/bhish/Downloads"));

// Apply rate limiting to all requests
app.use(publicLimiter);


// Routes
app.use("/auth", authRoutes);
app.use("/api", agriRoutes);
app.use("/api/reports", cropReportRoutes);
app.use("/api/translate", translateRoute);
app.use("/api/v1", yieldRoutes);
app.use("/api/auth", authRoutes);
app.use("/Agrimarket/v1/api", Agrimarketroutes);
app.use("/cropMonitor", require("./Routes/CropMonitoringRoutes"));

// Initialize Firebase Admin (for sending notifications)
const serviceAccount = require('./Firebase/serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// In-memory storage (replace with database in production)
const userTokens = new Map(); // userId -> deviceToken
const notifications = new Map(); // userId -> notification[]

// 1. Register Device Token Endpoint
app.post('/api/users/register-device-token', async (req, res) => {
  try {
    const { userId, deviceToken } = req.body;

    // Validate input
    if (!userId || !deviceToken) {
      return res.status(400).json({
        success: false,
        message: 'User ID and device token are required'
      });
    }

    // Store token in memory (in production, save to database)
    userTokens.set(userId, deviceToken);

    console.log(`Device token registered for user: ${userId}`);

    res.json({
      success: true,
      message: 'Device token registered successfully',
      data: { userId, tokenRegistered: true }
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 2. Get Latest Notifications Endpoint
app.get('/api/notifications/latest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's notifications from storage
    const userNotifications = notifications.get(userId) || [];

    // Sort by timestamp (newest first) and return latest 20
    const latestNotifications = userNotifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    // console.log(`📨 Returning ${latestNotifications.length} notifications for user: ${userId}`);

    res.json(latestNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// 3. Send Test Notification Endpoint
app.post('/api/notifications/test', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's device token
    const deviceToken = userTokens.get(userId);

    if (!deviceToken) {
      return res.status(404).json({
        success: false,
        message: 'Device token not found for user'
      });
    }

    // Create test notification
    const testNotification = {
      _id: `test-${Date.now()}`,
      title: "🧪 Test Notification",
      message: "This is a test notification from the backend server!",
      type: "info",
      timestamp: new Date().toISOString(),
      read: false,
      farmId: "test-farm",
      disease: "Test Disease",
      severity: "Low"
    };

    // Store notification
    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    notifications.get(userId).unshift(testNotification);

    // Send push notification via FCM
    const message = {
      notification: {
        title: "🧪 Test Notification",
        body: "This is a test notification from the backend server!"
      },
      data: {
        type: 'test',
        farmId: 'test-farm',
        disease: 'Test Disease',
        severity: 'Low',
        timestamp: new Date().toISOString()
      },
      token: deviceToken
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Test notification sent via FCM:', response);
    } catch (fcmError) {
      console.warn('FCM notification failed, but stored locally:', fcmError);
    }

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      notification: testNotification,
      fcmSent: true
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

// 4. Add Sample Notifications Endpoint (for demo)
app.post('/api/notifications/sample/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const sampleNotifications = [
      {
        _id: `sample-${Date.now()}-1`,
        title: "🌾 Crop Health Update",
        message: "Your wheat crops are 92% healthy. Good job!",
        type: "success",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
        read: false,
        farmId: "farm-123",
        disease: "Healthy",
        severity: "None"
      },
      {
        _id: `sample-${Date.now()}-2`,
        title: "⚠️ Disease Alert",
        message: "Medium risk of Leaf Rust detected in nearby farms",
        type: "warning",
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
        read: false,
        farmId: "farm-123",
        disease: "Leaf Rust",
        severity: "Medium"
      },
      {
        _id: `sample-${Date.now()}-3`,
        title: "📈 Yield Prediction",
        message: "Expected yield increase of 15% this season based on current conditions",
        type: "info",
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
        read: true,
        farmId: "farm-123",
        disease: "None",
        severity: "None"
      },
      {
        _id: `sample-${Date.now()}-4`,
        title: "💧 Irrigation Reminder",
        message: "Time to water the north field. Soil moisture is at 35%",
        type: "info",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: true,
        farmId: "farm-123",
        disease: "None",
        severity: "None"
      }
    ];

    // Store sample notifications
    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    notifications.get(userId).unshift(...sampleNotifications);

    res.json({
      success: true,
      message: 'Sample notifications added',
      count: sampleNotifications.length,
      notifications: sampleNotifications
    });

  } catch (error) {
    console.error('Error adding sample notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sample notifications',
      error: error.message
    });
  }
});

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Notification server is running',
    timestamp: new Date().toISOString(),
    stats: {
      usersWithTokens: userTokens.size,
      totalNotifications: Array.from(notifications.values()).flat().length
    }
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
