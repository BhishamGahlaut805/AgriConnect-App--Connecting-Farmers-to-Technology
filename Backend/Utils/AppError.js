// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);

    // Additional context for better debugging
    this.context = {};
  }

  // Method to add context to error
  addContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }

  // Static methods for common error types
  static badRequest(message = "Bad Request") {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource Not Found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Resource Conflict") {
    return new AppError(message, 409);
  }

  static validationError(message = "Validation Failed") {
    return new AppError(message, 422);
  }

  static internalError(message = "Internal Server Error") {
    return new AppError(message, 500);
  }

  static serviceUnavailable(message = "Service Temporarily Unavailable") {
    return new AppError(message, 503);
  }
}

// Enhanced error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = AppError.notFound(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} '${value}' already exists`;
    error = AppError.conflict(message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    error = AppError.validationError(message).addContext({ errors });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = AppError.unauthorized(message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = AppError.unauthorized(message);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  // Send response based on environment
  if (process.env.NODE_ENV === "production") {
    res.status(statusCode).json({
      success: false,
      status,
      message: error.isOperational ? error.message : "Something went wrong!",
      ...(error.context &&
        Object.keys(error.context).length > 0 && { context: error.context }),
    });
  } else {
    res.status(statusCode).json({
      success: false,
      status,
      message: error.message,
      stack: error.stack,
      error: error,
      ...(error.context &&
        Object.keys(error.context).length > 0 && { context: error.context }),
    });
  }
};

module.exports = {
  AppError,
  errorHandler,
};
