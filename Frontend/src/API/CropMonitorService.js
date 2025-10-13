import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: `${BASE_URL}/cropMonitor`,
  headers: {
    "Content-Type": "application/json",
  },
});

//  Save search (and auto-create crop entry if diseased)
export const saveSearch = async (data) => {
  try {
    const res = await API.post("/save-search", data);
    return res.data;
  } catch (error) {
    console.error(" Error saving search:", error);
    throw error.response?.data || { message: "Server error" };
  }
};

//  Get user search history
export const getSearches = async (username) => {
  try {
    const res = await API.get(`/get-searches/${username}`);
    return res.data;
  } catch (error) {
    console.error(" Error fetching searches:", error);
    throw error.response?.data || { message: "Server error" };
  }
};

//  Upload community crop data (supports multiple images)
export const uploadCommunityData = async (formData) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cropMonitor/upload-data/community`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  } catch (error) {
    console.error(" Error uploading community data:", error);
    throw error.response?.data || { message: "Server error" };
  }
};

//  Get all uploaded community data
export const getCommunityData = async () => {
  try {
    const res = await API.get("/get-data/community");
    return res.data;
  } catch (error) {
    console.error(" Error fetching community data:", error);
    throw error.response?.data || { message: "Server error" };
  }
};

// Web scraping images for crop & disease
export const webScrapeUpload = async (crop, disease) => {
  try {
    const body = { crop, disease };
    const res = await API.post("/webScrap/upload", body);
    console.log("Scraped images response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error scraping images:", error);
    throw error.response?.data || { message: "Scraping failed" };
  }
};
export default {
    saveSearch,
    getSearches,
    uploadCommunityData,
    getCommunityData,
    webScrapeUpload,
};