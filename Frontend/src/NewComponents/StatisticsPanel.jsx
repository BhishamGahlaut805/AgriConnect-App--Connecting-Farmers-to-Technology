// components/StatisticsPanel.jsx
import React from "react";

const StatisticsPanel = ({ statistics, videoInfo }) => {
  if (!statistics || !videoInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
          Analysis Results
        </h2>
        <p className="text-gray-600 dark:text-indigo-200">
          No analysis data available. Process a video to see results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
        Field Analysis Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Information */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-200 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Video Information
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">Filename</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {videoInfo.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">Duration</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {videoInfo.duration}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">Resolution</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {videoInfo.resolution}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">
                Total Frames
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {videoInfo.frames}
              </dd>
            </div>
          </dl>
        </div>

        {/* Weed Statistics */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-200 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Weed Analysis
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">
                Total Weeds
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {statistics.totalWeeds}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">
                Average Density
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {statistics.avgDensity}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">
                Maximum Density
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {statistics.maxDensity}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-indigo-200">
                Processing Time
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {statistics.processingTime}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Weed Density Visualization */}
      <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-700 dark:text-indigo-200 mb-3">
          Weed Density Overview
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-indigo-200">
              Field Coverage
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {statistics.avgDensity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className="h-4 bg-indigo-600 rounded-full text-xs text-white flex items-center justify-center transition-all duration-300"
              style={{
                width: `${parseFloat(statistics.avgDensity) || 0}%`,
                maxWidth: "100%",
              }}
            >
              {parseFloat(statistics.avgDensity) > 10
                ? `${parseFloat(statistics.avgDensity).toFixed(1)}%`
                : ""}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-indigo-300">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-indigo-600 dark:text-indigo-300">
          {parseFloat(statistics.avgDensity) < 5
            ? "Your field has low weed pressure. Maintain current management practices."
            : parseFloat(statistics.avgDensity) < 15
            ? "Moderate weed pressure detected. Consider targeted control measures."
            : "High weed pressure detected. Immediate action recommended."}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
