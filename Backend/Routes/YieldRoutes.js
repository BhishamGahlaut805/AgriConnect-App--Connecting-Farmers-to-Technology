const express = require("express");
const router = express.Router();

const WhatIfSimulation = require("../Models/WhatifSimulations");
const YieldPrediction = require("../Models/YieldPredictions");
const stateYield= require("../Models/StateYield");
const { fetchMarketPrices,fetchHistoricalPrices } = require("../Controllers/MarketPriceController");

//Get all What-If Simulations
router.get("/what-if-simulations", async (req, res) => {
  try {
    const simulations = await WhatIfSimulation.find().sort({ created_at: -1 });
    res.json(simulations);
  } catch (error) {
    console.error("Error fetching What-If simulations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all Yield Predictions
router.get("/yield-predictions", async (req, res) => {
  try {
    const predictions = await YieldPrediction.find().sort({ timestamp: -1 });
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching Yield predictions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET /api/predictions/:state
// GET /api/predictions/yield/:state
router.get("/yield/:state", async (req, res) => {
  try {
    const stateParam = req.params.state;

    console.log(`Fetching predictions for state: ${stateParam}`);

    // Case-insensitive search using RegExp
    const predictions = await stateYield.find({
      state: { $regex: new RegExp(`^${stateParam}$`, 'i') }
    });

    if (!predictions || predictions.length === 0) {
      return res
        .status(404)
        .json({ message: `No records found for state: ${stateParam}` });
    }

    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// GET /api/market-prices
router.get("/MarketPrices", fetchMarketPrices);
router.get("/MarketPrices/historical", fetchHistoricalPrices);

module.exports = router;
