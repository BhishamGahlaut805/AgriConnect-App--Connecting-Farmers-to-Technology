import React, { useState, useEffect, useRef, useCallback } from "react";
import AgriService from "../API/AgriService";
import UploadTabContent from "../Components/UploadTabContent"; // Assuming this component handles image uploads
import CropDiseaseResults from "../Components/CropDiseaseResults"; // Assuming this component displays results in card format
import DetailedReportCard from "../Components/DetailedReport"; // For displaying detailed reports
import ImageViewer from "../Components/ImageViewer"; // For image preview modal

import {
  BellIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  XMarkIcon as XIcon,
  ArrowLeftIcon, // Using Heroicon for back button
} from "@heroicons/react/24/outline"; // Using Heroicons for a cleaner look

// Re-importing Fi icons for specific uses if needed in UploadTabContent/CropDiseaseResults
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

// AlertMessage component (consistent with FarmerDashboard)
const AlertMessage = ({ isOpen, title, message, type, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto-disappear after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeClasses = {
    success: "bg-emerald-500 border-emerald-600",
    error: "bg-red-500 border-red-600",
    info: "bg-blue-500 border-blue-600",
    warning: "bg-amber-500 border-amber-600",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white flex items-center space-x-3 transition-all duration-300 ease-in-out transform ${typeClasses[type]}`}
    >
      {type === "success" && <CheckCircleIcon className="h-6 w-6" />}
      {type === "error" && <ShieldExclamationIcon className="h-6 w-6" />}
      {type === "info" && <BellIcon className="h-6 w-6" />}
      {type === "warning" && <ShieldExclamationIcon className="h-6 w-6" />}
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
      >
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

const CropDiseasePage = () => {
  const fileInputRef = useRef(null);
  const [state, setState] = useState({
    images: [],
    previews: [],
    modelType: "all",
    farmData: null,
    result: null, // Holds the prediction results
    loading: false,
    activeTab: "upload", // Start directly on the upload tab
    stats: null,
    user: null,
    coords: { latitude: null, longitude: null },
    searchQuery: "",
    searchResults: [],
    pastSearches: [],
    selectedReport: null, // For detailed report view
    uploadProgress: 0,
    uploadError: null,
    isDragOver: false,
    selectedImageModal: null, // For image preview modal
    message: { type: "", text: "" },
  });

  const [theme, setTheme] = useState("system"); // 'light', 'dark', 'system'

  // Apply theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(isDark ? "dark" : "light");
  }, [theme]);

  // Stable state updater
  const updateState = useCallback((newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const createAnonymousFarm = useCallback(
    async (userId) => {
      try {
        updateState({ loading: true });
        const newFarm = await AgriService.createFarm(userId, "Guest");
        updateState({ farmData: newFarm, loading: false });
      } catch (err) {
        console.error("Farm creation failed:", err);
        updateState({
          loading: false,
          message: { type: "error", text: "Failed to create anonymous farm" },
        });
      }
    },
    [updateState]
  );

  const loadPastSearches = useCallback(
    async (userId) => {
      try {
        const reports = await AgriService.getDiseaseReports(userId);
        const sorted = reports.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        updateState({
          pastSearches: sorted,
          searchResults: sorted,
        });
      } catch (err) {
        console.error("Search history error:", err);
        updateState({
          message: { type: "error", text: "Failed to load past reports" },
        });
      }
    },
    [updateState]
  );

  // Initialize user and farm data
  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem("userDetails");
        const token = localStorage.getItem("LoginToken");

        if (!raw || !token) {
          const guestId = `guest_${Date.now()}`;
          updateState({
            user: { id: guestId, username: "Guest" },
            message: {
              type: "info",
              text: "You're in guest mode. Data will not be saved.",
            },
          });
          await createAnonymousFarm(guestId);
        } else {
          const user = JSON.parse(raw);
          updateState({ user });
          await loadPastSearches(user.id);
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateState({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              },
            });
          },
          (err) => {
            updateState({
              message: {
                type: "warning",
                text: "Location not available. Some features may not work.",
              },
            });
          }
        );
      } catch (err) {
        console.error("Startup error:", err);
        updateState({
          message: {
            type: "error",
            text: "Initialization failed. Please reload.",
          },
        });
      }
    };

    init();
  }, [createAnonymousFarm, loadPastSearches, updateState]);

  // Load farm data when user changes
  useEffect(() => {
    if (!state.user?.id) return;

    const fetchFarmData = async () => {
      try {
        const farm = await AgriService.getFarmData(state.user.id);
        updateState({ farmData: farm });

        if (farm?.farm_id) {
          const statsArray = await AgriService.getFarmStats(farm.farm_id);
          updateState({ stats: statsArray.length > 0 ? statsArray[0] : null });
        }
      } catch (err) {
        console.error("Farm data error:", err);
        updateState({
          message: {
            type: "error",
            text: "Could not fetch your farm data",
          },
        });
      }
    };

    fetchFarmData();
  }, [state.user?.id, updateState]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      state.previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [state.previews]);

  const handleImageChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || e.dataTransfer?.files || []);

      // Clear previous uploads
      state.previews.forEach((preview) => URL.revokeObjectURL(preview.url));

      const validFiles = files.filter(
        (file) =>
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
            file.type
          ) && file.size <= 8 * 1024 * 1024
      );

      if (validFiles.length !== files.length) {
        updateState({
          message: {
            type: "error",
            text: `${
              files.length - validFiles.length
            } file(s) were invalid. Only JPG/PNG/WEBP under 8MB are allowed.`,
          },
        });
      }

      if (validFiles.length === 0) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const newPreviews = validFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }));

      updateState({
        images: validFiles,
        previews: newPreviews,
        uploadError: null,
        uploadProgress: 0,
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [state.previews, updateState]
  );

  const removeImage = useCallback(
    (index) => {
      updateState((prev) => {
        const newImages = [...prev.images];
        const newPreviews = [...prev.previews];

        if (newPreviews[index]?.url) {
          URL.revokeObjectURL(newPreviews[index].url);
        }

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        return {
          images: newImages,
          previews: newPreviews,
          uploadProgress: newImages.length === 0 ? 0 : prev.uploadProgress,
          uploadError: newImages.length === 0 ? null : prev.uploadError,
        };
      });
    },
    [updateState]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!state.images?.length) {
        return updateState({
          message: {
            type: "error",
            text: "Please upload at least one image",
          },
        });
      }

      updateState({ loading: true, uploadProgress: 0 });

      try {
        const prediction = await AgriService.predictCropDisease({
          images: state.images,
          farm_id: state.farmData?.farm_id,
          farm_name: state.farmData?.farm_name,
          latitude: state.farmData?.latitude || state.coords.latitude,
          longitude: state.farmData?.longitude || state.coords.longitude,
          modelType: state.modelType,
        });

        // Cleanup
        state.previews.forEach((p) => URL.revokeObjectURL(p.url));

        updateState({
          result: prediction,
          activeTab: "results", // Switch to results tab
          images: [],
          previews: [],
          loading: false,
          message: {
            type: "success",
            text: `Analyzed ${prediction.total_images} images`,
          },
        });
      } catch (error) {
        console.error("Prediction failed:", error);
        updateState({
          loading: false,
          uploadProgress: 0,
          uploadError: error.message,
          message: {
            type: "error",
            text: error.message.includes("No image files")
              ? "Please select valid image files"
              : error.message,
          },
        });
      }
    },
    [
      state.images,
      state.farmData,
      state.coords,
      state.modelType,
      state.previews,
      updateState,
    ]
  );

  const getDiseaseSeverity = useCallback((confidence) => {
    if (confidence > 0.8) return "High";
    if (confidence > 0.5) return "Medium";
    return "Low";
  }, []);

  const downloadReport = useCallback(
    (reportContent) => {
      if (!reportContent) {
        updateState({
          message: { type: "warning", text: "No report to download." },
        });
        return;
      }

      try {
        const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AgriConnect_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        updateState({
          message: { type: "success", text: "Report downloaded successfully!" },
        });
      } catch (error) {
        console.error("Download error:", error);
        updateState({
          message: { type: "error", text: "Failed to download report." },
        });
      }
    },
    [updateState]
  );

  const printReport = useCallback(() => {
    window.print();
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // This function is for fetching detailed report when clicking on a card
  const fetchCropReport = useCallback(
    async (basicReport) => {
      updateState({
        message: { type: "info", text: "Fetching detailed report..." },
      });
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
          updateState({
            message: {
              type: "error",
              text: "Invalid crop name. Please select a valid crop name.",
            },
          });
          return;
        }

        if (
          !diseaseName ||
          typeof diseaseName !== "string" ||
          diseaseName === "undefined"
        ) {
          updateState({
            message: {
              type: "error",
              text: "Disease not identified or invalid.",
            },
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

        updateState({ selectedReport: fullReport, activeTab: "report" });
        updateState({
          message: { type: "success", text: "Detailed report loaded." },
        });
      } catch (error) {
        console.error("Error fetching crop report:", error);
        updateState({
          message: {
            type: "error",
            text: `Failed to load report: ${error.message}`,
          },
        });
      }
    },
    [updateState]
  );

  const generateComprehensiveReport = useCallback(
    (sourceData = null) => {
      const reportData = sourceData || state.selectedReport || state.result;
      if (!reportData) return null;

      let findings = [];

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
              reportData.recommendations,
            symptoms:
              reportData.symptoms ,
            treatment:
              reportData.treatment
             ,
          },
        ];
      } else if (reportData.results) {
        findings = reportData.results.map((pred) => ({
          crop: pred.crop,
          disease: pred.disease,
          confidence: parseFloat(pred.confidence) * 100 || 0,
          image_url: pred.image_url || pred.image_path || pred.imageUrl,
          recommendations:
            pred.recommendations ,
          symptoms: pred.symptoms ,
          treatment: pred.treatment ,
        }));
      }
      const formattedFindings = findings.map((f, idx) => {
        const confidence = isNaN(f.confidence) ? 0 : parseFloat(f.confidence);
        const roundedConfidence = Math.round(confidence * 100);
        const severity = getDiseaseSeverity(confidence);

        return {
          ...f,
          severity,
          imageUrl: f.image_url,
          readableReport: `
${idx + 1} (Image ${idx + 1})

(Crop): ${f.crop || "(Unknown)"}
(Disease): ${f.disease?.replace(/_/g, " ") || "(Unknown)"}
(Confidence): ${roundedConfidence}% -${severity}
(Symptoms):
${f.symptoms}
(Treatment):
${f.treatment}

(Recommendations):
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
          totalImages: findings.length,
          diseasesDetected: findings.filter(
            (f) => f.disease?.toLowerCase?.() !== "healthy"
          ).length,
          timestamp: `(Report Time): ${timestamp}`,
          modelType: state.modelType || "Unspecified Model",
        },
        findings: formattedFindings,
        farmDetails: state.farmData
          ? {
              name: `(Farm Name): ${state.farmData.farm_name}`,
              id: `ID: ${state.farmData.farm_id}`,
              location: `स्थान (Location): ${
                state.farmData.latitude?.toFixed(4) || "N/A"
              }, ${state.farmData.longitude?.toFixed(4) || "N/A"}`,
            }
          : null,
      };
    },
    [
      state.selectedReport,
      state.result,
      state.farmData,
      getDiseaseSeverity,
      state.modelType,
    ]
  );

  const retryFailedUploads = useCallback(() => {
    // This function would re-trigger uploads for any images that previously failed.
    // For this simplified version, we'll just clear the error and allow re-uploading.
    updateState({
      uploadError: null,
      message: { type: "info", text: "Please re-select images to retry." },
    });
  }, [updateState]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-gray-900 dark:to-indigo-950 text-gray-900 dark:text-white font-inter transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-indigo-700 dark:bg-violet-950 shadow-md border-b border-indigo-600 dark:border-violet-900">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-violet-200">
              Crop Disease Analysis
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Tooltip text="Toggle theme">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-indigo-600 dark:hover:bg-violet-800 relative transition-colors focus:outline-none focus:ring-2 focus:ring-violet-300"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-amber-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-indigo-200" />
                )}
              </button>
            </Tooltip>
            <div className="relative">
              <Tooltip text="View your notifications">
                <button
                  className="p-2 rounded-full hover:bg-indigo-600 dark:hover:bg-violet-800 relative transition-colors focus:outline-none focus:ring-2 focus:ring-violet-300"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5 text-indigo-200 dark:text-violet-300" />
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${
                  state.user?.username || "Guest"
                }&background=random`}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-violet-300 dark:border-violet-400 object-cover"
                title={`Logged in as ${state.user?.username || "Guest"}`}
              />
              <span className="hidden sm:block ml-2 text-sm font-medium text-violet-100 dark:text-violet-200">
                {state.user?.username || "Guest"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area, adjusted for margins and responsiveness */}
      <div
        className={`flex flex-col flex-1 overflow-y-auto mt-16 px-4 md:px-6 py-6 space-y-6 transition-all duration-300 ease-in-out items-center`}
      >
        <AlertMessage
          isOpen={state.message.text !== ""}
          title={state.message.type === "success" ? "Success" : "Error"}
          message={state.message.text}
          type={state.message.type}
          onClose={() => updateState({ message: { type: "", text: "" } })}
        />

        {/* Image Preview Modal */}
        {state.selectedImageModal && (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Image Preview: {state.selectedImageModal.name}
                </h3>
                <button
                  onClick={() => updateState({ selectedImageModal: null })}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-auto">
                <ImageViewer
                  src={state.selectedImageModal.url}
                  alt="Selected crop image"
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditional Rendering of Upload or Results */}
        {state.activeTab === "upload" && (
          <div className="w-full max-w-4xl mx-auto">
            {" "}
            {/* Centering the upload content */}
            <UploadTabContent
              modelType={state.modelType}
              setModelType={(newType) => updateState({ modelType: newType })}
              handleImageChange={handleImageChange}
              removeImage={removeImage}
              fileInputRef={fileInputRef}
              triggerFileInput={triggerFileInput}
              handleSubmit={handleSubmit}
              setMessage={(type, text) =>
                updateState({ message: { type, text } })
              }
              previews={state.previews}
              loading={state.loading}
              images={state.images}
              uploadProgress={state.uploadProgress}
              uploadError={state.uploadError}
              farmData={state.farmData}
              isDragOver={state.isDragOver}
              setIsDragOver={(isOver) => updateState({ isDragOver: isOver })}
              setSelectedImageModal={(modal) =>
                updateState({ selectedImageModal: modal })
              }
              retryFailedUploads={retryFailedUploads}
            />
          </div>
        )}

        {state.activeTab === "results" && state.result && (
          <div className="w-full max-w-6xl mx-auto space-y-6">
            {" "}
            {/* Centering results content */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Analysis Results
              </h2>
              <button
                onClick={() =>
                  updateState({
                    activeTab: "upload",
                    result: null,
                    selectedReport: null,
                  })
                }
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center shadow-md transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Upload
              </button>
            </div>
            {/* Professional display of statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Images Analyzed
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-violet-400 mt-1">
                  {state.result.total_images || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Diseased Images Found
                </p>
                <p className="text-3xl font-bold text-red-500 dark:text-red-400 mt-1">
                  {state.result.diseased_images || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Disease Rate
                </p>
                <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-1">
                  {state.result.total_images > 0
                    ? `${(
                        (state.result.diseased_images /
                          state.result.total_images) *
                        100
                      ).toFixed(1)}%`
                    : "0.0%"}
                </p>
              </div>
            </div>
            <CropDiseaseResults
              results={state.result?.results || []}
              selectedReport={state.selectedReport}
              setSelectedReport={(report) =>
                updateState({ selectedReport: report })
              }
              downloadReport={downloadReport}
              printReport={printReport}
              generateComprehensiveReport={generateComprehensiveReport}
              setActiveTab={(tab) => updateState({ activeTab: tab })}
              fetchCropReport={fetchCropReport}
              onBackToUpload={() =>
                updateState({
                  activeTab: "upload",
                  result: null,
                  selectedReport: null,
                })
              }
            />
          </div>
        )}

        {state.activeTab === "report" && state.selectedReport ? (
          <div className="w-full max-w-4xl mx-auto">
            {" "}
            {/* Centering detailed report */}
            <DetailedReportCard
              report={state.selectedReport}
              onClose={() => {
                updateState({ selectedReport: null, activeTab: "results" }); // Go back to results list
              }}
              downloadReport={downloadReport}
              printReport={printReport}
              generateComprehensiveReport={generateComprehensiveReport}
            />
          </div>
        ) : (
          state.activeTab === "report" &&
          !state.selectedReport && (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
              No report selected. Please predict or search to view report.
            </div>
          )
        )}

        {/* If no result and not on upload tab, show a message or redirect */}
        {state.activeTab !== "upload" &&
          state.activeTab !== "results" &&
          state.activeTab !== "report" && (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Start a New Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload images to get crop disease predictions.
              </p>
              <button
                onClick={() => updateState({ activeTab: "upload" })}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center mx-auto shadow-md transition-colors"
              >
                <FiUpload className="h-5 w-5 mr-2" />
                Upload Images
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default CropDiseasePage;
