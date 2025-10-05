module.exports = (err, req, res, next) => {
  console.error("ERROR", err);
  if (res.headersSent) return next(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
