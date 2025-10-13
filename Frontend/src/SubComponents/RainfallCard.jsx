import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import * as WeatherService from "../API/WeatherService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RainfallCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const graphContainerRef = useRef(null);

  const formatTimeLabel = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const fetchHourlyWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // First get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Fetch hourly weather data
      const data = await WeatherService.fetchHourlyWeather(latitude, longitude);

      if (!data || !data.hourly) {
        throw new Error("Failed to fetch hourly weather data");
      }

      setHourlyData(data);
    } catch (err) {
      console.error("Error in RainfallCard:", err);
      setError(err.message || "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = () => {
    if (!hourlyData) return { labels: [], datasets: [] };

    const now = new Date();
    const times = hourlyData.hourly.time || [];
    let startIndex = 0;

    for (let i = 0; i < times.length; i++) {
      if (new Date(times[i]) >= now) {
        startIndex = i;
        break;
      }
    }

    const sliceTimes = times.slice(startIndex, startIndex + 24);
    const labels = sliceTimes.map((t) => formatTimeLabel(t));
    const temps =
      hourlyData.hourly.temperature_2m?.slice(startIndex, startIndex + 24) ||
      [];
    const precip =
      hourlyData.hourly.precipitation?.slice(startIndex, startIndex + 24) || [];

    return {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          yAxisID: "y",
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: "Precipitation (mm)",
          data: precip,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          yAxisID: "y1",
          type: "bar",
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "Hourly Temperature & Precipitation",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
              if (context.parsed.y !== null) {
                label +=
                  context.datasetIndex === 0
                    ? `${context.parsed.y}°C`
                    : `${context.parsed.y} mm`;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Temperature (°C)",
        },
        grid: {
          drawOnChartArea: true,
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Precipitation (mm)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  useEffect(() => {
    fetchHourlyWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <i className="bi bi-exclamation-triangle text-3xl mb-2"></i>
        <p>{error}</p>
        <button
          onClick={fetchHourlyWeatherData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 w-full max-w-5xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800 dark:text-gray-100">
          Hourly Temperature & Precipitation
        </h2>
        <div className="w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px]">
          <Line
            data={buildChartData()}
            options={{
              ...chartOptions,
              maintainAspectRatio: false, // makes chart responsive to container
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RainfallCard;
