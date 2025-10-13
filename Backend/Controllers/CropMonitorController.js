const User = require("../Models/userModel.js");
const SearchHistory = require("../Models/CropSearch.js");
const CropData = require("../Models/CropData.js");
const puppeteer = require("puppeteer");

// Save Search History and Conditional Crop Data Entry

exports.saveSearch = async (req, res) => {
  try {
    const { username, crop, disease, confidence, imageUrl } = req.body;
    console.log(
      "Data received to make DB:",
      username,
      crop,
      disease,
      confidence,
      imageUrl
    );

    if (!crop || !disease || confidence == null || !imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newSearch = new SearchHistory({
      username,
      crop,
      disease,
      confidence,
      imageUrl,
    });

    if (disease.toLowerCase() !== "healthy") {
      let isDiseased = "Yes";

      try {
        const user = await User.findOne({ name: username });

        if (!user) {
          console.error("User not found in UserDB");
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        const location = user.Address;
        const person = username;
        const suggestion = "";
        const date = Date.now();
        const category = "General";

        const newCropData = new CropData({
          location,
          crop,
          disease,
          isDiseased,
          person,
          category,
          suggestion,
          images: [imageUrl],
          date,
        });

        await newCropData.save();
        console.log("Crop data saved successfully");
      } catch (error) {
        console.error("Error fetching user data:", error);
        return res
          .status(500)
          .json({ success: false, message: "Error fetching user data" });
      }
    }

    await newSearch.save();
    console.log("Search Saved:", newSearch);

    res.json({
      success: true,
      message: "Search saved successfully",
      data: newSearch,
    });
  } catch (error) {
    console.error("MongoDB Save Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSearches = async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });
    }

    const searches = await SearchHistory.find({ username })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({ success: true, data: searches });
  } catch (error) {
    console.error("MongoDB Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Community Data Upload
exports.uploadCommunityData = async (req, res) => {
  try {
    const {
      location,
      crop,
      disease,
      isDiseased,
      person,
      category,
      suggestion,
    } = req.body;
    const date = Date.now();

    if (!location || !crop || !person || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const newCropData = new CropData({
      location,
      crop,
      disease,
      isDiseased,
      person,
      category,
      suggestion,
      images: imageUrls,
      date,
    });

    await newCropData.save();

    res.json({
      success: true,
      message: "Data uploaded successfully",
      data: newCropData,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Community Data
exports.getCommunityData = async (req, res) => {
  try {
    const data = await CropData.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching community data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const fs = require("fs");
const path = require("path");

const DATASETS = [
  "C:/Users/bhish/Downloads/PlantVillageDataset_final/plantvillage dataset/color",
  "C:/Users/bhish/Downloads/CottonDataset/Main dataset",
];

function findMatchingFolder(crop, disease) {
  for (const datasetPath of DATASETS) {
    if (!fs.existsSync(datasetPath)) continue;

    const folders = fs
      .readdirSync(datasetPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const folderName of folders) {
      const lowerFolder = folderName.toLowerCase();
      if (
        (crop && lowerFolder.includes(crop.toLowerCase())) ||
        (disease && lowerFolder.includes(disease.toLowerCase()))
      ) {
        return path.join(datasetPath, folderName);
      }
    }
  }
  return null;
}

function getImagesFromFolder(folderPath, limit = 10) {
  if (!fs.existsSync(folderPath)) return [];
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => /\.(jpe?g|png|gif)$/i.test(file))
    .slice(0, limit)
    .map((file) => path.join(folderPath, file));
  return files;
}

exports.webScrapeUpload = async (req, res) => {
  const { crop, disease } = req.body;

  if (!crop && !disease) {
    return res.status(400).json({ error: "Crop or disease is required" });
  }

  try {
    const folderPath = findMatchingFolder(crop, disease);
    if (!folderPath) {
      return res
        .status(404)
        .json({ success: false, message: "No matching images found" });
    }

    const images = getImagesFromFolder(folderPath, 10);

    // Generate URLs matching express.static
    const imageUrls = images.map((file) => {
      // Remove the base folder path we exposed via express.static
      const relativePath = path
        .relative("C:/Users/bhish/Downloads", file)
        .replace(/\\/g, "/");
      return `${process.env.BASE_URL}/dataset-images/${relativePath}`;
    });

    res.json({ success: true, imageUrls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
};
