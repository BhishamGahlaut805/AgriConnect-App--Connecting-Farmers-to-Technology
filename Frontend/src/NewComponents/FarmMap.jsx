import React from "react";

const FarmMap = ({ mapData }) => {
  if (!mapData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <div className="mb-4">
        <h4 className="font-medium">Field Weed Distribution Map</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Red areas show weed concentrations. Green areas indicate healthy
          crops.
        </p>
      </div>
      <div className="flex justify-center">
        <img
          src={mapData}
          alt="Farm weed distribution map"
          className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-700"
        />
      </div>
      <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>Weed Infestation</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>Healthy Crop</span>
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
