// src/services/cropService.js
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKEND_FLASK_URL;
const API_URL = `${BASE_URL}/api/v1/recommend-crops`;

export const recommendCrops = async ({
  lat,
  lon,
  state,
  season,
  farm_name,
}) => {
  try {
    console.log("Requesting crop recommendations...",farm_name);
    const response = await axios.post(API_URL, {
      lat,
      lon,
      state,
      season,
      farm_name,
    });
    return response.data;
  } catch (error) {
    console.error("Error recommending crops:", error);
    throw error.response?.data || { message: "Server error" };
  }
};
