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

/* Blue -> Violet palette */
const palette = [
  "#3b82f6",
  "#6366f1",
  "#7c3aed",
  "#8b5cf6",
  "#6366f1",
  "#4f46e5",
];

const CropRecommendation = ({ farm_name }) => {
  const [state, setState] = useState("Haryana");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /* call API with current location */
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
              "Server error"
          );
        } finally {
          setLoading(false);
        }
      },
      (geolocErr) => {
        console.error("Location error:", geolocErr);
        setError("Could not fetch location. Please enable location access.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  /* Fetch initial result on mount (Haryana + Kharif) */
  useEffect(() => {
    getLocationAndRecommend(false);
  }, []);

  const getCropsChartData = (top_crops = []) =>
    top_crops
      .map((c) => ({
        crop: c.crop,
        percent: Number((c.probability * 100).toFixed(2)),
      }))
      .sort((a, b) => b.percent - a.percent);

  const getWeatherChartData = (weather_used = {}) => {
    const entries = Object.entries(weather_used || {});
    if (entries.length === 0) return [];

    const raw = entries.map(([k, v]) => ({
      feature: k.replaceAll("_", " "),
      value: Number(v),
    }));

    const vals = raw.map((r) => r.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    return raw
      .map((r) => {
        const score = max === min ? 50 : ((r.value - min) / (max - min)) * 100;
        return {
          feature: r.feature,
          value: Number(r.value.toFixed(2)),
          importance: Number(score.toFixed(2)),
        };
      })
      .sort((a, b) => b.importance - a.importance);
  };

  const makeMapEmbedUrl = (lat, lon) =>
    `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

  return (
    <div className="p-4 w-full">
      <Card className="w-full shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Crop Recommendation - Based on Weather and Past Crop Data
              </h3>
            </div>
            <div className="text-right">
              {/* <div className="text-sm text-white/90">Farm</div> */}
              <div className="font-semibold text-white">{farm_name}</div>
            </div>
          </div>
        </div>

        <CardContent className="bg-white dark:bg-gray-800">
          {/* Controls */}
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm mb-1">Season</label>
              <select
                className="w-full p-2 rounded-md border"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                {seasons.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">State</label>
              <select
                className="w-full p-2 rounded-md border"
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
                className="w-full px-4 py-2 rounded-md bg-blue-500 text-white font-semibold"
              >
                {loading ? "Finding..." : "Get Recommendation"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 border text-red-700">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 space-y-6">
              {/* Farm Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="col-span-1 p-4 rounded-lg rounded-md shadow-md focus:shadow-lg focus:ring-2 focus:ring-green-400 outline-none bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold">Farm Info</h3>
                  <p>Name: {result.farm.name}</p>
                  <p>State: {state}</p>
                  <p>Season: {result.season}</p>
                  <p>Lat: {result.farm.lat}</p>
                  <p>Lon: {result.farm.lon}</p>
                  <div className="mt-2">
                    Top pick:{" "}
                    <span className="font-semibold">
                      {result.top_crops?.[0]?.crop || "—"}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <iframe
                    title="Farm location"
                    src={makeMapEmbedUrl(result.farm.lat, result.farm.lon)}
                    className="w-full h-48 border-0"
                  />
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-4 rounded-md shadow-md focus:shadow-lg focus:ring-2 focus:ring-green-400 outline-none rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold mb-3">Top Crops</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      layout="vertical"
                      data={getCropsChartData(result.top_crops)}
                    >
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="crop" width={120} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="percent" radius={[6, 6, 6, 6]}>
                        <LabelList
                          dataKey="percent"
                          position="right"
                          formatter={(v) => `${v}%`}
                        />
                        {getCropsChartData(result.top_crops).map(
                          (entry, idx) => (
                            <Cell
                              key={idx}
                              fill={palette[idx % palette.length]}
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-2 rounded-md shadow-md focus:shadow-lg focus:ring-2 focus:ring-green-400 outline-none rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold mb-3">
                    Weather Feature Importances
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getWeatherChartData(result.weather_used)}>
                      <XAxis dataKey="feature" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="importance" radius={[6, 6, 0, 0]}>
                        <LabelList
                          dataKey="importance"
                          position="top"
                          formatter={(v) => `${v}%`}
                        />
                        {getWeatherChartData(result.weather_used).map(
                          (entry, idx) => (
                            <Cell
                              key={idx}
                              fill={palette[(idx + 2) % palette.length]}
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CropRecommendation;
