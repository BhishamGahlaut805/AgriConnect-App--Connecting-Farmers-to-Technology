import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip as ChartTooltip,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  fetchMarketPrices,
  fetchHistoricalPrices,
  formatPrice,
} from "../API/YieldService";
import statesData from "../Constants/StatesDist.json";
import commodityOptions from "../Constants/Commodities";

const timeRanges = {
  "10d": "Last 10 Days",
  "1m": "Last Month",
  "3m": "Last 3 Months",
  "1y": "Last Year",
  "2y": "Last 2 Years",
  custom: "Custom Range",
};

// Helper function to format date to DD-MM-YYYY
const formatDateString = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to parse API date format (DD/MM/YYYY) to Date object
const parseApiDate = (dateString) => {
  if (!dateString) return null;
  // Handle various date string formats: DD/MM/YYYY, YYYY-MM-DD
  if (dateString.includes("/")) {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  } else if (dateString.includes("-")) {
    // Already in YYYY-MM-DD, direct creation
    return new Date(dateString);
  }
  return null;
};

// --- Helper: basic stats ---
const calcStats = (arr) => {
  if (!arr || arr.length === 0) return null;
  const n = arr.length;
  const mean = arr.reduce((s, v) => s + v, 0) / n;
  const sorted = [...arr].sort((a, b) => a - b);
  const median =
    n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  return { mean, median, min, max, std, count: n };
};

// --- Helper: Simple prediction based on last N days linear trend + moving average ---
const predictNearbyPrice = (data, daysAhead = 7) => {
  // data: array of { date: Date, modalPrice: number } sorted by date asc
  const clean = (data || []).filter((d) => d && d.modalPrice && d.date);
  if (clean.length < 3) return null;

  // Use last 7 points (or fewer if not available)
  const lastN = 7;
  const sample = clean.slice(-lastN);
  // convert dates to numeric (days since epoch)
  const x = sample.map((d) => d.date.getTime() / (1000 * 60 * 60 * 24)); // days
  const y = sample.map((d) => d.modalPrice);

  // simple linear regression slope/intercept
  const n = x.length;
  const sumX = x.reduce((s, v) => s + v, 0);
  const sumY = y.reduce((s, v) => s + v, 0);
  const sumXY = x.reduce((s, v, i) => s + v * y[i], 0);
  const sumX2 = x.reduce((s, v) => s + v * v, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // predict next days
  const lastDay = x[x.length - 1];
  const preds = [];
  for (let i = 1; i <= daysAhead; i++) {
    const xd = lastDay + i;
    const pred = intercept + slope * xd;
    preds.push({ dayOffset: i, price: pred });
  }

  // Also give a moving-average fallback
  const movingAvg = y.reduce((s, v) => s + v, 0) / y.length;

  return {
    slope,
    intercept,
    predictions: preds,
    movingAvg,
  };
};

// --- Throttled parallel fetch helper ---
// accepts an array of promise-returning functions and runs up to `concurrency` at once
const runConcurrent = async (tasks, concurrency = 5) => {
  const results = [];
  let i = 0;
  const runners = new Array(Math.min(concurrency, tasks.length))
    .fill(null)
    .map(async () => {
      while (i < tasks.length) {
        const idx = i++;
        try {
          const r = await tasks[idx]();
          results[idx] = { ok: true, data: r };
        } catch (err) {
          results[idx] = { ok: false, error: err };
        }
      }
    });
  await Promise.all(runners);
  return results;
};

const MarketPricesDashboard = () => {
  const [state, setState] = useState("");
  const [market, setMarket] = useState("");
  const [commodity, setCommodity] = useState("");
  const [marketsList, setMarketsList] = useState([]);
  const [data, setData] = useState([]);
  const [historicalData, setHistoricalData] = useState({
    yearly: [],
    monthly: [],
    rawData: [],
    stats: null, // New state for stats
    prediction: null, // New state for prediction
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("10d");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [noData, setNoData] = useState(false);

  // Update markets list when state changes
useEffect(() => {
  if (state) {
    const districts = statesData[state] || [];
    setMarketsList(districts);
    setMarket("");
  }
}, [state]);


  // Handle time range selection
  useEffect(() => {
    const now = new Date();
    switch (timeRange) {
      case "10d":
        setStartDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        setShowCustomRange(false);
        break;
      case "1m":
        setStartDate(
          new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        );
        setEndDate(now);
        setShowCustomRange(false);
        break;
      case "3m":
        setStartDate(
          new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        );
        setEndDate(now);
        setShowCustomRange(false);
        break;
      case "1y":
        setStartDate(
          new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        );
        setEndDate(now);
        setShowCustomRange(false);
        break;
      case "2y":
        setStartDate(
          new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
        );
        setEndDate(now);
        setShowCustomRange(false);
        break;
      case "custom":
        setShowCustomRange(true);
        break;
      default:
        break;
    }
  }, [timeRange]);

  // Process raw API data into consistent format
  const processMarketData = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    return rawData
      .map((item) => ({
        // Use parseApiDate for both Arrival_Date and date
        date: parseApiDate(item.Arrival_Date || item.date || item.ArrivalDate),
        state: item.State || item.state,
        district: item.District || item.district,
        market: item.Market || item.market,
        commodity: item.Commodity || item.commodity,
        variety: item.Variety || "N/A",
        minPrice: parseFloat(item.Min_Price || item.minPrice) || 0,
        maxPrice: parseFloat(item.Max_Price || item.maxPrice) || 0,
        modalPrice: parseFloat(item.Modal_Price || item.modalPrice) || 0,
      }))
      .filter((item) => item.date !== null) // Filter out items with invalid dates
      .sort((a, b) => a.date - b.date);
  };

  // Process historical data for charts
  const processHistoricalData = (rawData) => {
    const processed = processMarketData(rawData);
    if (processed.length === 0) return { yearly: [], monthly: [], rawData: [] };

    // Group by year and month
    const yearlyData = {};
    const monthlyData = {};

    processed.forEach((record) => {
      if (!record.date) return;

      const date = record.date;
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
  };

  // --- Fetch data for a date range using parallel calls (10-day batches) ---
  const fetchDataForRange = async (start, end) => {
    const results = [];
    const tasks = [];
    const s = new Date(start);
    const e = new Date(end);

    // Create batches: each batch requests up to 10-days ending at batchEnd
    let current = new Date(s);
    while (current <= e) {
      const batchEnd = new Date(current);
      batchEnd.setDate(batchEnd.getDate() + 9); // 10-day window
      if (batchEnd > e) batchEnd.setTime(e.getTime());

      // create task capturing current and batchEnd
      const task = async () => {
        // we use the batchEnd as the 'date' param (matching your backend expectation)
        // Call fetchMarketPrices; it might return { data: [...] } or [...]
        const resp = await fetchMarketPrices({
          state,
          district: market,
          commodity,
          date: batchEnd.toISOString().split("T")[0], // keep YYYY-MM-DD for backend (it converts)
        });

        // normalize shape
        let arr = [];
        if (Array.isArray(resp)) arr = resp;
        else if (resp && Array.isArray(resp.data)) arr = resp.data;
        else if (resp && Array.isArray(resp.records)) arr = resp.records;

        return arr;
      };

      tasks.push(task);

      // advance current by 10 days
      current.setDate(current.getDate() + 10);
    }

    // run tasks in parallel with limited concurrency (5). adjust concurrency if needed.
    const concurrency = 5;
    const taskResults = await runConcurrent(tasks, concurrency);

    // collect successful responses
    taskResults.forEach((r) => {
      if (r && r.ok && Array.isArray(r.data)) {
        results.push(...r.data);
      } else if (r && !r.ok) {
        console.warn("Batch fetch failed:", r.error);
      }
    });

    // The API may return duplicate records across batches — dedupe by unique key (State|District|Market|Commodity|Arrival_Date)
    const uniqueMap = new Map();
    results.forEach((rec) => {
      // normalize record keys if needed (frontend expects record.Arrival_Date etc)
      const arrival =
        rec.Arrival_Date ||
        rec.date ||
        (rec.ArrivalDate ? rec.ArrivalDate : "");
      const key = `${rec.State || rec.state}-${rec.District || rec.district}-${
        rec.Market || rec.market
      }-${rec.Commodity || rec.commodity}-${arrival}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, rec);
    });

    const deduped = Array.from(uniqueMap.values());

    // return deduped array
    return deduped;
  };

  const handleFetchPrices = async () => {
    if (!state || !market || !commodity) {
      setError("Please select State, Market, and Commodity.");
      return;
    }

    setError("");
    setLoading(true);
    setNoData(false);

    try {
      const today = new Date();
      const fetchEndDate = new Date(today);
      fetchEndDate.setDate(today.getDate() - 2); // 2 days back

      // limit to 2 years back max
      const maxStartDate = new Date(today);
      maxStartDate.setFullYear(today.getFullYear() - 2);
      const adjustedStartDate =
        startDate < maxStartDate ? maxStartDate : startDate;

      console.log("Fetching data from", adjustedStartDate, "to", fetchEndDate);

      // Fetch current data (parallel batches)
      const rawData = await fetchDataForRange(adjustedStartDate, fetchEndDate);

      // rawData contains API record objects (Arrival_Date etc). Convert to processed format
      const processedData = processMarketData(rawData);

      // Stats on modalPrice
      const modalPrices = processedData
        .map((d) => d.modalPrice)
        .filter((v) => !isNaN(v));
      const stats = calcStats(modalPrices);

      // Nearby prediction (7-day)
      const prediction = predictNearbyPrice(processedData, 7);

      // Fetch historical data if needed (years) — we rely on the service's historical route
      let historicalProcessed = { yearly: [], monthly: [], rawData: [] };
      if (timeRange !== "10d") {
        const histResp = await fetchHistoricalPrices({
          state,
          district: market,
          commodity,
          years: timeRange === "2y" ? 2 : 1,
        });

        // historical service returns { data: { yearly, monthly } } in your YieldService
        const histRaw = histResp && histResp.data ? histResp.data : histResp;
        historicalProcessed = processHistoricalData(
          histRaw.rawData && histRaw.rawData.length > 0
            ? histRaw.rawData
            : histRaw.yearly
            ? []
            : [] // Handle cases where rawData might be missing or empty
        );

        // If your fetchHistoricalPrices returns the aggregated yearly/monthly directly:
        if (histRaw.yearly && histRaw.monthly) {
          historicalProcessed.yearly = histRaw.yearly;
          historicalProcessed.monthly = histRaw.monthly;
          // keep rawData as empty unless the service returned raw records
          historicalProcessed.rawData = histRaw.rawData || [];
        }
      }

      // sort processedData by date asc
      processedData.sort((a, b) => a.date - b.date);

      setData(processedData);
      setHistoricalData(historicalProcessed);

      // set computed stats into state (you can add more state variables if you want to show these)
      // For quick demo, attach them to historicalData.rawData metadata (or create dedicated state)
      setHistoricalData((prev) => ({ ...prev, stats, prediction }));

      if (
        processedData.length === 0 &&
        (!historicalProcessed.yearly || historicalProcessed.yearly.length === 0)
      ) {
        setNoData(true);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch price data. Please try again.");
      setNoData(true);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPriceChange = () => {
    if (!data || data.length < 2) return null;

    const current = data[data.length - 1]?.modalPrice;
    const previous = data[data.length - 2]?.modalPrice;

    if (current === undefined || previous === undefined || previous === 0) {
      return null;
    }

    const change = ((current - previous) / previous) * 100;

    return {
      value: Math.round(change * 10) / 10,
      direction: change >= 0 ? "up" : "down",
    };
  };

  const priceChange = getPriceChange();

  const getMonthlyPriceChange = () => {
    if (!historicalData.monthly || historicalData.monthly.length < 2)
      return null;

    const currentMonthData = historicalData.monthly.find(
      (m) =>
        m.month === new Date().toLocaleString("default", { month: "short" })
    );
    // Find the previous month's data relative to the current month in the sorted historicalData.monthly array.
    const currentMonthIndex = historicalData.monthly.findIndex(
      (m) =>
        m.month === new Date().toLocaleString("default", { month: "short" })
    );
    const prevMonthData = historicalData.monthly[currentMonthIndex - 1];

    if (!currentMonthData || !prevMonthData || prevMonthData.avgPrice === 0) {
      return null;
    }

    const change =
      ((currentMonthData.avgPrice - prevMonthData.avgPrice) /
        prevMonthData.avgPrice) *
      100;

    return {
      value: Math.round(change * 10) / 10,
      direction: change >= 0 ? "up" : "down",
    };
  };

  const monthlyPriceChange = getMonthlyPriceChange();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
        Advanced Market Price Analysis
      </h1>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* State Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              State
            </label>
            {/* State dropdown */}
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select State</option>
              {Object.keys(statesData).map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
          </div>

          {/* Market Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Market
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              disabled={!marketsList.length}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Select Market --</option>
              {marketsList.map((districtName) => (
                <option key={districtName} value={districtName}>
                  {districtName}
                </option>
              ))}
            </select>
          </div>

          {/* Commodity Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Select Commodity --</option>
              {commodityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Time Range
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(timeRanges).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`px-3 py-1 text-sm rounded-lg ${
                  timeRange === key
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {showCustomRange && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 2)
                    )
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={
                    new Date(new Date().setDate(new Date().getDate() - 2))
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleFetchPrices}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          {loading ? "Loading..." : "Analyze Prices"}
        </button>
      </div>

      {/* Error Message */}
      {(error || noData) && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>
            {error ||
              "No data available for the selected parameters. Please try different filters."}
          </p>
        </div>
      )}

      {/* Dashboard Content */}
      {!noData &&
        (data.length > 0 ||
          historicalData.yearly.length > 0 ||
          historicalData.monthly.length > 0) && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Price Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  Current Price
                </h3>
                {data.length > 0 && data[0]?.modalPrice !== undefined ? (
                  <>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(data[0].modalPrice)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data[0]?.date
                        ? data[0].date.toLocaleDateString()
                        : "N/A"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No price data
                  </p>
                )}
              </div>

              {/* Daily Price Change Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  Daily Change
                </h3>
                {priceChange ? (
                  <div className="flex items-center">
                    <span
                      className={`text-xl font-bold ${
                        priceChange.direction === "up"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {priceChange.direction === "up" ? "↑" : "↓"}{" "}
                      {Math.abs(priceChange.value)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      from previous day
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Not enough data to calculate change
                  </p>
                )}
              </div>

              {/* Monthly Price Change Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  Monthly Trend
                </h3>
                {monthlyPriceChange ? (
                  <div className="flex items-center">
                    <span
                      className={`text-xl font-bold ${
                        monthlyPriceChange.direction === "up"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {monthlyPriceChange.direction === "up" ? "↑" : "↓"}{" "}
                      {Math.abs(monthlyPriceChange.value)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      from last month
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Not enough data to calculate trend
                  </p>
                )}
              </div>
            </div>

            {/* New: Stats Summary Card */}
            {historicalData.stats && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  Overall Price Statistics (Modal Price)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm dark:text-gray-300">
                  <div>
                    <p className="font-medium">Mean:</p>
                    <p>{formatPrice(historicalData.stats.mean)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Median:</p>
                    <p>{formatPrice(historicalData.stats.median)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Min:</p>
                    <p>{formatPrice(historicalData.stats.min)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Max:</p>
                    <p>{formatPrice(historicalData.stats.max)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Std Dev:</p>
                    <p>{formatPrice(historicalData.stats.std)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Count:</p>
                    <p>{historicalData.stats.count}</p>
                  </div>
                </div>
              </div>
            )}

            {/* New: Price Prediction Card */}
            {historicalData.prediction && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  Nearby Price Prediction (Next 7 Days)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Based on recent trends and moving average.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm dark:text-gray-300">
                  <div>
                    <p className="font-medium">Predicted Prices:</p>
                    <ul className="list-disc list-inside">
                      {historicalData.prediction.predictions.map((p, idx) => (
                        <li key={idx}>
                          Day +{p.dayOffset}: {formatPrice(p.price)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Moving Average (last 7 days):</p>
                    <p>{formatPrice(historicalData.prediction.movingAvg)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {data.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Price Trend */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">
                    📈 Current Price Trend
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => date.toLocaleDateString()}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          formatPrice(value).replace("₹", "")
                        }
                      />
                      <ChartTooltip
                        formatter={(value) => formatPrice(value)}
                        labelFormatter={(label) =>
                          `Date: ${new Date(label).toLocaleDateString()}`
                        }
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="modalPrice"
                        name="Modal Price"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Price Distribution */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">
                    📊 Price Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => date.toLocaleDateString()}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          formatPrice(value).replace("₹", "")
                        }
                      />
                      <ChartTooltip
                        formatter={(value) => formatPrice(value)}
                        labelFormatter={(label) =>
                          `Date: ${new Date(label).toLocaleDateString()}`
                        }
                      />
                      <Legend />
                      <Bar dataKey="maxPrice" name="Max Price" fill="#ef4444" />
                      <Bar dataKey="minPrice" name="Min Price" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Historical Comparisons */}
            {historicalData.yearly.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  📅 Historical Price Comparison
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={historicalData.yearly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="year" />
                    <YAxis
                      tickFormatter={(value) =>
                        formatPrice(value).replace("₹", "")
                      }
                    />
                    <ChartTooltip
                      formatter={(value) => formatPrice(value)}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="avgPrice"
                      name="Average Price"
                      fill="#3b82f6"
                      barSize={30}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgPrice"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Scatter
                      dataKey="minPrice"
                      name="Minimum Price"
                      fill="#10b981"
                      shape="triangle"
                    />
                    <Scatter
                      dataKey="maxPrice"
                      name="Maximum Price"
                      fill="#ef4444"
                      shape="triangle"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly Pattern */}
            {historicalData.monthly.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  📆 Monthly Price Patterns
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={historicalData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        formatPrice(value).replace("₹", "")
                      }
                    />
                    <ChartTooltip
                      formatter={(value) => formatPrice(value)}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgPrice"
                      name="Average Price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="minPrice"
                      name="Minimum Price"
                      stroke="#10b981"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="maxPrice"
                      name="Maximum Price"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Data Table */}
            {(data.length > 0 || historicalData.rawData.length > 0) && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto">
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  📋 Detailed Price Data
                </h2>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                        Date
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                        Market
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                        Commodity
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                        Min Price
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                        Max Price
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                        Modal Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.length > 0 ? data : historicalData.rawData)
                      .slice(0, 10) // Still slicing to 10 for display in table for brevity
                      .map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="p-3 text-gray-800 dark:text-gray-100">
                            {row.date?.toLocaleDateString() || "N/A"}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-gray-100">
                            {row.market || "N/A"}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-gray-100">
                            {row.commodity || "N/A"}
                          </td>
                          <td className="p-3 font-medium text-green-700 dark:text-green-400">
                            {formatPrice(row.minPrice)}
                          </td>
                          <td className="p-3 font-medium text-green-700 dark:text-green-400">
                            {formatPrice(row.maxPrice)}
                          </td>
                          <td className="p-3 font-medium text-green-700 dark:text-green-400">
                            {formatPrice(row.modalPrice)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default MarketPricesDashboard;
