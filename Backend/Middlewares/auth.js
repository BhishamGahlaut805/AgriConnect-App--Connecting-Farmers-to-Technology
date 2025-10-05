// Middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const config = require("../Config/config"); // Must match login JWT secret

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header or cookie
        const token =
          req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;
        // console.log("Authorization header:", req.header("Authorization"));
        // console.log("Token extracted:", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    console.log("Token received:", token);

    // Verify token with same secret as login
    const decoded = jwt.verify(token, config.JWT_SECRET);
    // console.log("Decoded JWT payload:", decoded);

    // Find user by userId in payload
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token invalid",
      });
    }

    // Attach user info to request
    req.user = user;
    req.userId = user._id;

    // console.log("User ID from auth middleware:", req.userId);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// Role-based protection middleware
const protect = (roles = []) => {
  return (req, res, next) => {
    try {
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      // Optional: restrict access to own resources
      if (req.params.userId && req.params.userId !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources.",
        });
      }

      next();
    } catch (error) {
      console.error("Protect middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Server error in authorization",
      });
    }
  };
};

module.exports = { auth, protect };
