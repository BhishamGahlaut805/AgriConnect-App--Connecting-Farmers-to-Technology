import React, { useEffect } from "react";
import {
  FiPlus,
  FiUpload,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiGrid,
  FiImage,
  FiAlertCircle,
  FiHelpCircle,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import ModelOption from "./ModelOption";

const UploadTabContent = ({
  modelType,
  setModelType,
  handleImageChange,
  removeImage,
  fileInputRef,
  triggerFileInput,
  handleSubmit,
  setMessage,
  previews,
  loading,
  images,
  uploadProgress,
  uploadError,
  farmData,
  isDragOver,
  setIsDragOver,
  setSelectedImageModal,
  retryFailedUploads,
  clearImages,
}) => {
  // FIX 1: Clipboard Pasting (for actual image files, not just image URLs)
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
              const newEvent = {
                target: {
                  files: [file],
                },
              };
              handleImageChange(newEvent);
              setMessage({
                type: "success",
                text: "Image pasted from clipboard.",
              });
              return;
            }
          }
        }
        setMessage({
          type: "warning",
          text: "No image found in clipboard.",
        });
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleImageChange, setMessage]);

  // FIX 2: Enhance the drag handlers slightly - Prevent default browser behavior
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Crop Disease Detection
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload images of your crops to detect potential diseases
          </p>
        </div>
        <div className="flex space-x-2 mt-3 md:mt-0">
          {/* The existing clipboard button for URL is kept, but the paste event listener handles image files */}
          <button
            onClick={() =>
              navigator.clipboard
                .readText()
                .then((text) => {
                  if (text.match(/\.(jpeg|jpg|png|webp)$/i)) {
                    setMessage({
                      type: "info",
                      text: "Pasted image URL detected",
                    });
                  } else {
                    setMessage({
                      type: "warning",
                      text: "Clipboard does not contain a valid image URL. Try pasting an image file directly.",
                    });
                  }
                })
                .catch((err) => {
                  setMessage({
                    type: "error",
                    text: "Failed to read clipboard: " + err.message,
                  });
                })
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm flex items-center"
          >
            <FiPlus className="mr-2" /> Paste Image URL
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Model Selector */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white">
              Select AI Model
            </h3>
            <FiHelpCircle
              className="ml-2 text-gray-400 cursor-help"
              data-tooltip-id="model-tooltip"
              data-tooltip-content="Choose the AI model best suited for your crop type."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModelOption
              value="all"
              selected={modelType === "all"}
              onClick={() => setModelType("all")}
              title="General Model"
              description="Works for all common crops"
              icon={<FiGrid className="text-blue-500 mr-2" />}
            />
            <ModelOption
              value="potato"
              selected={modelType === "potato"}
              onClick={() => setModelType("potato")}
              title="Potato Model"
              description="Specialized for potato diseases"
              icon={<FiImage className="text-green-500 mr-2" />}
            />
            <ModelOption
              value="cotton"
              selected={modelType === "cotton"}
              onClick={() => setModelType("cotton")}
              title="Cotton Model"
              description="Specialized for cotton diseases"
              icon={<FiAlertCircle className="text-yellow-500 mr-2" />}
            />
          </div>
        </div>

        {/* Upload Zone */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white">
              Upload Images
            </h3>
            <FiHelpCircle
              className="ml-2 text-gray-400 cursor-help"
              data-tooltip-id="upload-tooltip"
              data-tooltip-content="Upload clear images of crop leaves. Max 10 images, 8MB each."
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver
                ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                : "border-gray-300 dark:border-gray-600 hover:border-green-400 bg-gray-50/50 dark:bg-gray-700/30"
            }`}
            onClick={triggerFileInput}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              // Filter for only image files
              const imageFiles = Array.from(e.dataTransfer.files).filter(
                (file) => file.type.startsWith("image/")
              );
              if (imageFiles.length > 0) {
                const event = {
                  target: { files: imageFiles },
                };
                handleImageChange(event);
              } else {
                setMessage({
                  type: "warning",
                  text: "Only image files are allowed.",
                });
              }
            }}
          >
            <FiUpload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isDragOver ? "Drop your images here" : "Drag & drop images here"}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Supports JPG, PNG, WEBP (max 10 images, 8MB each)
            </p>
          </div>
          <label className="mt-4 relative cursor-pointer bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 rounded-md font-medium text-white px-6 py-3 shadow-md transition-all transform hover:scale-[1.02] flex items-center">
            <span>Browse Files</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleImageChange}
              className="sr-only"
              ref={fileInputRef}
            />
          </label>
          {/* Progress */}
          {loading && uploadProgress > 0 && uploadProgress <= 100 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploading {images.length} file{images.length !== 1 ? "s" : ""}
                  ...
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error */}
          {uploadError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
              <FiAlertCircle className="text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Upload Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {uploadError}
                </p>
                <button
                  onClick={retryFailedUploads}
                  className="mt-2 text-sm text-red-700 dark:text-red-300 hover:underline flex items-center"
                >
                  <FiRefreshCw className="mr-1" /> Retry Upload
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {previews.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Selected Images ({previews.length}/10)
                </h3>
                <button
                  type="button"
                  onClick={clearImages}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center"
                >
                  <FiXCircle className="mr-1" /> Clear All
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                  >
                    <div
                      className="aspect-square overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImageModal(preview)}
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23e5e7eb'%3E%3Crect width='100' height='100'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='12' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage Error%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {preview.name.length > 24
                          ? `${preview.name.substring(0, 20)}...${preview.name
                              .split(".")
                              .pop()}`
                          : preview.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(preview.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 shadow-md"
                      aria-label={`Remove ${preview.name}`}
                    >
                      <FiXCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || images.length === 0 || !farmData}
            className={`px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 flex items-center ${
              loading || images.length === 0 || !farmData
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 transform hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing Images...
              </>
            ) : (
              <>
                <FiSearch className="mr-2" /> Analyze for Diseases
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tooltips */}
      <Tooltip id="model-tooltip" place="top" effect="solid" className="z-50" />
      <Tooltip
        id="upload-tooltip"
        place="top"
        effect="solid"
        className="z-50"
      />
    </div>
  );
};

export default UploadTabContent;
