import React, { useState, useEffect } from "react";
import { FiInfo, FiDownload, FiPrinter } from "react-icons/fi";
import TextToSpeechControls from "./TextToSpeechControls";
import DiseaseResultCard from "./DiseaseResultCard";

const CropDiseaseResults = ({
  results,
  selectedReport,
  setSelectedReport,
    fetchCropReport,
  downloadReport,
  printReport,
  generateComprehensiveReport,
  setActiveTab
}) => {
  const [ttsContent, setTtsContent] = useState("");

  useEffect(() => {
    if (results && results.length > 0) {
      const content = results
        .map((pred) => {
          const confidence =
            typeof pred.confidence === "number"
              ? pred.confidence
              : parseFloat(pred.confidence?.toString().replace("%", "")) /
                  100 || 0;
          return `${pred.crop || "Unknown Crop"} with ${
            pred.disease ? pred.disease.replace(/_/g, " ") : "Unknown Disease"
          } at ${Math.round(confidence * 100)}% confidence`;
        })
        .join(". ");
      setTtsContent(content);
    }
  }, [results]);

  if (!results || results.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 inline-block mb-4">
          <FiInfo className="h-8 w-8 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Disease Results Found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          No disease detection results to display. Try analyzing some images
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Text-to-Speech Card */}
      <TextToSpeechControls
        content={ttsContent}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700"
      />

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((prediction, index) => {
          const imageSrc =
            prediction.image_url ||
            prediction.image ||
            prediction.image_path ||
            prediction.imageUrl ||
            null;

          return (
            <DiseaseResultCard
              key={index}
              prediction={{
                ...prediction,
                image_url:
                  prediction.image_url ||
                  prediction.imageUrl ||
                  prediction.image_path ||
                  "/placeholder.jpg",
              }}
              onViewDetails={() => fetchCropReport(prediction)} // use fetchCropReport
              setActiveTab={setActiveTab}
            />
          );
        })}
      </div>

      {/* Batch Actions */}
      {results.length > 1 && (
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => downloadReport(generateComprehensiveReport())}
            className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <FiDownload />
            Download All Results
          </button>
          <button
            onClick={printReport}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <FiPrinter />
            Print Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default CropDiseaseResults;
