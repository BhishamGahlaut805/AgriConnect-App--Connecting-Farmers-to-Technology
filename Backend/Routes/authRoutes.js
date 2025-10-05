const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../Middlewares/ValidationMiddleware");

// --------------------- AUTH ROUTES ----------------------

// @route    POST /auth/register
// @desc     Register a new user
router.post("/register", validateRegister, authController.register);

// @route    POST /auth/login
// @desc     Login user with credentials
router.post("/login", validateLogin, authController.login);

// @route    POST /auth/logout
// @desc     Logout user (token is cleared on frontend)
router.post("/logout", authController.logout);

// @route    POST /auth/forgot-password
// @desc     Send password reset token
router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);

// @route    POST /auth/reset-password/:token
// @desc     Reset password using token
router.post(
  "/reset-password/:token",
  validateResetPassword,
  authController.resetPassword
);

// @route    POST /auth/google-login
// @desc     Login/Register using Google OAuth2
router.post("/google-login", authController.googleLogin);

module.exports = router;
