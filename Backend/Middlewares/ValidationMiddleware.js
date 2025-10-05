const { body, validationResult } = require("express-validator");
const validator = require("validator");

// Shared error handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// === Register Validation ===
const validateRegister = [
  body("name").notEmpty().withMessage("Name is required").trim().escape(),
  body("contact")
    .notEmpty()
    .withMessage("Contact is required")
    .custom((value) => {
      if (validator.isEmail(value)) return true;
      if (validator.isMobilePhone(value)) return true;
      return false;
    })
    .withMessage("Invalid contact (must be a valid email or phone number)"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidation,
];

// === Login Validation ===
const validateLogin = [
  body("contact")
    .notEmpty()
    .withMessage("Contact is required")
    .custom((value) => {
      if (validator.isEmail(value)) return true;
      if (validator.isMobilePhone(value)) return true;
      return false;
    })
    .withMessage("Invalid contact (must be email or phone number)"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

// === Forgot Password Validation ===
const validateForgotPassword = [
  body("contact")
    .notEmpty()
    .withMessage("Contact is required")
    .custom((value) => {
      if (validator.isEmail(value)) return true;
      if (validator.isMobilePhone(value)) return true;
      return false;
    })
    .withMessage("Invalid contact (must be email or phone number)"),
  handleValidation,
];

// === Reset Password Validation ===
const validateResetPassword = [
  body("new_password")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  body("confirm_new_password")
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage("Passwords do not match"),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
