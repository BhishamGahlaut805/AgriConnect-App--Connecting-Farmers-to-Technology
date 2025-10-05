const axios = require("axios");

const API_KEY =
  process.env.DATA_GOV_API_KEY ;
const BASE_URL =
  "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24";

const fetchMarketPrices = async (req, res) => {
  try {
    const { date, state, commodity, district } = req.query;
    console.log("Fetching market prices with params:", {
      date,
      state,
      commodity,
      district,
    });

    // Validate required parameters
    if (!date || !state || !commodity || !district) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: date, state, commodity, district",
      });
    }

    const formattedDate = formatDate(date);

    const params = {
      "api-key": API_KEY,
      format: "json",
      "filters[State]": state,
      "filters[District]": district,
      "filters[Commodity]": commodity,
      "filters[Arrival_Date]": formattedDate,
    };

    console.log("API request params:", params);
    const response = await axios.get(BASE_URL, { params });
    console.log("API response received:", response.data);
    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching market prices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch market prices",
      error: error.message,
      ...(error.response && {
        apiError: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      }),
    });
  }
};

const fetchHistoricalPrices = async (req, res) => {
  try {
    const { state, commodity, district, years = 5 } = req.query;
    console.log("Fetching historical prices with params:", req.query);

    if (!state || !commodity || !district) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: state, commodity, district",
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - parseInt(years));

    const params = {
      "api-key": API_KEY,
      format: "json",
      "filters[State]": state,
      "filters[District]": district,
      "filters[Commodity]": commodity,
    //   "filters[Arrival_Date][gte]": formatDate(startDate),
    //   "filters[Arrival_Date][lte]": formatDate(endDate),
    };

    console.log("Historical API request params:", params);
    const response = await axios.get(BASE_URL, { params });
    console.log("Historical API response received:", response.data);
    return res.json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch historical prices",
      error: error.message,
      ...(error.response && {
        apiError: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      }),
    });
  }
};

// Helper functions
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Handle DD-MM-YYYY format if already passed
      if (
        typeof dateString === "string" &&
        dateString.match(/^\d{2}-\d{2}-\d{4}$/)
      ) {
        return dateString;
      }
      throw new Error("Invalid date format");
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (err) {
    console.error("Error formatting date:", err);
    throw new Error(`Invalid date format: ${dateString}`);
  }
}

function processRecords(records) {
  return records
    .filter(
      (record) =>
        record.arrival_date &&
        record.state &&
        record.district &&
        record.commodity &&
        record.market &&
        record.min_price !== null &&
        record.max_price !== null &&
        record.modal_price !== null
    )
    .map((record) => ({
      date: record.arrival_date,
      state: record.state,
      district: record.district,
      market: record.market,
      commodity: record.commodity,
      variety: record.variety || "N/A",
      minPrice: parseFloat(record.min_price),
      maxPrice: parseFloat(record.max_price),
      modalPrice: parseFloat(record.modal_price),
    }));
}

function processHistoricalData(records) {
  const processed = processRecords(records);

  // Group by year and month
  const yearlyData = {};
  const monthlyData = {};

  processed.forEach((record) => {
    try {
      const dateParts = record.date.split("-");
      const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = date.toLocaleString("default", { month: "short" });

      // Yearly data
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          prices: [],
          minPrice: Infinity,
          maxPrice: -Infinity,
        };
      }
      yearlyData[year].prices.push(record.modalPrice);
      yearlyData[year].minPrice = Math.min(
        yearlyData[year].minPrice,
        record.minPrice
      );
      yearlyData[year].maxPrice = Math.max(
        yearlyData[year].maxPrice,
        record.maxPrice
      );

      // Monthly data
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {
          month: monthName,
          prices: [],
          minPrice: Infinity,
          maxPrice: -Infinity,
        };
      }
      monthlyData[monthName].prices.push(record.modalPrice);
      monthlyData[monthName].minPrice = Math.min(
        monthlyData[monthName].minPrice,
        record.minPrice
      );
      monthlyData[monthName].maxPrice = Math.max(
        monthlyData[monthName].maxPrice,
        record.maxPrice
      );
    } catch (err) {
      console.error("Error processing record:", record, err);
    }
  });

  // Calculate averages
  Object.keys(yearlyData).forEach((year) => {
    yearlyData[year].avgPrice =
      yearlyData[year].prices.reduce((a, b) => a + b, 0) /
      yearlyData[year].prices.length;
  });

  Object.keys(monthlyData).forEach((month) => {
    monthlyData[month].avgPrice =
      monthlyData[month].prices.reduce((a, b) => a + b, 0) /
      monthlyData[month].prices.length;
  });

  return {
    yearly: Object.values(yearlyData),
    monthly: Object.values(monthlyData).sort((a, b) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(a.month) - months.indexOf(b.month);
    }),
    rawData: processed,
  };
}

module.exports = {
  fetchMarketPrices,
  fetchHistoricalPrices,
};
