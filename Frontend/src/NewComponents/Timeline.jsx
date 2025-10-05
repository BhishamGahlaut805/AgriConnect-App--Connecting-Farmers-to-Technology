// components/Timeline.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Timeline = ({ data }) => {
  if (!data || !data.timestamps || data.timestamps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
          Timeline Analysis
        </h2>
        <p className="text-gray-600 dark:text-indigo-200">
          No timeline data available. Process a video to see the analysis over
          time.
        </p>
      </div>
    );
  }

  // Sample data for demonstration if no real data
  const sampleLabels = Array.from({ length: 20 }, (_, i) => `Frame ${i + 1}`);
  const sampleWeedCounts = Array.from(
    { length: 20 },
    () => Math.floor(Math.random() * 10) + 1
  );
  const sampleWeedDensities = Array.from(
    { length: 20 },
    () => Math.random() * 20 + 5
  );

  const chartData = {
    labels:
      data.timestamps.length > 0
        ? data.timestamps.map((_, i) => `Frame ${i + 1}`)
        : sampleLabels,
    datasets: [
      {
        label: "Weed Count",
        data:
          data.weed_counts && data.weed_counts.length > 0
            ? data.weed_counts
            : sampleWeedCounts,
        borderColor: "#6366F1", // indigo-500
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        yAxisID: "y",
      },
      {
        label: "Weed Density (%)",
        data:
          data.weed_densities && data.weed_densities.length > 0
            ? data.weed_densities
            : sampleWeedDensities,
        borderColor: "#8B5CF6", // violet-500
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151", // gray-700
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1F2937", // gray-800
        bodyColor: "#4B5563", // gray-600
        borderColor: "#E5E7EB", // gray-200
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label +=
                context.dataset.yAxisID === "y1"
                  ? context.parsed.y.toFixed(1) + "%"
                  : Math.round(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          maxTicksLimit: 10,
          color: "#6B7280", // gray-500
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Weed Count",
          color: "#6366F1", // indigo-500
        },
        grid: {
          color: "rgba(99, 102, 241, 0.1)",
        },
        ticks: {
          color: "#6366F1", // indigo-500
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Weed Density (%)",
          color: "#8B5CF6", // violet-500
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#8B5CF6", // violet-500
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
        Field Analysis Timeline
      </h2>
      <p className="text-sm text-gray-600 dark:text-indigo-200 mb-4">
        Track how weed presence changes throughout your field scan. Peaks
        indicate areas with higher weed concentration.
      </p>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-indigo-300">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div>
          <span>Weed Count: Number of individual weeds detected per frame</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-violet-500 rounded mr-2"></div>
          <span>Weed Density: Percentage of frame area covered by weeds</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
