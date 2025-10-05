// VideoUpload.jsx
import React, { useState, useRef } from "react";
import cropService from "../API/CropWeedService";

const VideoUpload = ({ onUpload, accept, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confThres, setConfThres] = useState(0.5);
  const [alphaFill, setAlphaFill] = useState(0.4);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (cropService.isValidVideoFile(file)) {
        setSelectedFile(file);
      } else {
        alert("Please select a valid video file (MP4, AVI, MOV, MKV, WebM)");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (cropService.isValidVideoFile(file)) {
        setSelectedFile(file);
      } else {
        alert("Please select a valid video file (MP4, AVI, MOV, MKV, WebM)");
      }
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile, confThres, alphaFill);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-indigo-700"
        } transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        <svg
          className="w-12 h-12 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-indigo-200">
            <span className="font-medium text-indigo-600 dark:text-indigo-300">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-indigo-300">
            MP4, AVI, MOV, MKV, WebM (max 500MB)
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-gray-50 dark:bg-indigo-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-indigo-300">
                  {cropService.formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-indigo-200"
              disabled={disabled}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Detection Sensitivity
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs">Low</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={confThres}
                  onChange={(e) => setConfThres(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={disabled}
                />
                <span className="text-xs">High</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-indigo-300 mt-1">
                Current: {confThres} (higher = fewer but more confident
                detections)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mask Transparency
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs">Transparent</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={alphaFill}
                  onChange={(e) => setAlphaFill(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={disabled}
                />
                <span className="text-xs">Opaque</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-indigo-300 mt-1">
                Current: {alphaFill} (affects how detection overlays appear)
              </div>
            </div>

            <button
              onClick={handleUploadClick}
              disabled={disabled}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 px-4 rounded-md flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Start Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
