import React from "react";
import { FiImage } from "react-icons/fi";
import { formatDateTime } from "../utilJs/Format";
const DiseaseResultCard = ({ prediction, onViewDetails }) => {
  const confidence =
    typeof prediction.confidence === "number"
      ? prediction.confidence
      : parseFloat(prediction.confidence?.toString().replace("%", "")) / 100 ||
        0;

  const severity =
    confidence > 0.8 ? "High" : confidence > 0.5 ? "Medium" : "Low";

  const severityColor = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow hover:border-blue-300 dark:hover:border-blue-500">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden relative">
        {prediction.image_url || prediction.imageUrl ? (
          <img
            src={prediction.image_url || prediction.imageUrl}
            alt={prediction.crop || "Crop image"}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center">
            <FiImage className="text-4xl mb-2" />
            <span>No image available</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <p className="text-white text-sm font-medium truncate">
            {prediction.crop || "Unknown Crop"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
            {prediction.disease?.replace(/_/g, " ") || "Unknown Disease"}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${severityColor[severity]}`}
          >
            {severity}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Confidence:
            </span>
            <div className="w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${Math.round(confidence * 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {prediction.timestamp
              ? formatDateTime(prediction.timestamp)
              : formatDateTime(Date.now())}
          </p>
        </div>

        <button
          onClick={() => onViewDetails(prediction)}
          className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
        >
          View Detailed Report
        </button>
      </div>
    </div>
  );
};

export default DiseaseResultCard;
