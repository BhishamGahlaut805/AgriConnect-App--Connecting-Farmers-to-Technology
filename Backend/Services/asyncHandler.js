// utils/asyncHandler.js
/**
 * Async handler to wrap async route handlers and middleware
 * Eliminates the need for try-catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Advanced async handler with options
 */
const createAsyncHandler = (options = {}) => {
  const {
    enableLogging = false,
    customErrorHandler = null,
    timeout = 30000, // 30 seconds default timeout
  } = options;

  return (fn) => async (req, res, next) => {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timeout"));
      }, timeout);
    });

    try {
      // Race between the function and timeout
      await Promise.race([Promise.resolve(fn(req, res, next)), timeoutPromise]);
    } catch (error) {
      if (enableLogging) {
        console.error("Async handler error:", {
          error: error.message,
          stack: error.stack,
          url: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString(),
        });
      }

      if (customErrorHandler) {
        customErrorHandler(error, req, res, next);
      } else {
        next(error);
      }
    }
  };
};

module.exports = {
  asyncHandler,
  createAsyncHandler,
};
