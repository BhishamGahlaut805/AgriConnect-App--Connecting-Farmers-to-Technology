// LiveDetection.jsx
import React, { useState } from "react";

const LiveDetection = ({ isActive, onStart, onStop, frame }) => {
  const [confThres, setConfThres] = useState(0.5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-4">Live Weed Detection</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Detection Sensitivity
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs">Low</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={confThres}
              onChange={(e) => setConfThres(parseFloat(e.target.value))}
              className="w-full"
              disabled={isActive}
            />
            <span className="text-xs">High</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-indigo-200 mt-1">
            Current: {confThres} (higher values = fewer but more confident
            detections)
          </div>
        </div>

        {!isActive ? (
          <button
            onClick={() => onStart(confThres)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
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
            Start Live Detection
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
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
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            Stop Detection
          </button>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-indigo-200">
          <p className="font-medium">How it works:</p>
          <ul className="mt-1 space-y-1">
            <li>• Point your camera at crops</li>
            <li>• AI detects weeds in real-time</li>
            <li>• Green boxes highlight detected weeds</li>
            <li>• Perfect for quick field inspections</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-2">Live Preview</h3>

        {isActive ? (
          frame ? (
            <div className="relative">
              <img
                src={`data:image/jpeg;base64,${frame}`}
                alt="Live detection"
                className="w-full h-auto rounded-md border border-gray-200 dark:border-indigo-800"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                Live
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
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
                <p className="mt-2 text-gray-500 dark:text-indigo-200">
                  Starting camera...
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 4V2m10 2V2M5 6h14M5 18h14M5 12h14m-6 4h2m-2-8h2m-4 0h2m-2 4h2M3 6h1.5a.5.5 0 01.5.5v11a.5.5 0 01-.5.5H3M21 6h-1.5a.5.5 0 00-.5.5v11a.5.5 0 00.5.5H21"
                />
              </svg>
              <p className="mt-2 text-gray-500 dark:text-indigo-200">
                Live preview will appear here
              </p>
              <p className="text-xs text-gray-400">
                Click "Start Live Detection" to begin
              </p>
            </div>
          </div>
        )}

        {isActive && (
          <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-sm">
            <div className="font-medium text-indigo-700 dark:text-indigo-300">
              Detection active
            </div>
            <p className="text-indigo-600 dark:text-indigo-200 mt-1">
              Point your camera at crops to detect weeds in real-time. Green
              boxes indicate detected weeds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDetection;
