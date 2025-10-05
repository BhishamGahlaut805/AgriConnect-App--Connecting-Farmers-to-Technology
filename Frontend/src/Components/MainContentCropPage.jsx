import React, { useState, useEffect, useCallback } from "react";
import {
  FiUpload,
  FiImage,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiDownload,
  FiPrinter,
  FiBook,
  FiArrowLeft,
  FiRefreshCw,
  FiPlus,
  FiBarChart,
} from "react-icons/fi";
import AgriService from "../API/AgriService";
import UploadTabContent from "../Components/UploadTabContent";
import Message from "../Components/Message";
import ImageViewer from "../Components/ImageViewer";
import DetailedReportCard from "../Components/DetailedReport";
import CropDiseaseResults from "../Components/CropDiseaseResults";
import AllReportsSection from "./AllReports";

const MainContent = ({
  userId,
  username,
  activeTab,
  setActiveTab,
  modelType,
  setModelType,
  farmData,
  stats,
  searchResults,
  selectedReport,
  setSelectedReport,
  images,
  previews,
  uploadProgress,
  uploadError,
  loading,
  result,
  isDragOver,
  setIsDragOver,
  selectedImageModal,
  setSelectedImageModal,
  handleImageChange,
  removeImage,
  fileInputRef,
  triggerFileInput,
  handleSubmit,
  getDiseaseSeverity,
  printReport,
  downloadReport,
  searchQuery,
  setSearchQuery,
  handleSearch,
  retryFailedUploads,
}) => {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [localPastSearches, setLocalPastSearches] = useState([]);
  const [isFetchingReports, setIsFetchingReports] = useState(false);

  // Load selectedReport from localStorage on component mount
useEffect(() => {
  const cachedReport = localStorage.getItem("latestReport");
  if (cachedReport) {
    setSelectedReport(JSON.parse(cachedReport));
  }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // Save selectedReport to localStorage whenever it changes
  useEffect(() => {
    if (selectedReport) {
      localStorage.setItem("latestReport", JSON.stringify(selectedReport));
    } else {
      localStorage.removeItem("latestReport");
    }
  }, [selectedReport]);

  // Clear message after timeout
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch past disease reports
  const fetchPastDiseaseReports = useCallback(async () => {
    if (activeTab === "searches" && farmData?.farm_id) {
      setIsFetchingReports(true);
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

        setLocalPastSearches(sortedReports);
        setMessage({ type: "success", text: "Past analyses loaded." });
      } catch (error) {
        console.error("Error fetching past disease reports:", error);
        setMessage({
          type: "error",
          text: `Failed to load past analyses: ${error.message}`,
        });
        setLocalPastSearches([]);
      } finally {
        setIsFetchingReports(false);
      }
    }
  }, [activeTab, farmData]);

  useEffect(() => {
    fetchPastDiseaseReports();
  }, [fetchPastDiseaseReports]);

  // Fetch detailed crop report
  const fetchCropReport = useCallback(
    async (basicReport) => {
      setMessage({ type: "info", text: "Fetching detailed report..." });
      try {
        let cropName =
          basicReport.crop?.replace(/[^a-zA-Z_ ]/g, "") || "Unknown";
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
          confidence: basicReport.confidence*100,
          imageUrl: basicReport.image_url || basicReport.imageUrl,
        });
        console.log("Basic report data Current DEBUG :", basicReport);
        console.log("Detailed report data Current DEBUG :", detailedReportData);
        let safeConfidence = 0;
        if (typeof detailedReportData.confidence === "string") {
          const match = detailedReportData.confidence.match(/[\d.]+/);
          if (match) safeConfidence = parseFloat(match[0]) / 100;
        } else if (typeof detailedReportData.confidence === "number") {
          safeConfidence = detailedReportData.confidence*100;
        }

        const fullReport = {
          ...basicReport,
          ...detailedReportData,
          confidence: safeConfidence,
          image_url:
            basicReport.image_url,
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
        setActiveTab("report");
        setMessage({ type: "success", text: "Detailed report loaded." });
      } catch (error) {
        console.error("Error fetching crop report:", error);
        setMessage({
          type: "error",
          text: `Failed to load report: ${error.message}`,
        });
      }
    },
    [setActiveTab, setSelectedReport]
  );
  const generateComprehensiveReport = useCallback(
    (sourceData = null) => {
      const reportData = sourceData || selectedReport || result;
      // console.log("Generating comprehensive report from data:", reportData);
      if (!reportData) return null;

      let findings = [];

      // 🌱 Determine single report or batch
      if (reportData.id || reportData.crop) {
        findings = [
          {
            crop: reportData.crop,
            disease: reportData.disease,
            confidence: parseFloat(reportData.confidence) || 0,
            image_url:
              reportData.image_url ||
              reportData.imageUrl ||
              reportData.image_path,
            recommendations:
              reportData.recommendations ||
              "कोई सिफारिश उपलब्ध नहीं है। (No recommendations available.)",
            symptoms:
              reportData.symptoms ||
              "लक्षण नहीं दिए गए हैं। (Symptoms not provided.)",
            treatment:
              reportData.treatment ||
              "उपचार जानकारी नहीं है। (Treatment info unavailable.)",
          },
        ];
      } else if (reportData.results) {
        findings = reportData.results.map((pred) => ({
          crop: pred.crop,
          disease: pred.disease,
          confidence: parseFloat(pred.confidence)*100 || 0,
          image_url: pred.image_url || pred.image_path || pred.imageUrl,
          recommendations:
            pred.recommendations || "कोई सिफारिश उपलब्ध नहीं है।",
          symptoms: pred.symptoms || "लक्षण उपलब्ध नहीं हैं।",
          treatment: pred.treatment || "उपचार जानकारी नहीं है।",
        }));
      }

      const friendlyIntro = `🌾 नमस्ते किसान मित्र!

आपकी फ़सल की बीमारी पहचान रिपोर्ट तैयार हो गई है। नीचे आपको रोग का विवरण, सटीकता स्तर, लक्षण, और उचित उपचार की जानकारी दी जा रही है।

🧑‍🌾 Hello Farmer!

Your crop disease diagnosis report is ready. Below you'll find details on the detected diseases, confidence level, symptoms, and treatment suggestions.

--------------------------------------------------`;

      // 🔍 Format each finding
      const formattedFindings = findings.map((f, idx) => {
        const confidence = isNaN(f.confidence) ? 0 : parseFloat(f.confidence);
        const roundedConfidence = Math.round(confidence * 100);
        const severity = getDiseaseSeverity(confidence);

        return {
          ...f,
          severity,
          imageUrl: f.image_url,
          readableReport: `
🌿 छवि ${idx + 1} (Image ${idx + 1})

🧪 फसल (Crop): ${f.crop || "अनजान (Unknown)"}
🦠 रोग (Disease): ${f.disease?.replace(/_/g, " ") || "अनजान (Unknown)"}
🎯 सटीकता (Confidence): ${roundedConfidence}% - गंभीरता: ${severity}
⚠️ लक्षण (Symptoms):
${f.symptoms}

💊 उपचार (Treatment):
${f.treatment}

📋 सुझाव (Recommendations):
${f.recommendations}
        `.trim(),
        };
      });

      const timestamp = reportData.timestamp
        ? new Date(reportData.timestamp).toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "short",
          })
        : new Date().toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "short",
          });

      return {
        summary: {
          intro: friendlyIntro,
          totalImages: findings.length,
          diseasesDetected: findings.filter(
            (f) => f.disease?.toLowerCase?.() !== "healthy"
          ).length,
          timestamp: `🕒 रिपोर्ट समय (Report Time): ${timestamp}`,
          modelType: modelType || "Unspecified Model",
        },
        findings: formattedFindings,
        farmDetails: farmData
          ? {
              name: `🚜 खेत का नाम (Farm Name): ${farmData.farm_name}`,
              id: `🆔 खेत ID: ${farmData.farm_id}`,
              location: `📍 स्थान (Location): ${
                farmData.latitude?.toFixed(4) || "N/A"
              }, ${farmData.longitude?.toFixed(4) || "N/A"}`,
            }
          : null,
      };
    },
    [selectedReport, result, farmData, getDiseaseSeverity, modelType]
  );


  const registerFarm = async () => {
    try {
      setMessage({ type: "info", text: "Registering your farm..." });
      const newFarm = await AgriService.createFarm(userId, username);
      setMessage({ type: "success", text: "Farm registered successfully!" });
    } catch (error) {
      console.error("Farm registration error:", error);
      setMessage({
        type: "error",
        text: `Failed to register farm: ${error.message}`,
      });
    }
  };

  const filteredPastSearches = localPastSearches.filter((report) => {
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

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl">
      <div className="max-w-full mx-auto">
        <Message
          type={message.type}
          message={message.text}
          onDismiss={() => setMessage({ type: "", text: "" })}
        />

        {selectedImageModal && (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Image Preview: {selectedImageModal.name}
                </h3>
                <button
                  onClick={() => setSelectedImageModal(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiXCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-auto">
                <ImageViewer
                  src={selectedImageModal.url}
                  alt="Selected crop image"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {farmData ? `${farmData.farm_name} Dashboard` : "Farm Dashboard"}
            </h2>

            {!farmData ? (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 inline-block mb-4">
                  <FiInfo className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Farm Data Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Register your farm to unlock all features and analytics.
                </p>
                <button
                  onClick={registerFarm}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center mx-auto"
                >
                  <FiPlus className="mr-2" />
                  Register Your Farm
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                      <FiInfo className="mr-2" /> Farm Details
                    </h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-300">
                      <p>
                        <strong>Name:</strong> {farmData.farm_name}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {farmData.latitude?.toFixed(4) || "N/A"},{" "}
                        {farmData.longitude?.toFixed(4) || "N/A"}
                      </p>
                    </div>
                  </div>

                  {stats ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                        <FiBarChart className="mr-2" /> Recent Stats
                      </h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>
                          <strong>Total Images:</strong>{" "}
                          {stats.total_images_analyzed || 0}
                        </p>
                        <p>
                          <strong>Diseased Images:</strong>{" "}
                          {stats.diseased_images_found || 0}
                        </p>
                        <p>
                          <strong>Max Risk:</strong>{" "}
                          {stats.max_risk_percent || 0}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <p className="text-gray-600 dark:text-gray-300">
                        Loading stats...
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab("searches")}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FiBook className="mr-2" />
                    View Past Reports
                  </button>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                  >
                    <FiUpload className="mr-2" />
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "allReports" && <AllReportsSection />}

        {activeTab === "upload" && (
          <UploadTabContent
            modelType={modelType}
            setModelType={setModelType}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            fileInputRef={fileInputRef}
            triggerFileInput={triggerFileInput}
            handleSubmit={handleSubmit}
            setMessage={setMessage}
            previews={previews}
            loading={loading}
            images={images}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            farmData={farmData}
            isDragOver={isDragOver}
            setIsDragOver={setIsDragOver}
            setSelectedImageModal={setSelectedImageModal}
            retryFailedUploads={retryFailedUploads}
          />
        )}

        {activeTab === "results" && (
          <CropDiseaseResults
            results={result?.results || []}
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            downloadReport={downloadReport}
            printReport={printReport}
            generateComprehensiveReport={generateComprehensiveReport}
            setActiveTab={setActiveTab}
            fetchCropReport={fetchCropReport}
          />
        )}

        {activeTab === "searches" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Past Disease Analyses
              </h2>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  placeholder="Search past analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {isFetchingReports ? (
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
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center mx-auto"
                >
                  <FiUpload className="mr-2" />
                  Analyze New Images
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPastSearches.map((report, index) => {
                  const imageSrc =
                    report.image_url ||
                    report.imageUrl ||
                    (report.image_path && farmData?.farm_id
                      ? `${
                          import.meta.env.VITE_BACKEND_FLASK_URL
                        }/static/uploads/${farmData.farm_id}/${
                          report.image_path
                        }`
                      : "/placeholder.jpg");

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
                    >
                      <img
                        src={imageSrc}
                        alt={`Crop disease image ${index + 1}`}
                        className="w-full h-48 object-cover border-b border-gray-200 dark:border-gray-700"
                      />
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            🌿 {report.crop || "Unknown Crop"}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📅{" "}
                            {report.timestamp
                              ? new Date(report.timestamp).toLocaleDateString(
                                  "en-IN"
                                )
                              : "Unknown Date"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          🦠{" "}
                          <span className="font-medium">
                            {report.disease?.replace(/_/g, " ") ||
                              "Unknown Disease"}
                          </span>
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            🎯 Confidence:
                          </span>
                          <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-green-500 h-2.5 rounded-full"
                              style={{
                                width: `${Math.round(
                                  report.confidence * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => fetchCropReport(report)}
                          className="mt-4 w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition"
                        >
                          🔍 View Detailed Report
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "report" &&
          (selectedReport ? (
            <DetailedReportCard
              report={selectedReport}
              onClose={() => {
                setSelectedReport(null);
                setActiveTab("searches");
              }}
              downloadReport={downloadReport}
              printReport={printReport}
              generateComprehensiveReport={generateComprehensiveReport}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
              No report selected. Please predict or search to view report.
            </div>
          ))}
      </div>
    </main>
  );
};

export default MainContent;
