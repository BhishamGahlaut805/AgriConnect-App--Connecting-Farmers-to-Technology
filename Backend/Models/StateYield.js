const mongoose = require("mongoose");

const WeatherDataSchema = new mongoose.Schema(
  {
    avg_temperature: Number,
    avg_humidity: Number,
    avg_precipitation: Number,
  },
  { _id: false }
);

const Last5YearsSchema = new mongoose.Schema(
  {
    year: Number,
    area_lakh_ha: Number,
    production_lakh_tonnes: Number,
    yield_kg_per_ha: Number,
    weather_data: WeatherDataSchema,
  },
  { _id: false }
);

const ModelPerformanceSchema = new mongoose.Schema(
  {
    train_samples: Number,
    test_samples: Number,
    last_loss: Number,
    last_val_loss: Number,
  },
  { _id: false }
);

const PredictionSchema = new mongoose.Schema(
  {
    year: Number,
    predicted_yield: Number,
    confidence_interval: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

// New Schema for top_weather_factors
const TopWeatherFactorsSchema = new mongoose.Schema(
  {
    type: Map,
    of: Number,
  },
  { _id: false }
);

const YieldPredictionSchema = new mongoose.Schema({
  version: String,
  season: String,
  crop: String,
  state: String,
  features_used: [String],
  last_5_years: [Last5YearsSchema],
  model_path: String,
  model_performance: ModelPerformanceSchema,
  model_type: String,
  prediction: PredictionSchema,
  top_weather_factors: TopWeatherFactorsSchema, // ← Added here
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "StateYieldAll",
  YieldPredictionSchema,
  "StateYieldAll"
);
