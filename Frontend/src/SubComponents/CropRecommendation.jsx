// src/components/CropRecommendation.jsx
import React, { useState, useEffect } from "react";
import { recommendCrops } from "../API/CropService";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

/* States & seasons */
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];
const seasons = ["Kharif", "Rabi"];

/* Color palette - Enhanced for vibrancy */
const palette = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#ef4444", // Red
  "#8b5cf6", // Violet
];

/* Farmer-friendly labels */
const friendlyWeatherLabels = {
  avg_surface_pressure_mean: "Air Pressure (hPa)",
  avg_cloud_cover_mean: "Cloud Cover (%)",
  avg_relative_humidity_2m_mean: "Humidity (%)",
  avg_temperature_2m_max: "Max Temp (°C)",
  avg_temperature_2m_mean: "Avg Temp (°C)",
  avg_temperature_2m_min: "Min Temp (°C)",
  avg_wind_speed_10m_max: "Max Wind (m/s)",
  avg_precipitation_sum: "Rainfall (mm)",
  avg_shortwave_radiation_sum: "Sunlight (J/m²)",
};

// Function to determine graph height for mobile/desktop
const getGraphHeight = () => {
  const width = window.innerWidth;
  // Pie Chart: fixed height
  if (width < 640) return 400; // Mobile
  return 400; // Tablet/Desktop
};

// Function to determine the required width for the horizontal Bar Chart for a wide look
const getBarChartWidth = (dataLength) => {
  const width = window.innerWidth;
  // If mobile, ensure a wide, scrollable width (e.g., 600px)
  if (width < 640) return 600;
  // For larger screens, just take the full container width
  return "100%";
};

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/90 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-700/90 dark:border-gray-600">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          {`${payload[0].name}: ${payload[0].value.toFixed(1)}${unit}`}
        </p>
      </div>
    );
  }

  return null;
};

const CropRecommendation = ({ farm_name }) => {
  const [state, setState] = useState("Haryana");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getLocationAndRecommend = async (override = false) => {
    setError(null);
    setLoading(true);
    if (override) setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const data = await recommendCrops({
            lat,
            lon,
            state,
            season,
            farm_name,
          });
          setResult(data);
        } catch (err) {
          console.error(err);
          setError(
            err?.message ||
              (err?.response && err.response.data) ||
              "Server error fetching recommendation data."
          );
        } finally {
          setLoading(false);
        }
      },
      (geolocErr) => {
        console.error("Location error:", geolocErr);
        setError(
          "Could not fetch location. Please enable location access in your browser settings."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Initial load on mount
    getLocationAndRecommend(false);
  }, []);

  const getCropsChartData = (top_crops = []) =>
    top_crops
      .map((c) => ({
        crop: c.crop,
        percent: Number((c.probability).toFixed(1)),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10); // Limit to top 10 for cleaner display

  const getWeatherChartData = (weather_used = {}) => {
    const raw = Object.entries(weather_used).map(([k, v]) => ({
      feature: friendlyWeatherLabels[k] || k,
      value: Number(v),
    }));
    const vals = raw.map((r) => r.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    // Normalize values to an 'importance' percentage (0-100)
    return raw
      .map((r) => ({
        ...r,
        // The value itself for the tooltip/label, Importance is the normalized value
        importance:
          max === min
            ? 50
            : Number((((r.value - min) / (max - min)) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.importance - a.importance);
  };

  const makeMapEmbedUrl = (lat, lon) =>
    `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

  // Custom Label for Pie Chart to improve readability
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    // Only show label if slice is large enough
    if (percent > 0.05) {
      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-xs font-bold"
        >
          {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }
    return null;
  };

  const cropsData = getCropsChartData(result?.top_crops);
  const weatherData = getWeatherChartData(result?.weather_used);

  return (
    <div className="p-2 sm:p-4 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full shadow-2xl rounded-xl border-none">
        {/* Header - Vibrant Gradient */}
        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              🌾 Crop Recommendation
            </h3>
            <p className="text-sm text-white/90 font-medium hidden sm:block">
              {farm_name}
            </p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-b-xl">
          {/* Controls */}
          <div className="grid md:grid-cols-3 gap-3 items-end mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-inner">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Season
              </label>
              <select
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition duration-150 ease-in-out focus:ring-indigo-500 focus:border-indigo-500"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                {seasons.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <select
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition duration-150 ease-in-out focus:ring-indigo-500 focus:border-indigo-500"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {indianStates.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <Button
                onClick={() => getLocationAndRecommend(true)}
                disabled={loading}
                className="w-full px-4 py-2 mt-2 md:mt-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition duration-150 ease-in-out disabled:opacity-50"
              >
                {loading ? "Finding Location..." : "Get Recommendation"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="space-y-8 mt-6">
              {/* Farm Info & Map */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="col-span-1 p-4 rounded-lg shadow-xl bg-teal-50 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700">
                  <h3 className="text-xl font-bold mb-3 text-teal-800 dark:text-teal-200">
                    Location & Current Status
                  </h3>
                  <p className="text-sm">
                    Name:{" "}
                    <span className="font-semibold">{result.farm.name}</span>
                  </p>
                  <p className="text-sm">
                    State: <span className="font-semibold">{state}</span>
                  </p>
                  <p className="text-sm">
                    Season:{" "}
                    <span className="font-semibold">{result.season}</span>
                  </p>
                  <p className="text-sm">
                    Coordinates:{" "}
                    <span className="font-semibold">
                      {result.farm.lat}, {result.farm.lon}
                    </span>
                  </p>
                  <div className="mt-4 p-2 bg-indigo-100 dark:bg-indigo-900 rounded-md font-bold text-indigo-800 dark:text-indigo-200 text-center">
                    Top Pick: {result.top_crops?.[0]?.crop || "—"}
                  </div>
                </div>
                {/* Map Section */}
                <div className="col-span-2">
                  <iframe
                    title="Farm location"
                    src={makeMapEmbedUrl(result.farm.lat, result.farm.lon)}
                    className="w-full h-64 sm:h-full border-0 rounded-lg shadow-xl"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Crops Pie Chart (Fixed Height) */}
                <Card className="overflow-x-scroll p-4 shadow-xl bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-bold mb-3 text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                    Top Crop Recommendations
                  </h4>
                  <div style={{ height: getGraphHeight() }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cropsData}
                          dataKey="percent"
                          nameKey="crop"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={120}
                          paddingAngle={5}
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {cropsData.map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={palette[idx % palette.length]}
                              className="transition-all duration-300 hover:opacity-80"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip unit="%" />} />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: "10px" }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Weather Feature Bar Chart (Wide/Scrollable) */}
                <Card className="overflow-x-auto ml-2 shadow-xl bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-bold mb-3 text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                    Weather Factor Influence (0-100%)
                  </h4>
                  {/* Container for overflow-x-auto */}
                  <div className="" style={{ height: getGraphHeight() }}>
                    <ResponsiveContainer
                      width={getBarChartWidth(weatherData.length)}
                      height={weatherData.length * 35 + 60} // Dynamic height based on data points
                    >
                      <BarChart
                        layout="vertical"
                        data={weatherData}
                        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                      >
                        <XAxis
                          type="number"
                          tickFormatter={(v) => `${v.toFixed(0)}%`}
                          stroke="#6b7280"
                        />
                        <YAxis
                          type="category"
                          dataKey="feature"
                          width={140}
                          stroke="#6b7280"
                          // Friendly label for each bar
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip unit="%" />} />
                        <Bar
                          dataKey="importance"
                          radius={[4, 4, 0, 0]}
                          className="shadow-lg"
                        >
                          <LabelList
                            dataKey="importance"
                            position="right"
                            formatter={(v) => `${v.toFixed(0)}%`}
                            className="text-sm font-semibold"
                            fill="#1f2937" // Dark text for label
                          />
                          {weatherData.map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={palette[idx % palette.length]}
                              className="transition-all duration-300 hover:opacity-80"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CropRecommendation;
