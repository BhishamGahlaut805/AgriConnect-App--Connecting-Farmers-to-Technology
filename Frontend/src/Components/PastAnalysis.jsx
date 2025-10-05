import React from "react";
import StyledCard from "./StyleCard"; // Re-using your StyledCard component
import { FiSearch, FiDownload, FiPrinter, FiEye } from "react-icons/fi";
import { format } from "date-fns";

// Tooltip component (simple implementation - consistent with FarmerDashboard)
const Tooltip = ({ children, text }) => (
  <div className="relative flex items-center group">
    {children}
    {text && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap dark:bg-gray-200 dark:text-gray-900">
        {text}
      </div>
    )}
  </div>
);

const PastAnalyses = ({
  searchResults,
  searchQuery,
  setSearchQuery,
  handleSearch,
  setSelectedReport,
  downloadReport,
  printReport,
}) => {
  return (
    <div className="space-y-6">
      <StyledCard color="blue">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-amber-100 mb-4">
          Past Analyses
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by crop, disease, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-amber-100 placeholder-gray-500 dark:placeholder-gray-400"
              title="Search your past analysis reports"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
          </div>
          <Tooltip text="Apply search filter">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md flex items-center justify-center"
              title="Search"
            >
              <FiSearch className="mr-2" /> Search
            </button>
          </Tooltip>
        </div>

        {searchResults.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-amber-200 py-8">
            No past analysis reports found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-amber-200">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-amber-200">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-amber-200">
                    Disease
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-amber-200">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-amber-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {searchResults.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-amber-100">
                      {report.timestamp
                        ? format(new Date(report.timestamp), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-amber-100">
                      {report.crop || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-amber-100">
                      {report.disease || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.severity === "High"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : report.severity === "Medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        }`}
                      >
                        {report.severity || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Tooltip text="View full report details">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                        </Tooltip>
                        <Tooltip text="Download report as JSON">
                          <button
                            onClick={() => downloadReport(report)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Download"
                          >
                            <FiDownload size={18} />
                          </button>
                        </Tooltip>
                        <Tooltip text="Print report">
                          <button
                            onClick={() => printReport(report)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Print"
                          >
                            <FiPrinter size={18} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </StyledCard>
    </div>
  );
};

export default PastAnalyses;
