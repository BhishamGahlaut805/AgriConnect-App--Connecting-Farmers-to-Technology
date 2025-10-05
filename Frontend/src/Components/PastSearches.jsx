// src/components/PastSearches.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiUpload,
  FiInfo,
  FiBook,
  FiXCircle,
} from "react-icons/fi";

import AgriService from "../API/AgriService";
import Message from "./Message";
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

const PastSearches = ({ farmData, userId }) => {
  const [pastSearches, setPastSearches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch past disease reports
  const fetchPastDiseaseReports = useCallback(async () => {
    if (!farmData?.farm_id) return;

    setIsLoading(true);
    setMessage({ type: "info", text: "Loading past analyses..." });

    try {
      const reports = await AgriService.getDiseaseReports(farmData.farm_id);

      const processedReports = reports.map((report) => {
        let safeConfidence = 0;
        if (typeof report.confidence === "string") {
          const match = report.confidence.match(/[\d.]+/);
          if (match) safeConfidence = parseFloat(match[0]) / 100;
        } else if (typeof report.confidence === "number") {
          safeConfidence = report.confidence;
        }

        return {
          id: report._id,
          timestamp: report.timestamp || new Date().toISOString(),
          crop: report.crop || "Unknown Crop",
          disease: report.disease || "Unknown Disease",
          confidence: safeConfidence,
          image_url:
            report.image_url ||
            report.imageUrl ||
            (report.image_path
              ? `${import.meta.env.VITE_BACKEND_FLASK_URL}/static/uploads/${
                  farmData.farm_id
                }/${report.image_path}`
              : "/placeholder.jpg"),
          farmName: report.farm_name || farmData.farm_name,
          recommendations:
            report.recommendations || "No recommendations available",
          symptoms: report.symptoms || "Symptoms not documented",
          treatment: report.treatment || "Treatment not specified",
        };
      });

      const sortedReports = processedReports.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setPastSearches(sortedReports);
      setMessage({ type: "success", text: "Past analyses loaded." });
    } catch (error) {
      console.error("Error fetching past disease reports:", error);
      setMessage({
        type: "error",
        text: `Failed to load past analyses: ${error.message}`,
      });
      setPastSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, [farmData]);

  useEffect(() => {
    fetchPastDiseaseReports();
  }, [fetchPastDiseaseReports]);

  // Fetch detailed crop report
  const fetchCropReport = useCallback(async (basicReport) => {
    setMessage({ type: "info", text: "Fetching detailed report..." });
    try {
      let cropName = basicReport.crop?.replace(/[^a-zA-Z_ ]/g, "") || "Unknown";
      let diseaseName =
        basicReport.disease?.replace(/[^a-zA-Z_]/g, "") || "Unknown";

      if (
        !cropName ||
        typeof cropName !== "string" ||
        cropName.includes("6878")
      ) {
        setMessage({
          type: "error",
          text: "Invalid crop name. Please select a valid crop name.",
        });
        return;
      }

      if (
        !diseaseName ||
        typeof diseaseName !== "string" ||
        diseaseName === "undefined"
      ) {
        setMessage({
          type: "error",
          text: "Disease not identified or invalid.",
        });
        return;
      }

      const detailedReportData = await AgriService.getCropReport({
        crop: cropName,
        disease: diseaseName,
        confidence: basicReport.confidence * 100,
        imageUrl: basicReport.image_url || basicReport.imageUrl,
      });

      let safeConfidence = 0;
      if (typeof detailedReportData.confidence === "string") {
        const match = detailedReportData.confidence.match(/[\d.]+/);
        if (match) safeConfidence = parseFloat(match[0]) / 100;
      } else if (typeof detailedReportData.confidence === "number") {
        safeConfidence = detailedReportData.confidence * 100;
      }

      const fullReport = {
        ...basicReport,
        ...detailedReportData,
        confidence: safeConfidence,
        image_url: basicReport.image_url,
        recommendations:
          detailedReportData.recommendations ||
          (detailedReportData.best_practices?.length > 0
            ? detailedReportData.best_practices
                .map((p) => `• ${p.practice}: ${p.description}`)
                .join("\n")
            : "No recommendations provided."),
        symptoms:
          detailedReportData.symptoms ||
          detailedReportData.favorable_conditions ||
          "No symptoms available.",
        treatment:
          detailedReportData.treatment ||
          (detailedReportData.chemical_pesticides?.length > 0
            ? detailedReportData.chemical_pesticides
                .map((p) => `• ${p.name}: ${p.quantity} (${p.note})`)
                .join("\n")
            : "No treatment information."),
        pathogen: detailedReportData.pathogen || "N/A",
        pathogen_type: detailedReportData.pathogen_type || "N/A",
        spread:
          detailedReportData.spread || "No information on spread available.",
        favorable_conditions:
          detailedReportData.favorable_conditions ||
          "No information on favorable conditions available.",
      };

      setSelectedReport(fullReport);
      setMessage({ type: "success", text: "Detailed report loaded." });
    } catch (error) {
      console.error("Error fetching crop report:", error);
      setMessage({
        type: "error",
        text: `Failed to load report: ${error.message}`,
      });
    }
  }, []);

  // Clear message after timeout
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const filteredPastSearches = pastSearches.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.crop?.toLowerCase().includes(query) ||
      report.disease?.toLowerCase().includes(query) ||
      report.farmName?.toLowerCase().includes(query) ||
      new Date(report.timestamp)
        .toLocaleDateString()
        .toLowerCase()
        .includes(query)
    );
  });

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchPastDiseaseReports();
  };

  if (selectedReport) {
    return (
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Detailed Report
          </h2>
          <button
            onClick={() => setSelectedReport(null)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiXCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <img
              src={selectedReport.image_url}
              alt="Crop disease"
              className="w-full h-64 object-contain rounded"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {selectedReport.crop}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Disease: {selectedReport.disease?.replace(/_/g, " ")}
              </p>
            </div>

            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-300 mr-2">
                Confidence:
              </span>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${Math.round(selectedReport.confidence * 100)}%`,
                  }}
                />
              </div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {Math.round(selectedReport.confidence * 100)}%
              </span>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                Symptoms
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedReport.symptoms}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                Treatment
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedReport.treatment}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                Recommendations
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedReport.recommendations}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Message
        type={message.type}
        message={message.text}
        onDismiss={() => setMessage({ type: "", text: "" })}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Past Disease Analyses
        </h2>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
            placeholder="Search past analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <FiRefreshCw className="animate-spin text-blue-500 text-2xl" />
        </div>
      ) : filteredPastSearches.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 inline-block mb-4">
            <FiInfo className="h-8 w-8 text-blue-600 dark:text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Past Analyses Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchQuery
              ? "No matching analyses found for your search."
              : "You haven't analyzed any images yet."}
          </p>
          <Tooltip text="Upload new images for analysis">
            <button
              onClick={() => (window.location.href = "/analyze")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center mx-auto"
            >
              <FiUpload className="mr-2" />
              Analyze New Images
            </button>
          </Tooltip>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPastSearches.map((report, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer"
              onClick={() => fetchCropReport(report)}
            >
              <img
                src={report.image_url}
                alt={`Crop disease image ${index + 1}`}
                className="w-full h-48 object-cover border-b border-gray-200 dark:border-gray-700"
              />
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {report.crop || "Unknown Crop"}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {report.timestamp
                      ? new Date(report.timestamp).toLocaleDateString("en-IN")
                      : "Unknown Date"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Disease:{" "}
                  <span className="font-medium">
                    {report.disease?.replace(/_/g, " ") || "Unknown Disease"}
                  </span>
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Confidence:
                  </span>
                  <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${Math.round(report.confidence * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <button className="mt-4 w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition">
                  View Detailed Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastSearches;
