const express = require("express");
const router = express.Router();
const agriController = require("../Controllers/Agricontroller");

// Farm routes
router.get("/farms/:userId", agriController.getFarmByUserId);
router.get("/farms", agriController.getAllFarms);

// User summary routes
router.get("/user-summary/:userId", agriController.getUserSummary);

// Disease report routes
router.get("/disease-reports/:farmId", agriController.getDiseaseReports);

// Farm statistics routes
router.get("/farm-stats/:farmId", agriController.getFarmStats);

module.exports = router;
