import React, { useCallback } from "react";
import DetailedReportCard from "../Components/DetailedReport"; // Assuming DetailedReportCard is located here
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

/**
 * DetailedCropReportPage Component
 * This component displays a detailed crop report. It receives the report data
 * and functions for closing, downloading, printing, and generating comprehensive reports
 * as props. It provides a professional layout with a back button.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.report - The detailed crop report object to display.
 * @param {Function} props.onClose - Function to call when the report page should be closed (e.g., go back to results).
 * @param {Function} props.downloadReport - Function to handle downloading the report.
 * @param {Function} props.printReport - Function to handle printing the report.
 * @param {Function} props.generateComprehensiveReport - Function to generate a comprehensive version of the report.
 */
const DetailedCropReportPage = ({
  report,
  onClose,
  downloadReport,
  printReport,
  generateComprehensiveReport,
}) => {
  // Handle the back action, using the provided onClose callback
  const handleBack = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!report) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        No report selected. Please predict or search to view report.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Detailed Crop Report
        </h2>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center shadow-md transition-colors"
          aria-label="Go back to results"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Results
        </button>
      </div>

      {/* Render the DetailedReportCard with the passed report and functions */}
      <DetailedReportCard
        report={report}
        onClose={onClose} // Pass onClose directly for internal card close logic if any
        downloadReport={downloadReport}
        printReport={printReport}
        generateComprehensiveReport={generateComprehensiveReport}
      />
    </div>
  );
};

export default DetailedCropReportPage;
