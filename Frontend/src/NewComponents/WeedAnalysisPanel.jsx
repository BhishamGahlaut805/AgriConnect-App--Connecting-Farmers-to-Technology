import React from "react";

const WeedAnalysisPanel = ({ analysis }) => {
  if (!analysis) return null;

  const getSeverityColor = (level) => {
    switch (level) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Field Summary
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-blue-600 dark:text-blue-300">
              Total Weeds Detected
            </div>
            <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {analysis.summary?.total_weeds_detected || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-600 dark:text-blue-300">
              Average Density
            </div>
            <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {analysis.summary?.average_density || "0%"}
            </div>
          </div>
        </div>
      </div>

      {/* Severity Card */}
      <div
        className={`p-4 rounded-lg ${getSeverityColor(
          analysis.summary?.severity_level
        )}`}
      >
        <h4 className="font-medium mb-2">Severity Assessment</h4>
        <div className="text-lg font-bold mb-2">
          {analysis.summary?.severity_level}
        </div>
        <p className="text-sm">{analysis.summary?.recommendation}</p>
      </div>

      {/* Detailed Analysis */}
      {analysis.detailedAnalysis && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Detailed Insights</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Peak Infestation: </span>
              {analysis.detailedAnalysis.peak_infestation}
            </div>
            <div>
              <span className="font-medium">Most Common Weed: </span>
              {analysis.detailedAnalysis.most_common_weed}
            </div>
            <div>
              <span className="font-medium">Time to Peak: </span>
              {analysis.detailedAnalysis.time_to_peak}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeedAnalysisPanel;
