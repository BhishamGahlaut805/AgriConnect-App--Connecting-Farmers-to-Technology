// components/ReportGenerator.jsx 
import React, { useState } from "react";
import cropService from "../API/CropWeedService";

const ReportGenerator = ({ results }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const data = await cropService.generateReport();
      setReportData(data);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    // Create a printable version of the report
    const printContent = document.getElementById("report-content").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;

    // Reload the page to restore functionality
    window.location.reload();
  };

  if (!results) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
          Analysis Report
        </h2>
        <p className="text-gray-600 dark:text-indigo-200">
          Complete a video analysis first to generate a report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
          Field Analysis Report
        </h2>
        {reportData && (
          <button
            onClick={downloadReport}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-indigo-200 mb-4">
        Generate a comprehensive report of your field analysis to share with
        your agronomist or keep for records.
      </p>

      {!reportData ? (
        <button
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 px-4 rounded-md flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Report...
            </>
          ) : (
            <>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generate Report
            </>
          )}
        </button>
      ) : (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-md">
          <div id="report-content">
            <div className="mb-4">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">
                Field Analysis Report
              </h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-300">
                Generated on: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-indigo-800 p-3 rounded">
                <h4 className="font-medium text-indigo-700 dark:text-indigo-200 mb-2">
                  Field Video Information
                </h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <span className="font-medium">Filename:</span>{" "}
                    {results.videoInfo?.name || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Duration:</span>{" "}
                    {results.videoInfo?.duration || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Resolution:</span>{" "}
                    {results.videoInfo?.resolution || "N/A"}
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-indigo-800 p-3 rounded">
                <h4 className="font-medium text-indigo-700 dark:text-indigo-200 mb-2">
                  Weed Analysis Summary
                </h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <span className="font-medium">Total Weeds Detected:</span>{" "}
                    {results.statistics?.totalWeeds || 0}
                  </li>
                  <li>
                    <span className="font-medium">Average Density:</span>{" "}
                    {results.statistics?.avgDensity || "0%"}
                  </li>
                  <li>
                    <span className="font-medium">Maximum Density:</span>{" "}
                    {results.statistics?.maxDensity || "0%"}
                  </li>
                </ul>
              </div>
            </div>

            {results.weedTypes && Object.keys(results.weedTypes).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-indigo-700 dark:text-indigo-200 mb-2">
                  Weed Types Identified
                </h4>
                <div className="bg-white dark:bg-indigo-800 p-3 rounded">
                  <ul className="text-sm">
                    {Object.entries(results.weedTypes).map(([type, count]) => (
                      <li
                        key={type}
                        className="flex justify-between py-1 border-b border-indigo-100 dark:border-indigo-700 last:border-b-0"
                      >
                        <span className="capitalize">{type}</span>
                        <span className="font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-indigo-800 p-3 rounded">
              <h4 className="font-medium text-indigo-700 dark:text-indigo-200 mb-2">
                Recommendations
              </h4>
              <ul className="text-sm space-y-1">
                <li>
                  • Consider targeted herbicide application in high-density
                  areas
                </li>
                <li>• Monitor field for weed regrowth in 2-3 weeks</li>
                <li>
                  • Consider crop rotation strategies for long-term weed
                  management
                </li>
                <li>
                  • Consult with your agronomist for specific treatment plans
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setReportData(null)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-md text-sm"
            >
              Close
            </button>
            <button
              onClick={downloadReport}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Print Report
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
