import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiSearch, FiGrid, FiList } from "react-icons/fi";
import AgriService from "../API/AgriService";
import TextToSpeechControls from "../Components/TextToSpeechControls";
import Pagination from "../Common/Pagination";

const AllReportsSection = ({ farmData }) => {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const reportsPerPage = 10;

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const data = await AgriService.getAllReports();
      setReports(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  const handleSearch = () => {
    const lower = query.toLowerCase();
    const result = reports.filter(
      (r) =>
        r.crop?.toLowerCase().includes(lower) ||
        r.disease?.toLowerCase().includes(lower) ||
        formatDateTime(r).toLowerCase().includes(lower)
    );
    setFiltered(result);
    setCurrentPage(1);
  };

  const getConfidenceDisplay = (val) => {
    if (!val) return "0%";
    const value = parseFloat(val);
    return value > 1 ? `${Math.round(value)}%` : `${Math.round(value * 100)}%`;
  };

  const formatDateTime = (report) => {
    const rawDate = report.timestamp || report.createdAt;
    const date = new Date(rawDate);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  const generateTTSContent = (report) => {
    if (!report) return "";
    return `Report Details. Crop: ${
      report.crop
    }. Disease: ${report.disease?.replace(
      /_/g,
      " "
    )}. Confidence: ${getConfidenceDisplay(report.confidence)}. Pathogen: ${
      report.report?.pathogen || "Not available"
    }. Spread: ${report.report?.spread || "No information"}.`;
  };

  const getImageUrl = (report) => {
    const base = import.meta.env.VITE_BACKEND_FLASK_URL;
    if (report.imageUrl?.startsWith("http")) return report.imageUrl;
    if (report.image_path && farmData?.farm_id) {
      return `${base}/static/uploads/${farmData.farm_id}/${report.image_path}`;
    }
    return "/placeholder.jpg";
  };

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filtered.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filtered.length / reportsPerPage);

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "grid" : "list");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Crop Health Reports
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search reports..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <button
              onClick={toggleViewMode}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {viewMode === "list" ? (
                <>
                  <FiGrid /> Grid View
                </>
              ) : (
                <>
                  <FiList /> List View
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-12">
            <FiRefreshCw className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-12 text-lg">
            No reports found. Try uploading crop data for analysis.
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Disease
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentReports.map((report) => (
                    <tr
                      key={report._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedReport?._id === report._id
                          ? "bg-blue-50 dark:bg-blue-900"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {report.crop || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {report.disease?.replace(/_/g, " ") || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {getConfidenceDisplay(report.confidence)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDateTime(report)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentReports.map((report) => (
              <div
                key={report._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border ${
                  selectedReport?._id === report._id
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {report.crop || "Unknown Crop"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {report.disease?.replace(/_/g, " ") ||
                          "Unknown Disease"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {getConfidenceDisplay(report.confidence)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <img
                      src={getImageUrl(report)}
                      alt="Crop sample"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(report)}
                    </span>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      View Full Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Report View */}
        {selectedReport && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Detailed Report Analysis
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Close
              </button>
            </div>

            <TextToSpeechControls
              content={generateTTSContent(selectedReport)}
              className="mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Basic Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Crop:</span>{" "}
                      {selectedReport.crop}
                    </p>
                    <p>
                      <span className="font-medium">Disease:</span>{" "}
                      {selectedReport.disease?.replace(/_/g, " ")}
                    </p>
                    <p>
                      <span className="font-medium">Confidence:</span>{" "}
                      {getConfidenceDisplay(selectedReport.confidence)}
                    </p>
                    <p>
                      <span className="font-medium">Date Analyzed:</span>{" "}
                      {formatDateTime(selectedReport)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Pathogen Details
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Pathogen:</span>{" "}
                      {selectedReport.report?.pathogen || "Not Available"}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedReport.report?.pathogen_type || "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium">Spread:</span>{" "}
                      {selectedReport.report?.spread || "No information"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Sample Image
                </h4>
                <img
                  src={getImageUrl(selectedReport)}
                  alt="Crop sample"
                  className="w-full max-h-64 object-contain rounded-md border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Recommended Practices
                </h4>
                <ul className="space-y-2">
                  {(selectedReport.report?.best_practices || []).map(
                    (p, idx) => (
                      <li
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                      >
                        <p className="font-medium">{p.practice}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {p.description}
                        </p>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Chemical Pesticides
                </h4>
                <ul className="space-y-2">
                  {(selectedReport.report?.chemical_pesticides || []).map(
                    (p, idx) => (
                      <li
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                      >
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {p.quantity} - {p.note}
                        </p>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Pagination for grid view */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReportsSection;
