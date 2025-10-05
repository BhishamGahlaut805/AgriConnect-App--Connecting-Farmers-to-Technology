// src/services/yieldService.js

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MARKET_API_URL = import.meta.env.VITE_BACKEND_FLASK_URL || API_BASE_URL;

/**
 * Fetch yield predictions by state
 * @param {string} state - The name of the state
 * @returns {Promise<Array>} - Returns a promise resolving to the list of predictions
 */
export const fetchYieldByState = async (state) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/yield/${state}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`No records found for state: ${state}`);
    } else {
      throw new Error("Error fetching yield predictions");
    }
  }
};
// src/services/yieldService.js

export const fetchMarketPrices = async ({ state, district, commodity, date }) => {
  try {
    console.log("Fetching market prices...", { state, district, commodity, date });
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() - 2);
    const formattedDate = endDate.toISOString().split("T")[0];

    const response = await axios.get(`${API_BASE_URL}/api/v1/MarketPrices`, {
      params: {
        state,
        district,
        commodity,
        date: formattedDate,
      },
    });
    console.log("Market prices response:", response.data.data.records);
    //sending the response in below format as Array
//     [{…}]
// 0
// :
// Arrival_Date
// :
// "05/08/2025"
// Commodity
// :
// "Rice"
// Commodity_Code
// :
// "3"
// District
// :
// "Agra"
// Grade
// :
// "FAQ"
// Market
// :
// "Agra"
// Max_Price
// :
// "3520"
// Min_Price
// :
// "3350"
// Modal_Price
// :
// "3450"
// State
// :
// "Uttar Pradesh"
// Variety
// :
// "III"
// [[Prototype]]
// :
// Object
// length
// :
// 1
// [[Prototype]]
// :
// Array(0)
   return response.data.data.records;

  } catch (error) {
    console.error("Error fetching market prices:", error);
    throw error;
  }
};

export const fetchHistoricalPrices = async ({
  state,
  district,
  commodity,
  years = 1,
}) => {
  try {
    console.log("Fetching historical prices...", { state, district, commodity, years });
    const response = await axios.get(`${API_BASE_URL}/api/v1/MarketPrices/historical`, {
      params: { state, district, commodity, years },
    });
    console.log("Historical prices response:", response.data.data.records);
    //Similar data response in array
//     //0
// :
// Arrival_Date
// :
// "01/01/2021"
// Commodity
// :
// "Rice"
// Commodity_Code
// :
// "3"
// District
// :
// "Agra"
// Grade
// :
// "FAQ"
// Market
// :
// "Achnera"
// Max_Price
// :
// "2560"
// Min_Price
// :
// "2520"
// Modal_Price
// :
// "2540"
// State
// :
// "Uttar Pradesh"
// Variety
// :
// "III"
// [[Prototype]]
// :
// Object
// 1
// :
// {State: 'Uttar Pradesh', District: 'Agra', Market: 'Achnera', Commodity: 'Rice', Variety: 'III', …}
// 2
// :
// {State: 'Uttar Pradesh', District: 'Agra', Market: 'Achnera', Commodity: 'Rice', Variety: 'III', …}
    // Modified response handling
    return response.data.data.records;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    throw error;
  }
};

export const formatPrice = (price) => {
  if (isNaN(price)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};