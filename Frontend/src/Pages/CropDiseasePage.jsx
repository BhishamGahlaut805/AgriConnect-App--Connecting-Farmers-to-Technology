import React, { useState, useEffect, useRef, useCallback } from "react";
import AgriService from "../API/AgriService";
import UploadTabContent from "../Components/UploadTabContent";
import CropDiseaseResults from "../Components/CropDiseaseResults";
import DetailedReportCard from "../Components/DetailedReport";
import ImageViewer from "../Components/ImageViewer";
import WelcomeBanner from "../SubComponents/WelcomeCropDisease";
import { useNavigate } from "react-router-dom";

import {
  BellIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  XMarkIcon as XIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

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

// Tooltip component
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

// AlertMessage component
const AlertMessage = ({ isOpen, title, message, type, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
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
    result: null,
    loading: false,
    activeTab: "upload",
    stats: null,
    user: null,
    coords: { latitude: null, longitude: null },
    searchQuery: "",
    searchResults: [],
    pastSearches: [],
    selectedReport: null,
    uploadProgress: 0,
    uploadError: null,
    isDragOver: false,
    selectedImageModal: null,
    message: { type: "", text: "" },
  });

  const [theme, setTheme] = useState("system");
  const navigate = useNavigate();

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

  const [user, setUser] = useState({ id: "Guest", username: "Guest" });

  // Initialize user and farm data
  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem("userDetails");
        if (!raw) {
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
          setUser(user);
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
        console.log("Fetching farm data for user:", state.user.id);
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
          images: [],
          previews: [],
          loading: false,
          message: {
            type: "success",
            text: `Analyzed ${prediction.total_images} images`,
          },
        });

        // Navigate to results page with the prediction data
        const randomnumber=Math.floor(Math.random()*9000002920) + 100000090;
        navigate(`/${randomnumber}cropAgriConnectDisease/results`, {
          state: {
            result: prediction,
            farmData: state.farmData,
            modelType: state.modelType,
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
      navigate,
    ]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const retryFailedUploads = useCallback(() => {
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

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 overflow-y-auto mt-16 px-4 md:px-6 py-6 space-y-6 transition-all duration-300 ease-in-out items-center`}
      >
        <WelcomeBanner user={user.name} />
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

        {/* Upload Section */}
        <div className="w-full max-w-4xl mx-auto">
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
      </div>
    </div>
  );
};

export default CropDiseasePage;
