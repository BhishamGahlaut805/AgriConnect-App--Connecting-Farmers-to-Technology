// utils/jwt.js
const jwt = require("jsonwebtoken");
const config = require("../Config/config"); // Must have JWT_SECRET

const jwtUtils = {
  // Generate JWT token
  generateToken: ({ userId, role, contact }) => {
    return jwt.sign(
      { userId, role, contact },
      config.JWT_SECRET,
      { expiresIn: "1d" } // 1 day expiry
    );
  },

  // Verify JWT token
  verifyToken: (token) => {
    // console.log("Verifying token:", token);
    try {
     const decodingtoken=jwt.verify(token, config.JWT_SECRET);
    //  console.log("Decoded token:", decodingtoken);
     return decodingtoken;
    } catch (err) {
      return null;
    }
  },

  // Middleware to authenticate user from header or cookie
  authenticate: (req, res, next) => {
    try {
      const token =
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwtUtils.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = decoded; // contains userId, role, contact
      req.userId = decoded.userId;

      next();
    } catch (err) {
      console.error("JWT Authenticate error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Middleware to authorize based on roles
  authorize: (roles = []) => {
    return (req, res, next) => {
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  },
};

module.exports = jwtUtils;
