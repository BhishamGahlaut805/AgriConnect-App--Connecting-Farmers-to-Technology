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
// Routes
// const categoryRoutes = require("./Routes/CategoryRoutes");
// const productRoutes = require("./Routes/ProductRoutes");
// const listingRoutes = require("./Routes/ListingRoutes");
// const inventoryRoutes = require("./Routes/InventoryRoutes");
// const cartRoutes = require("./Routes/CartRoutes");
// const orderRoutes = require("./Routes/OrderRoutes");
// const reviewRoutes = require("./Routes/ReviewRoutes");
// const paymentRoutes = require("./Routes/PaymentRoutes");

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
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/api", agriRoutes);
app.use("/api/reports", cropReportRoutes);
app.use("/api/translate", translateRoute);
app.use("/api/v1", yieldRoutes);
app.use("/api/auth", authRoutes);
app.use("/Agrimarket/v1/api", Agrimarketroutes);


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
