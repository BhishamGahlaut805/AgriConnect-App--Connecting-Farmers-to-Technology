const mongoose = require("mongoose");

const WhatIfSimulationSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  simulation_type: String,
  status: String,
  full_response: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  results_summary: mongoose.Schema.Types.Mixed,
  system: {
    storage_timestamp: Date,
    data_version: String,
    collection: String,
  },
});

module.exports = mongoose.model(
  "WhatIfSimulation",
  WhatIfSimulationSchema,
  "WhatIfSimulations"
);
