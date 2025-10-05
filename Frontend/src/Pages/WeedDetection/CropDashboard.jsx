// CropDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import cropWeedService from "../../API/CropWeedService";
import {
  Camera,
  Video,
  Image,
  Play,
  Square,
  Upload,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Leaf,
  Sprout,
  Trees,
  Info,
  HelpCircle,
  Download,
  Settings,
  User,
  Home,
  History,
  BookOpen,
  Shield,
  Cloud,
  Sun,
  Droplets,
  Thermometer,
} from "lucide-react";
import DetectionDetails from "../../SubComponents/DetectionRes"

const CropDashboard = () => {
  const [activeTab, setActiveTab] = useState("webcam");
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [liveFrame, setLiveFrame] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoStats, setVideoStats] = useState(null);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cropWeedService.stopLiveStream();
      cropWeedService.stopWebcam();
      cropWeedService.stopVideo();
    };
  }, []);

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      setAnalysisStatus("processing");
      setUploadProgress(30);
      setError(null);

      const response = await cropWeedService.uploadImage(file);
      setUploadProgress(70);

      const formattedResults = cropWeedService.formatDetectionResults(response);
      setResults(formattedResults);
      setAnalysisStatus("completed");
      setUploadProgress(100);

      // Auto-switch to image tab
      setActiveTab("image");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.message || "Image upload failed. Please try again.");
      setAnalysisStatus("error");
    }
  };

  // Handle video upload
  const handleVideoUpload = async (file) => {
    try {
      setAnalysisStatus("processing");
      setUploadProgress(30);
      setError(null);

      const response = await cropWeedService.uploadVideo(file);
      setUploadProgress(70);

      // response.video_path is "/static/uploads/filename.mp4"
      const backendVideoPath =
        response.video_path || response.videoPath || response.videoPath;
      setVideoId(backendVideoPath); // keep this to send to startVideo

      // Keep local preview for user
      setUploadedVideoUrl(URL.createObjectURL(file));

      setUploadProgress(100);
      setActiveTab("video");
      setAnalysisStatus("ready");
    } catch (err) {
      console.error("Error uploading video:", err);
      setError(err.message || "Video upload failed. Please try again.");
      setAnalysisStatus("error");
    }
  };

  // Start webcam detection
  const startWebcamDetection = async () => {
    try {
      setAnalysisStatus("starting");
      setError(null);

      await cropWeedService.startWebcam();

      cropWeedService.startLiveStream(
        (frameData) => {
          setLiveFrame(frameData);
          setAnalysisStatus("live");
        },
        (error) => {
          setError("Live stream error: " + error.message);
          setAnalysisStatus("error");
        }
      );
    } catch (err) {
      console.error("Error starting webcam:", err);
      setError(err.message || "Failed to start webcam detection.");
      setAnalysisStatus("error");
    }
  };

  // Stop webcam detection
  const stopWebcamDetection = () => {
    cropWeedService.stopLiveStream();
    cropWeedService.stopWebcam();
    setAnalysisStatus("idle");
    setLiveFrame(null);
  };

  const startVideoPlayback = async () => {
    try {
      setAnalysisStatus("starting");
      setError(null);

      if (!videoId) {
        throw new Error("No video uploaded. Please upload a video first.");
      }

      // pass the path returned by uploadVideo()
      await cropWeedService.startVideo(videoId);

      cropWeedService.startLiveStream(
        (frameData) => {
          setLiveFrame(frameData);
          setAnalysisStatus("playing");
          // Collect detection statistics
          if (frameData.counts) {
            setVideoStats((prev) => {
              if (!prev) {
                return {
                  maxWeedCount: frameData.counts.Weed || 0,
                  maxCottonCount: frameData.counts.Cotton || 0,
                  totalFrames: 1,
                  weedFrames: frameData.counts.Weed > 0 ? 1 : 0,
                  frameData: [frameData],
                };
              }

              return {
                maxWeedCount: Math.max(
                  prev.maxWeedCount,
                  frameData.counts.Weed || 0
                ),
                maxCottonCount: Math.max(
                  prev.maxCottonCount,
                  frameData.counts.Cotton || 0
                ),
                totalFrames: prev.totalFrames + 1,
                weedFrames:
                  prev.weedFrames + (frameData.counts.Weed > 0 ? 1 : 0),
                frameData: [...prev.frameData, frameData].slice(-100), // keep last 100 frames
              };
            });
          }
        },
        (error) => {
          setError("Video playback error: " + error.message);
          setAnalysisStatus("error");
        },
        "video"
      );
    } catch (err) {
      console.error("Error starting video detection:", err);
      setError(err.message || "Failed to start video playback.");
      setAnalysisStatus("error");
    }
  };

  // Stop video playback
  const stopVideoPlayback = () => {
    cropWeedService.stopLiveStream();
    cropWeedService.stopVideo();
    setAnalysisStatus("ready");
    setLiveFrame(null);
  };

  // Reset everything
  const resetAnalysis = () => {
    cropWeedService.stopLiveStream();
    cropWeedService.stopWebcam();
    cropWeedService.stopVideo();
    setAnalysisStatus("idle");
    setResults(null);
    setError(null);
    setLiveFrame(null);
    setUploadProgress(0);
    setUploadedVideoUrl(null);
    setVideoId(null);
    setVideoStats(null);
  };

  // Download results as PDF
  const downloadResults = () => {
    if (!results) return;

    const printContent = `
      <h2>Weed Detection Analysis Report</h2>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <h3>Detection Summary</h3>
      <p>Soil: ${results.counts.Soil || 0}</p>
      <p>Weed: ${results.counts.Weed || 0}</p>
      <p>Cotton: ${results.counts.Cotton || 0}</p>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.print();
  };

  // Render detection statistics
  const renderStatistics = () => {
    if (!results || !results.counts) return null;

    const totalDetections = Object.values(results.counts).reduce(
      (sum, count) => sum + count,
      0
    );
    const weedDensity =
      totalDetections > 0
        ? ((results.counts.Weed || 0) / totalDetections) * 100
        : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-amber-200 dark:border-amber-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full mr-3">
              <Sprout className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Soil
            </h4>
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
            {results.counts.Soil || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Confidence: {(results.confidences.Soil * 100 || 0).toFixed(2)}
          </div>
        </div>

        <div className=" mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-red-200 dark:border-red-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full mr-3">
              <Leaf className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Weed
            </h4>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
            {results.counts.Weed || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Confidence: {(results.confidences.Weed * 100 || 0).toFixed(2)} %
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-green-200 dark:border-green-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-3">
              <Trees className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Cotton
            </h4>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {results.counts.Cotton || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Confidence: {(results.confidences.Cotton * 100 || 0).toFixed(2)} %
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-violet-200 dark:border-violet-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-full mr-3">
              <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Density
            </h4>
          </div>
          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-1">
            {weedDensity.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Weed density in field
          </div>
        </div>
      </div>
    );
  };

  // Render video statistics
  const renderVideoStatistics = () => {
    if (!videoStats) return null;

    const weedPercentage =
      (videoStats.weedFrames / videoStats.totalFrames) * 100;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-violet-200 dark:border-violet-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-full mr-3">
              <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Frames Analyzed
            </h4>
          </div>
          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
            {videoStats.totalFrames}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-red-200 dark:border-red-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full mr-3">
              <Leaf className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Max Weeds
            </h4>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {videoStats.maxWeedCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Highest count in a frame
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-blue-200 dark:border-blue-600">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
              <Trees className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Weed Prevalence
            </h4>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {weedPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Frames with weeds
          </div>
        </div>
      </div>
    );
  };

  // Render graphs
  const renderGraphs = () => {
    if (!results || !results.graphs) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-violet-600 dark:text-violet-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Analysis Graphs
            </h3>
          </div>
          <button
            onClick={downloadResults}
            className="flex items-center px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>
        <img
          src={`data:image/png;base64,${results.graphs}`}
          alt="Detection analysis graphs"
          className="w-full h-auto rounded-lg shadow-sm"
        />
      </div>
    );
  };

  // Render live video frame
  const renderLiveFrame = () => {
    if (!liveFrame) return null;

    const totalDetections = Object.values(liveFrame.counts).reduce(
      (sum, count) => sum + count,
      0
    );
    const weedDensity =
      totalDetections > 0
        ? ((liveFrame.counts.Weed || 0) / totalDetections) * 100
        : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="relative">
          <img
            src={`data:image/jpeg;base64,${liveFrame.image}`}
            alt="Live detection"
            className="w-full h-auto max-h-96 object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
              <span className="mb-2 sm:mb-0">FPS: {liveFrame.fps}</span>
              <div className="flex space-x-4 mb-2 sm:mb-0">
                <span className="text-amber-300">
                  🌱 Soil: {liveFrame.counts.Soil || 0}
                </span>
                <span className="text-red-300">
                  🌿 Weed: {liveFrame.counts.Weed || 0}
                </span>
                <span className="text-green-300">
                  🌾 Cotton: {liveFrame.counts.Cotton || 0}
                </span>
              </div>
              <span className="text-violet-300 font-semibold">
                Weed Density: {weedDensity.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render file upload section
  const renderUploadSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-blue-200 dark:border-blue-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Upload Image
            </h3>
            <div
              className="ml-2 tooltip"
              data-tip="Supported formats: JPG, PNG, BMP. Max size: 10MB"
            >
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload an image for weed detection analysis
          </p>
          <label className="block">
            <span className="sr-only">Choose image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
              disabled={analysisStatus === "processing"}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-900 dark:file:text-violet-300"
            />
          </label>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-purple-200 dark:border-purple-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
              <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Upload Video
            </h3>
            <div
              className="ml-2 tooltip"
              data-tip="Supported formats: MP4, AVI, MOV. Max size: 100MB"
            >
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload a video for real-time weed detection
          </p>
          <label className="block">
            <span className="sr-only">Choose video</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  handleVideoUpload(e.target.files[0]);
                }
              }}
              disabled={analysisStatus === "processing"}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-900 dark:file:text-violet-300"
            />
          </label>
        </div>
      </div>

      {analysisStatus === "processing" && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <RefreshCw className="h-5 w-5 text-violet-600 dark:text-violet-400 animate-spin mr-2" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Processing Upload
              </h3>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-right">
              {uploadProgress}% Complete
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render image preview (original vs annotated)
  // Render image preview (original vs annotated)
  const renderImagePreview = () => {
    if (!results || (!results.imageUrl && !results.annotatedImage)) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Image Preview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Original Image
            </p>
            <img
              src={results.imageUrl}
              alt="Original Upload"
              className="w-full rounded-lg shadow-lg object-contain border-4 border-blue-500 hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Annotated Image */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Detection Result
            </p>
            <img
              src={results.annotatedImage}
              alt="Annotated Result"
              className="w-full rounded-lg shadow-lg object-contain border-4 border-green-500 hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render webcam section
  const renderWebcamSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Camera className="h-6 w-6 text-violet-600 dark:text-violet-400 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Webcam Detection
          </h3>
          <div
            className="ml-2 tooltip"
            data-tip="Real-time weed detection using your webcam"
          >
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Use your webcam for real-time weed detection in cotton fields
        </p>

        <div className="flex space-x-4">
          <button
            onClick={startWebcamDetection}
            disabled={
              analysisStatus === "live" || analysisStatus === "starting"
            }
            className="flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Webcam
          </button>
          <button
            onClick={stopWebcamDetection}
            disabled={analysisStatus !== "live"}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Webcam
          </button>
        </div>
      </div>

      {renderLiveFrame()}
    </div>
  );

  // Render video section
  const renderVideoSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Video className="h-6 w-6 text-violet-600 dark:text-violet-400 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Video Analysis
          </h3>
        </div>

        {uploadedVideoUrl && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              Uploaded Video & Detection Preview
            </h4>

            {/* Grid for side-by-side video display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Uploaded Video */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Original Video
                </p>
                <video
                  ref={videoRef}
                  src={uploadedVideoUrl}
                  controls
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              {/* Annotated Live Video (streamed frames) */}
              {analysisStatus === "playing" ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Detection Preview
                  </p>
                  <div className="w-full rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-black">
                    {liveFrame ? (
                      <img
                        src={`data:image/jpeg;base64,${liveFrame.image}`}
                        alt="Detection Frame"
                        className="w-full object-contain"
                      />
                    ) : (
                      <p className="text-gray-500">Waiting for detections...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg h-64">
                  <p className="text-gray-500">
                    Start detection to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {analysisStatus === "playing" ? (
          <>
            {renderVideoStatistics()}
            <div className="flex space-x-4">
              <button
                onClick={stopVideoPlayback}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Detection
              </button>
            </div>
          </>
        ) : (
          <>
            {analysisStatus === "ready" && uploadedVideoUrl && (
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={startVideoPlayback}
                  className="flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Detection
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Render sidebar
  const renderSidebar = () => (
    <div
      className={`fixed top-0 left-0 h-full w-64
      bg-gradient-to-b from-violet-600 via-indigo-600 to-blue-700
      dark:from-violet-800 dark:via-indigo-800 dark:to-blue-900
      text-white shadow-xl transform transition-transform duration-300 z-50
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold tracking-wide">AgriWeed AI- Powered by AGRIConnect </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <a
            href="#"
            className="flex items-center p-3 rounded-lg
            bg-green-900 bg-opacity-10 hover:bg-opacity-20
            transition-colors"
          >
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center p-3 rounded-lg
            hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <History className="h-5 w-5 mr-3" />
            History
          </a>
          <a
            href="#"
            className="flex items-center p-3 rounded-lg
            hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <User className="h-5 w-5 mr-3" />
            Profile
          </a>
          <a
            href="#"
            className="flex items-center p-3 rounded-lg
            hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </a>
        </nav>

        {/* Quick Tips Section */}
        <div
          className="mt-8 p-4 bg-blue-900 bg-opacity-10 rounded-lg text-sm
        dark:bg-dark dark:bg-opacity-20"
        >
          <h3 className="font-semibold mb-2 text-white">Quick Tips</h3>
          <ul className="space-y-2 text-gray-100 dark:text-gray-300">
            <li>• Ensure good lighting for accurate detection</li>
            <li>• Capture images from multiple angles</li>
            <li>• Currently supports cotton crops only</li>
            <li>• Maintain camera stability during video</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render tutorial modal
  const renderTutorial = () => (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${
        showTutorial ? "block" : "hidden"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-4">
          🌾 Cotton Weed Detection Guide
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">📷 Image Analysis</h3>
            <p>Upload clear images of your cotton field. The AI will detect:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>🌱 Soil areas</li>
              <li>🌿 Weed infestations</li>
              <li>🌾 Cotton plants</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">🎥 Video Analysis</h3>
            <p>
              Upload videos to analyze larger areas. Walk through your field
              while recording for best results.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              📊 Understanding Results
            </h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <span className="text-amber-600">Amber</span>: Soil areas
              </li>
              <li>
                <span className="text-red-600">Red</span>: Weeds (needs
                attention)
              </li>
              <li>
                <span className="text-green-600">Green</span>: Healthy cotton
                plants
              </li>
              <li>
                <span className="text-violet-600">Violet</span>: Weed density
                percentage
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900 p-4 rounded-lg">
            <strong>⚠ Important:</strong> Currently supports only cotton crops.
            Other crops may not be accurately detected.
          </div>
        </div>

        <button
          onClick={() => setShowTutorial(false)}
          className="mt-6 w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-violet-200 dark:border-violet-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-4 p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900"
              >
                ☰
              </button>
              <h1 className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                🌾 AgriWeed AI - Powered by AGRIConnect
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900 rounded-lg"
                title="Show Tutorial"
              >
                <HelpCircle className="h-5 w-5" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900 rounded-lg"
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Cloud className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {renderSidebar()}
      {renderTutorial()}

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <nav className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-2 mb-10 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Live Crop Monitoring (Webcam) */}
            <button
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all shadow-sm
        ${
          activeTab === "webcam"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-800"
        }`}
              onClick={() => setActiveTab("webcam")}
            >
              <Camera className="h-5 w-5 mr-2 text-green-500" />
              Live Crop Monitoring
            </button>

            {/* Video Study */}
            <button
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all shadow-sm
        ${
          activeTab === "video"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-800"
        }`}
              onClick={() => setActiveTab("video")}
            >
              <Video className="h-5 w-5 mr-2 text-blue-500" />
              Video Study
            </button>

            {/* Image Check */}
            <button
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all shadow-sm
        ${
          activeTab === "image"
            ? "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200"
            : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-800"
        }`}
              onClick={() => setActiveTab("image")}
            >
              <Image className="h-5 w-5 mr-2 text-violet-500" />
              Image Check
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
              <button
                onClick={resetAnalysis}
                className="ml-auto text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium"
              >
                Reset
              </button>
            </div>
          )}

          {activeTab === "webcam" && renderWebcamSection()}
          {activeTab === "video" && renderVideoSection()}
          {activeTab === "image" && renderUploadSection()}

          {analysisStatus === "completed" && (
            <>
              {renderStatistics()}
              {renderGraphs()}
              {renderImagePreview()}
              <DetectionDetails results={results} />
            </>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`h-3 w-3 rounded-full mr-3 ${
                analysisStatus === "idle"
                  ? "bg-gray-400"
                  : analysisStatus === "live" || analysisStatus === "playing"
                  ? "bg-green-500 animate-pulse"
                  : analysisStatus === "processing"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-600 dark:text-gray-400">
              {analysisStatus === "idle"
                ? "Ready"
                : analysisStatus === "starting"
                ? "Initializing..."
                : analysisStatus === "processing"
                ? "Processing..."
                : analysisStatus === "live"
                ? "Live Webcam Detection"
                : analysisStatus === "playing"
                ? "Video Detection Running"
                : analysisStatus === "completed"
                ? "Analysis Complete"
                : "Error"}
            </span>
          </div>

          <button
            onClick={resetAnalysis}
            className="flex items-center text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-violet-200 dark:border-violet-600 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>🌱 AgriWeed AI - Smart Cotton Weed Detection System</p>
          <p className="text-sm mt-2">
            Using advanced AI to help farmers identify and manage weeds
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CropDashboard;