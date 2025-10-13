import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CropDiseaseResults from "../../Components/CropDiseaseResults";
import DetailedReportCard from "../../Components/DetailedReport";
import AgriService from "../../API/AgriService";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const CropDiseaseResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, farmData, modelType } = location.state || {};

  const [state, setState] = useState({
    selectedReport: null,
    activeTab: "results",
    message: { type: "", text: "" },
  });

  const updateState = useCallback((newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // If no result data, redirect back to upload page
  if (!result) {
    navigate("/crop-disease");
    return null;
  }

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
      const reportData = sourceData || state.selectedReport || result;
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
            recommendations: reportData.recommendations,
            symptoms: reportData.symptoms,
            treatment: reportData.treatment,
          },
        ];
      } else if (reportData.results) {
        findings = reportData.results.map((pred) => ({
          crop: pred.crop,
          disease: pred.disease,
          confidence: parseFloat(pred.confidence) * 100 || 0,
          image_url: pred.image_url || pred.image_path || pred.imageUrl,
          recommendations: pred.recommendations,
          symptoms: pred.symptoms,
          treatment: pred.treatment,
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
          modelType: modelType || "Unspecified Model",
        },
        findings: formattedFindings,
        farmDetails: farmData
          ? {
              name: `(Farm Name): ${farmData.farm_name}`,
              id: `ID: ${farmData.farm_id}`,
              location: `स्थान (Location): ${
                farmData.latitude?.toFixed(4) || "N/A"
              }, ${farmData.longitude?.toFixed(4) || "N/A"}`,
            }
          : null,
      };
    },
    [state.selectedReport, result, farmData, getDiseaseSeverity, modelType]
  );

  return (
    <div className="mt-16 flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-gray-900 dark:to-indigo-950 text-gray-900 dark:text-white font-inter transition-colors duration-300">
      {/* Header */}
      <header className="mt-12 relative min-h-20 display:flex justify-center align-center pt-5 pb-5 shadow-md border-b border-indigo-600 dark:border-violet-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/bg4.png"
            alt="Header Background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/90 via-violet-800/80 to-indigo-700/80 dark:from-violet-950/95 dark:via-indigo-900/90 dark:to-violet-950/90"></div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/crop-disease")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5 text-white" />
            </button>
            <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-md">
              🌿 Analysis Results -AgriConnect Pro
            </h1>
          </div>

          {/* Optional Sub-Icon or Status */}
          <div className="flex items-center space-x-2 text-sm text-indigo-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
            <img
              src="/src/assets/images/environment.gif"
              alt="AI Analysis"
              className="w-6 h-6 object-contain rounded-full"
            />
            <span>AI Processed</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 py-6">
        {state.activeTab === "results" && (
          <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Images Analyzed
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-violet-400 mt-1">
                  {result.total_images || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Diseased Images Found
                </p>
                <p className="text-3xl font-bold text-red-500 dark:text-red-400 mt-1">
                  {result.diseased_images || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Disease Rate
                </p>
                <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-1">
                  {result.total_images > 0
                    ? `${(
                        (result.diseased_images / result.total_images) *
                        100
                      ).toFixed(1)}%`
                    : "0.0%"}
                </p>
              </div>
            </div>

            {/* Results Component */}
            <CropDiseaseResults
              results={result?.results || []}
              selectedReport={state.selectedReport}
              setSelectedReport={(report) =>
                updateState({ selectedReport: report })
              }
              downloadReport={downloadReport}
              printReport={printReport}
              generateComprehensiveReport={generateComprehensiveReport}
              setActiveTab={(tab) => updateState({ activeTab: tab })}
              fetchCropReport={fetchCropReport}
              onBackToUpload={() => navigate("/crop-disease")}
            />
          </div>
        )}

        {state.activeTab === "report" && state.selectedReport && (
          <div className="w-full max-w-4xl mx-auto">
            <DetailedReportCard
              report={state.selectedReport}
              onClose={() => {
                updateState({ selectedReport: null, activeTab: "results" });
              }}
              downloadReport={downloadReport}
              printReport={printReport}
              generateComprehensiveReport={generateComprehensiveReport}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDiseaseResultsPage;
