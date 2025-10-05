const express = require("express");
const router = express.Router();
const { CropDiseaseReports,getAllCropReports} = require("../Controllers/CropReportsController");

const bodyParser = require("body-parser");
const { cropReportUpload } = require("../Config/multer");

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Crop Disease Report endpoint with proper file handling
router.post(
  "/crop-report",
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("multipart/form-data")) {
      return cropReportUpload(req, res, (err) => {
        if (err) {
          // Handle multer errors specifically
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
              error: "Unexpected file field",
              details: `Field '${err.field}' is not expected`,
            });
          }
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              error: "File too large",
              details: "Maximum file size is 5MB",
            });
          }
          return res
            .status(400)
            .json({ error: "File upload error", details: err.message });
        }
        next();
      });
    }
    next();
  },
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  CropDiseaseReports
);

router.get("/all", async (req, res) => {
  try {
    const reports = await getAllCropReports();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching crop reports:", error);
    res.status(500).json({ error: "Failed to fetch crop reports" });
  }
});


// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Route error:", err);

  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

module.exports = router;
