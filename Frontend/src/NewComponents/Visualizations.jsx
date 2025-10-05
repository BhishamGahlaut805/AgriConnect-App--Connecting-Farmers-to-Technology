// Enhanced Visualizations.jsx
import React from "react";

const Visualizations = ({
  densityGraph,
  countGraph,
  spatialMap,
  weedDistribution,
  timeAnalysis,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {densityGraph && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-center">
            Weed Density Over Time
          </h4>
          <img
            src={densityGraph}
            alt="Weed density graph"
            className="w-full h-auto"
          />
        </div>
      )}

      {countGraph && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-center">Weed Count Over Time</h4>
          <img
            src={countGraph}
            alt="Weed count graph"
            className="w-full h-auto"
          />
        </div>
      )}

      {spatialMap && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-center">Weed Heat Map</h4>
          <img
            src={spatialMap}
            alt="Weed spatial map"
            className="w-full h-auto"
          />
        </div>
      )}

      {weedDistribution && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-center">
            Weed Type Distribution
          </h4>
          <img
            src={weedDistribution}
            alt="Weed type distribution"
            className="w-full h-auto"
          />
        </div>
      )}

      {timeAnalysis && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 md:col-span-2">
          <h4 className="font-medium mb-2 text-center">Time-based Analysis</h4>
          <img
            src={timeAnalysis}
            alt="Time analysis"
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};

export default Visualizations;
