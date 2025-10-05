import React, { useEffect, useState, useRef } from "react";
import {
  FiXCircle,
  FiDownload,
  FiPrinter,
  FiImage,
  FiAlertTriangle,
  FiInfo,
  FiGlobe,
  FiVolume2,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";

const DetailedReportCard = ({
  report,
  onClose,
  downloadReport,
  printReport,
  generateComprehensiveReport,
}) => {
  const [language, setLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const reportRef = useRef(null);
  const confidence = report?.confidence || 0;

  // Section-wise TTS content
  const ttsSections = {
    overview: {
      en: `Crop: ${report?.crop || "Unknown"}. Disease: ${
        report?.disease?.replace(/_/g, " ") || "Unknown"
      }. Confidence: ${Math.round(confidence * 100)} percent.`,
      hi: `फसल: ${report?.crop || "अज्ञात"}. रोग: ${
        report?.disease?.replace(/_/g, " ") || "अज्ञात"
      }. विश्वास स्तर: ${Math.round(confidence * 100)} प्रतिशत.`,
    },
    symptoms: {
      en: report?.symptoms || "No symptoms information available.",
      hi: report?.symptoms
        ? report.symptoms
        : "कोई लक्षण जानकारी उपलब्ध नहीं है।",
    },
    treatment: {
      en: report?.treatment || "No treatment information available.",
      hi: report?.treatment
        ? report.treatment
        : "कोई उपचार जानकारी उपलब्ध नहीं है।",
    },
    recommendations: {
      en: report?.recommendations || "No specific recommendations available.",
      hi: report?.recommendations
        ? report.recommendations
        : "कोई विशिष्ट सिफारिशें उपलब्ध नहीं हैं।",
    },
    prevention: {
      en: report?.prevention || "No prevention measures specified.",
      hi: report?.prevention
        ? report.prevention
        : "कोई रोकथाम उपाय निर्दिष्ट नहीं किया गया है।",
    },
  };

  // Handle translation
  const handleTranslate = () => {
    if (!window.google || !window.google.translate) {
      console.error("Google Translate API not loaded");
      return;
    }

    setIsTranslating(true);
    const newLanguage = language === "en" ? "hi" : "en";
    setLanguage(newLanguage);

    if (reportRef.current) {
      window.google.translate.translateElement(
        reportRef.current,
        newLanguage,
        "en",
        () => setIsTranslating(false)
      );
    }
  };

  // Load Google Translate API
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {};

    return () => {
      document.body.removeChild(script);
      delete window.googleTranslateElementInit;
    };
  }, []);

  if (
    !report ||
    typeof report !== "object" ||
    !report.crop ||
    !report.disease
  ) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto overflow-hidden p-6 text-center">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 inline-block mb-4">
          <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Cannot generate report
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Invalid or incomplete report data. Please try again.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  const severity =
    confidence > 0.8 ? "High" : confidence > 0.5 ? "Medium" : "Low";
  const severityColor = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200",
  };

  // TTS Player Component for each section
  const TTSSectionPlayer = ({ content, className = "" }) => (
    <button
      onClick={() => {
        const utterance = new SpeechSynthesisUtterance(content[language]);
        utterance.lang = language === "en" ? "en-US" : "hi-IN";
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }}
      className={`p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${className}`}
      data-tooltip-id="tts-tooltip"
      data-tooltip-content="Listen to this section"
    >
      <FiVolume2 size={14} />
    </button>
  );

  return (
    <div
      ref={reportRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Crop Disease Report</h2>
          <Tooltip
            anchorSelect=".report-info-tooltip"
            place="right"
            className="!bg-gray-800 !text-xs !py-1 !px-2 !max-w-xs"
          >
            Detailed analysis of your crop disease with recommendations
          </Tooltip>
          <FiInfo
            className="report-info-tooltip text-white/80 hover:text-white cursor-help"
            size={18}
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm px-3 py-1 rounded-full bg-white/10"
            data-tooltip-id="translate-tooltip"
          >
            <FiGlobe size={16} />
            <span>{language === "en" ? "हिंदी" : "English"}</span>
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <FiXCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Card */}
        <div className="bg-gray-50 dark:bg-gray-700/20 border border-gray-200 dark:border-gray-600 rounded-lg p-4 col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Crop Image
            </h3>
          </div>
          {report.image_url || report.imageUrl || report.image_path ? (
            <div className="relative group h-64 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
              <img
                src={report.image_url || report.imageUrl || report.image_path}
                alt={report.crop}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                  onClick={() =>
                    window.open(
                      report.image_url || report.imageUrl || report.image_path,
                      "_blank"
                    )
                  }
                >
                  <FiImage size={14} /> View Full Image
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-center items-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md">
              <FiImage className="text-4xl mb-2" />
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Overview Card */}
        <div className="bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Overview
            </h3>
            <TTSSectionPlayer content={ttsSections.overview} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Crop
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {report.crop}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Disease
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {report.disease.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Confidence
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <div
              className={`mt-4 p-2 rounded-md text-center ${severityColor[severity]}`}
            >
              Severity: {severity}
            </div>
          </div>
        </div>

        {/* Symptoms Card */}
        <div className="bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Symptoms
            </h3>
            <TTSSectionPlayer content={ttsSections.symptoms} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {report.symptoms || "No symptoms information available."}
          </p>
        </div>

        {/* Treatment Card */}
        <div className="bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Treatment
            </h3>
            <TTSSectionPlayer content={ttsSections.treatment} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {report.treatment || "No treatment information available."}
          </p>
        </div>

        {/* Recommendations Card */}
        <div className="bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Recommendations
            </h3>
            <TTSSectionPlayer content={ttsSections.recommendations} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {report.recommendations || "No specific recommendations available."}
          </p>
        </div>

        {/* Prevention Card */}
        {report.prevention && (
          <div className="bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm md:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Prevention
              </h3>
              <TTSSectionPlayer content={ttsSections.prevention} />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {report.prevention}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-end gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => downloadReport(generateComprehensiveReport(report))}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <FiDownload />
          Download
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={printReport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <FiPrinter />
          Print
        </motion.button>
      </div>

      <Tooltip
        id="translate-tooltip"
        place="top"
        effect="solid"
        className="!bg-gray-800 !text-xs !py-1 !px-2"
      >
        Translate to {language === "en" ? "Hindi" : "English"}
      </Tooltip>
      <Tooltip
        id="tts-tooltip"
        place="top"
        effect="solid"
        className="!bg-gray-800 !text-xs !py-1 !px-2"
      />
    </div>
  );
};

export default DetailedReportCard;
