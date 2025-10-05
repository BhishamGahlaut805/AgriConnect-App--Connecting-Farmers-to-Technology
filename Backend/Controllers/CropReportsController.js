const CropReport = require("../models/CropReports");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");

const apiKey = process.env.API_KEY_GENAI;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const CropDiseaseReports = async (req, res) => {
  try {
    let crop,
      disease,
      confidence = 0,
      imageUrl = "";

    // Handle different content types
    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      if (!req.body.crop || !req.body.disease) {
        return res
          .status(400)
          .json({ error: "Crop and Disease are required in JSON body" });
      }
      ({ crop, disease, confidence = 0, imageUrl = "" } = req.body);
    } else if (contentType.includes("multipart/form-data")) {
      if (!req.body.crop || !req.body.disease) {
        return res
          .status(400)
          .json({ error: "Crop and Disease are required in form data" });
      }

      crop = req.body.crop;
      disease = req.body.disease;
      confidence = parseFloat(req.body.confidence || "0");

      // Handle uploaded files
      if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl[0];
        imageUrl = `/uploads/${file.filename}`; // This will be the path to access the file
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl; // Fallback to URL if no file uploaded
      }
    } else {
      return res
        .status(415)
        .json({ error: "Unsupported content type. Use JSON or form-data" });
    }

    // Additional validation
    if (typeof crop !== "string" || typeof disease !== "string") {
      return res
        .status(400)
        .json({ error: "Crop and Disease must be strings" });
    }

    const isHealthy = disease.toLowerCase().includes("healthy");

    // Check if report already exists in DB
    const existing = await CropReport.findOne({ crop, disease });
    if (existing) {
      return res.json({
        message: isHealthy
          ? "Healthy Crop Report (cached)"
          : "Diseased Crop Report (cached)",
        crop,
        disease,
        confidence: `${confidence}%`,
        imageUrl,
        ...existing.report,
      });
    }

    // Prompt Construction
    const prompt = isHealthy
      ? `
        The crop "${crop}" is healthy.
        Explain the following in detail (5-6 lines each) in JSON:
        {
          "ideal_conditions": "...",
          "preventive_measures": "...",
          "water_fertilization": "...",
          "common_threats": "...",
          "best_practices": [{ "practice": "...", "description": "..." }]
        }
      `
      : `
        Generate a detailed structured report on "${disease}" in "${crop}".
        Provide JSON:
        {
          "pathogen": "...",
          "pathogen_type": "...",
          "spread": "...",
          "favorable_conditions": "...",
          "best_practices": [{ "practice": "...", "description": "..." }],
          "natural_methods": [{ "name": "...", "description": "..." }],
          "chemical_pesticides": [{ "name": "...", "quantity": "...", "note": "..." }]
        }
      `;

    // Generate AI content
    const response = await model.generateContent(prompt);
    let text = response.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    text = text.replace(/,\s*([\]}])/g, "$1"); // Clean commas before brackets

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse AI response:", text);
      return res.status(500).json({
        error: "AI returned invalid JSON format.",
        raw: text,
        suggestion:
          "Please try again with more specific crop/disease information",
      });
    }

    // Save to DB
    const newReport = new CropReport({
      crop,
      disease,
      confidence,
      imageUrl,
      report: parsed,
      isHealthy,
    });
    await newReport.save();

    const result = {
      message: isHealthy
        ? "Healthy Crop Report Generated"
        : "Diseased Crop Report Generated",
      crop,
      disease,
      confidence: `${confidence}%`,
      imageUrl, // This will be either the uploaded file path or the provided URL
      ...parsed,
    };

    return res.json(result);
  } catch (error) {
    console.error("Report generation failed:", error);

    // Clean up uploaded files if error occurred
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error cleaning up file:", err);
          });
        });
      });
    }

    res.status(500).json({
      error: "Failed to generate crop disease report",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add this function
const getAllCropReports = async () => {
  const reports = await CropReport.find().sort({ timestamp: -1 });
  return { success: true, data: reports };
};


module.exports = { CropDiseaseReports ,getAllCropReports};
