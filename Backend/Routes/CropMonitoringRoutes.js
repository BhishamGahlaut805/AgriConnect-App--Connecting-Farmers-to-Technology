const express = require("express");
const {upload} = require("../Middlewares/Upload.js");

const {  saveSearch,
  getSearches,
  uploadCommunityData,
  getCommunityData,
  webScrapeUpload, } = require("../Controllers/CropMonitorController.js");

const router = express.Router();

// Save and Get Search History
router.post("/save-search", saveSearch);
router.get("/get-searches/:username", getSearches);

// Community Data
router.post("/upload-data/community",upload, uploadCommunityData);
router.get("/get-data/community", getCommunityData);

// Web Scraping
router.post("/webScrap/upload", webScrapeUpload);

module.exports = router;
