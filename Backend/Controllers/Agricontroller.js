const Farm = require("../Models/farmmodel");
const UserSummary = require("../Models/usersummarymodel");
const DiseaseReport = require("../Models/DiseaseReportsmodel");
const FarmStats = require("../Models/farmstatmodel");

// Get farm data by user ID
exports.getFarmByUserId = async (req, res) => {
  try {
    const farm = await Farm.findOne({ user_id: req.params.userId });
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    res.json(farm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user summary by user ID
// Get user summary by user ID
exports.getUserSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }
   // console.log(`Fetching summary for userId: ${userId}`);
    const summary = await UserSummary.findOne({ user_id: userId });
    // console.log(`Summary found: ${summary ? true : false}`);
    if (!summary) {
      return res.status(404).json({ message: "User summary not found" });
    }

    res.status(200).json(summary);
  } catch (err) {
    console.error("Error fetching user summary:", err);
    res.status(500).json({ message: "Server error while fetching summary" });
  }
};


// Get disease reports for a farm
exports.getDiseaseReports = async (req, res) => {
  try {
    const reports = await DiseaseReport.find({ farm_id: req.params.farmId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get farm statistics
exports.getFarmStats = async (req, res) => {
  try {
    const stats = await FarmStats.find({ farm_id: req.params.farmId })
      .sort({ date: -1 })
      .limit(30);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all farms (for nearby farms calculation)
// controllers/farmController.js

exports.getAllFarms = async (req, res) => {
  try {
    const farms = await Farm.find({}).lean(); // .lean() returns plain JS objects for performance

    const enrichedFarms = farms.map((farm) => ({
      ...farm,
      nearby_farms_count: farm.nearby_farms?.length || 0,
      has_polygon: !!farm.agro_polygon,
      last_trained_at: farm.last_trained_at || null,
      created_at: farm.createdAt || farm._id.getTimestamp(), // fallback if no timestamp field
    }));

    res.status(200).json({
      total: enrichedFarms.length,
      farms: enrichedFarms,
    });
  } catch (err) {
    console.error("Error fetching all farms:", err);
    res.status(500).json({ message: "Failed to fetch farms", error: err.message });
  }
};
