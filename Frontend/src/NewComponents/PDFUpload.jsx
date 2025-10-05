// src/components/PDFUpload.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Download,
  BarChart3,
  Database,
} from "lucide-react";
import adminService from "../API/adminAgribot";
import LoadingSpinner from "./LoadingSpinner";

const PDFUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState("general");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  const indexOptions = [
    {
      value: "general",
      label: "General Agriculture",
      description: "General farming knowledge and practices",
      color: "gray",
    },
    {
      value: "diseases",
      label: "Crop Diseases",
      description: "Disease information and treatments",
      color: "red",
    },
    {
      value: "weather",
      label: "Weather Data",
      description: "Weather patterns and forecasts",
      color: "blue",
    },
    {
      value: "news",
      label: "Agricultural News",
      description: "News and market updates",
      color: "green",
    },
    {
      value: "bulletins",
      label: "Bulletins",
      description: "Official advisories and reports",
      color: "purple",
    },
  ];

  useEffect(() => {
    loadUploadedFiles();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await adminService.getUploadedFiles();
      if (result.success) {
        const files = result.data.files || [];
        setStats({
          totalFiles: files.length,
          filesByType: indexOptions.reduce((acc, option) => {
            acc[option.value] = files.filter(
              (f) => f.index_type === option.value
            ).length;
            return acc;
          }, {}),
          totalSize: files.reduce((sum, file) => sum + file.size, 0),
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadResult({
          success: false,
          error: "Please select a PDF file",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setUploadResult({
          success: false,
          error: "File size must be less than 50MB",
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({
        success: false,
        error: "Please select a file first",
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await adminService.uploadPdf(selectedFile, selectedIndex);
      setUploadResult(result);

      if (result.success) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Refresh file list and stats
        loadUploadedFiles();
        loadStats();
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: "Upload failed: " + error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const loadUploadedFiles = async () => {
    setLoadingFiles(true);
    try {
      const result = await adminService.getUploadedFiles();
      if (result.success) {
        setUploadedFiles(result.data.files || []);
      }
    } catch (error) {
      console.error("Failed to load uploaded files:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDeleteFile = async (filename, indexType) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    try {
      const result = await adminService.deleteUploadedFile(filename, indexType);
      if (result.success) {
        setUploadedFiles((prev) =>
          prev.filter(
            (file) =>
              !(file.filename === filename && file.index_type === indexType)
          )
        );
        loadStats();
      } else {
        alert("Delete failed: " + result.error);
      }
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.totalFiles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Files
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatFileSize(stats.totalSize)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Size
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {indexOptions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Index Types
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-xl">
                <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {uploadedFiles.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Uploaded
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload PDF to Knowledge Base</span>
        </h2>

        <div className="space-y-4">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select PDF File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-300"
              />
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <FileText className="h-4 w-4" />
                <span>
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            )}
          </div>

          {/* Index Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Knowledge Base
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {indexOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {
                indexOptions.find((opt) => opt.value === selectedIndex)
                  ?.description
              }
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload & Index PDF</span>
              </>
            )}
          </button>

          {/* Upload Result */}
          {uploadResult && (
            <div
              className={`p-4 rounded-lg border ${
                uploadResult.success
                  ? "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {uploadResult.success ? "Success!" : "Error"}
                </span>
              </div>
              <p className="mt-1 text-sm">
                {uploadResult.success
                  ? uploadResult.data?.message
                  : uploadResult.error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Uploaded PDF Files</span>
          </h2>
          <button
            onClick={loadUploadedFiles}
            disabled={loadingFiles}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <span>{loadingFiles ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {loadingFiles ? (
          <div className="text-center py-8">
            <LoadingSpinner text="Loading files..." />
          </div>
        ) : uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No PDF files uploaded yet</p>
            <p className="text-sm mt-1">Upload your first PDF to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {file.filename}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          file.index_type === "diseases"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : file.index_type === "weather"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : file.index_type === "news"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : file.index_type === "bulletins"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {file.index_type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(file.upload_time)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      window.open(`file://${file.filepath}`, "_blank")
                    }
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                    title="View File"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteFile(file.filename, file.index_type)
                    }
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                    title="Delete File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Total: {uploadedFiles.length} file
            {uploadedFiles.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload;
