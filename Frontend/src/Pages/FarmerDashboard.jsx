// src/pages/FarmerDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import {
  ArrowPathIcon,
  PlusCircleIcon,
  BellIcon,
  UserIcon,
  MapIcon,
  ShieldExclamationIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  ChartPieIcon,
  HomeModernIcon,
  XMarkIcon as XIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  Bars3Icon as MenuIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { onMessage, getToken } from "firebase/messaging";
import { messaging } from "../Firebase/firebase-config";
import AgriService from "../API/AgriService";
import FarmOverviewCard from "../components/FarmOverviewCard";
import NearbyFarmsCard from "../components/NearbyFarmsCard";
import DiseaseRiskCard from "../components/DiseaseRiskCard";
import UserAnalyticsCard from "../components/UserAnalyticsCard";
import FarmMapCard from "../components/FarmMapCard";
import CropDiseaseStats from "../components/CropDiseaseStats";
import RecentActivity from "../components/RecentActivity";
import WeatherWidget from "../components/WeatherWidget";
import DiseaseAlert from "../Components/DiseaseAlert";
import CreateFarm from "../Components/CreateFarm";
import FarmsMap from "../Components/FarmsMap";
import StyledCard from "../Components/StyleCard";
import AllReportsSection from "../Components/AllReports";
import PastSearches from "../Components/PastSearches";
import CropRecommendation from "../SubComponents/CropRecommendation";
import RainfallCard from "../SubComponents/RainfallCard";
import NotificationView from "../SubComponents/NotificationsView";
import WelcomeBanner from "../SubComponents/WelcomeBanner";
import AgriConnectBenefits from "../SubComponents/AgriConnectBenefits";
import MobileSidebarOpen from "../NewComponents/MobileSidebarOpen";

const AlertMessage = ({ isOpen, title, message, type, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
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

  const iconClasses = {
    success: <CheckCircleIcon className="h-6 w-6" />,
    error: <ShieldExclamationIcon className="h-6 w-6" />,
    info: <BellIcon className="h-6 w-6" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white flex items-center space-x-3 transition-all duration-300 ease-in-out transform ${typeClasses[type]}`}
    >
      {iconClasses[type]}
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

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farms, setFarms] = useState([]);
  const [userSummary, setUserSummary] = useState(null);
  const [diseaseReports, setDiseaseReports] = useState([]);
  const [farmStats, setFarmStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [alert, setAlert] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [notificationPolling, setNotificationPolling] = useState(null);
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

  // Check user authentication and role
  useEffect(() => {
    const userRaw = localStorage.getItem("userDetails");
    if (!userRaw) {
      navigate("/unauthorized");
      return;
    }

    try {
      const parsed = JSON.parse(userRaw);
      if (!parsed.id || !parsed.role || parsed.role !== "farmer") {
        throw new Error("Invalid user role or ID");
      }
      setUser({ ...parsed, _id: parsed.id });
      console.log("Authenticated user:", parsed);
    } catch (err) {
      // localStorage.removeItem("userDetails");
      navigate("/unauthorized");
    }
  }, [navigate]);

  const [canPlayAudio, setCanPlayAudio] = useState(false);

  // Track user interaction for autoplay
  useEffect(() => {
    const handleInteraction = () => setCanPlayAudio(true);

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // track first user interaction for audio
  // Track if user has interacted with the page
  const userInteracted = useRef(false);
  useEffect(() => {
    const handleInteraction = () => {
      userInteracted.current = true;
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
  }, []);

  // Unified addNotification function
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadNotifications((prev) => prev + 1);

    // Play bell sound if user interacted
    if (userInteracted.current) {
      const audio = new Audio("/bell.mp3");
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }

    // Always show system notification
    if ("Notification" in window) {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/logo192.png",
        });
      } catch (err) {
        console.log("System notification error:", err);
      }
    }
  };

  // Ref to ensure demo notifications are only added once
  const demoAdded = useRef(false);

  // Function to send top 3 risk summary notification per farm
  const sendTopRiskSummary = (farm) => {
    const predictions = farm.lstm_prediction || [];
    if (!predictions.length) return;

    const top3 = [...predictions]
      .sort((a, b) => b["predicted_risk%"] - a["predicted_risk%"])
      .slice(0, 3);

    const message = top3
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.date}: ${p["predicted_risk%"].toFixed(
            2
          )}% risk, Radius: ${p.predicted_radius_Km.toFixed(2)} km`
      )
      .join("\n");

    addNotification({
      _id: `risk-summary-${farm.farm_id}-${Date.now()}`,
      title: `📊 10-Day Risk Summary: ${farm.farm_name}`,
      message,
      type: "warning",
      timestamp: new Date().toISOString(),
      read: false,
      farmId: farm.farm_id,
    });
  };

  // Fetch user farms and send notifications (only once)
  useEffect(() => {
    if (!user?._id) return;

    const fetchFarms = async () => {
      try {
        const response = await AgriService.getAllData();
        const farms = Array.isArray(response.farms) ? response.farms : [];
        const userFarms = farms.filter((farm) => farm.user_id === user._id);

        setFarms(userFarms);
        setSelectedFarm(userFarms[0] || null);

        // Add demo notifications once
        if (!demoAdded.current && userFarms.length > 0 && userFarms[0]) {
          demoAdded.current = true;

          const selectedFarm = userFarms[0];
          const demoNotifications = [
            {
              _id: `demo-${Date.now()}-1`,
              title: "🌾 Crop Health Update",
              message: `Your ${selectedFarm.farm_name} crops are 85% healthy`,
              type: "success",
              timestamp: new Date().toISOString(),
              read: false,
              farmId: selectedFarm.farm_id,
            },
            {
              _id: `demo-${Date.now()}-2`,
              title: "⚠️ Disease Alert",
              message: "Low risk of Leaf Rust detected in nearby farms",
              type: "warning",
              timestamp: new Date().toISOString(),
              read: false,
              farmId: selectedFarm.farm_id,
              disease: "Leaf Rust",
              severity: "Low",
            },
            {
              _id: `demo-${Date.now()}-3`,
              title: "📈 Yield Prediction",
              message: "Expected yield increase of 12% this season",
              type: "info",
              timestamp: new Date().toISOString(),
              read: true,
              farmId: selectedFarm.farm_id,
            },
          ];

          demoNotifications.forEach(addNotification);
        }

        // Send top 3 risk summary notification for each farm
        userFarms.forEach((farm) => sendTopRiskSummary(farm));
      } catch (err) {
        console.error("Error fetching farms:", err);
        setFarms([]);
        setSelectedFarm(null);
      }
    };

    fetchFarms();
  }, [user]);

  // Firebase messaging setup for live alerts
  useEffect(() => {
    if (!user?._id) return;

    AgriService.startDailyRiskNotifications(user._id, 50, addNotification);

    const setupFirebaseMessaging = async () => {
      if (!messaging) return console.warn("Firebase messaging not available");

      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted")
          return console.warn("Notifications not granted");

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (token && AgriService.registerDeviceToken) {
          await AgriService.registerDeviceToken(user._id, token);
        }

        onMessage(messaging, (payload) => {
          const notification = {
            _id: Date.now().toString(),
            title: payload.notification?.title || "New Alert",
            message:
              payload.notification?.body || "You have a new notification",
            type: payload.data?.type || "info",
            timestamp: new Date().toISOString(),
            read: false,
            disease: payload.data?.disease,
            severity: payload.data?.severity,
            farmId: payload.data?.farmId,
          };
          addNotification(notification);
        });
      } catch (err) {
        console.error("Firebase messaging setup error:", err);
      }
    };

    setupFirebaseMessaging();
  }, [user]);

  // Fetch all data when selected farm changes
  const fetchData = useCallback(async () => {
    if (!user?._id || !selectedFarm) return;
    setIsLoading(true);
    setError(null);

    try {
      const [summary, reports, stats] = await Promise.all([
        AgriService.getUserSummary(user._id),
        AgriService.getDiseaseReports(selectedFarm.farm_id),
        AgriService.getFarmStats(selectedFarm.farm_id),
      ]);

      setUserSummary(summary);
      setDiseaseReports(
        reports.filter(
          (r) => r?.disease && r.disease.toLowerCase() !== "healthy"
        )
      );

      const combinedStats = {
        total_images_analyzed: stats?.total_images_analyzed || 0,
        diseased_images_found: stats?.diseased_images_found || 0,
        max_risk_percent: stats?.max_risk_percent || 0,
        disease_counts: stats?.disease_counts || {},
        crop_counts: stats?.crop_counts || {},
      };

      setFarmStats(combinedStats);

      setAlert({
        isOpen: true,
        message: "Farm data loaded successfully!",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Failed to load farm data");
      setAlert({
        isOpen: true,
        message: err.message || "Failed to load farm data",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedFarm]);

  useEffect(() => {
    if (selectedFarm) {
      fetchData();
    }
  }, [selectedFarm, fetchData]);

  // Setup notifications polling
  useEffect(() => {
    if (!user) return;

    const pollNotifications = async () => {
      try {
        const latestNotifications = await AgriService.getLatestNotifications(
          user._id
        );
        if (latestNotifications && latestNotifications.length > 0) {
          setNotifications((prev) => {
            const newNotifications = latestNotifications.filter(
              (n) => !prev.some((p) => p._id === n._id)
            );

            if (newNotifications.length > 0) {
              setUnreadNotifications((prev) => prev + newNotifications.length);
              return [...newNotifications, ...prev];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial poll
    pollNotifications();

    // Set up interval polling every 2 minutes as fallback
    const interval = setInterval(pollNotifications, 120000);
    setNotificationPolling(interval);

    return () => {
      if (notificationPolling) clearInterval(notificationPolling);
    };
  }, [user]);

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadNotifications(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    navigate("/");
  };

  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  const testNotification = async () => {
    try {
      // Test local notification first
      const testNotif = {
        _id: Date.now().toString(),
        title: "Test Notification",
        message: "This is a test notification from Firebase",
        type: "info",
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [testNotif, ...prev]);
      setUnreadNotifications((prev) => prev + 1);

      // Try to trigger a Firebase notification
      if (user?._id) {
        await AgriService.sendTestNotification(user._id);
      }
    } catch (error) {
      console.error("Test notification failed:", error);
    }
  };
  // testNotification();

  const handleFarmCreated = async (newFarm) => {
    setIsCreating(false);
    const updatedFarms = [...farms, newFarm];
    setFarms(updatedFarms);
    setSelectedFarm(newFarm);
    setActiveView("dashboard");
    setAlert({
      isOpen: true,
      message: "Farm created successfully!",
      type: "success",
    });
    await fetchData();
  };

  const handleFarmSelect = (farm) => {
    setSelectedFarm(farm);
    setActiveView("dashboard");
  };

  // Loading state
  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <StyledCard color="blue" className="text-center p-8 max-w-md mx-4">
          <div className="w-24 h-24 mx-auto mb-6">
            <svg
              className="animate-spin text-blue-600 dark:text-violet-400"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-violet-100">
            Preparing your farm dashboard...
          </h3>
          <p className="text-sm text-gray-600 dark:text-violet-200 mt-2">
            Gathering the latest field data
          </p>
        </StyledCard>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <StyledCard color="red" className="text-center p-6 max-w-md mx-4">
          <div className="mx-auto h-14 w-14 text-red-500 dark:text-red-400">
            <ShieldExclamationIcon className="w-full h-full" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-violet-100">
            Field Report Issue
          </h3>
          <p className="text-sm text-gray-600 dark:text-violet-200 mt-2">
            {error}
          </p>
          <button
            onClick={fetchData}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center mx-auto shadow-md"
            data-tooltip-id="retry-tooltip"
            data-tooltip-content="Click to retry fetching data"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Data
          </button>
          <Tooltip id="retry-tooltip" />
        </StyledCard>
      </div>
    );
  }

  // No farm state
  if (farms.length === 0 && activeView === "dashboard") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <StyledCard color="blue" className="text-center p-8 max-w-md mx-4">
          <div className="mx-auto h-20 w-20 text-blue-500 dark:text-violet-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L4,5V11.09C4,16.14 7.41,20.85 12,22C16.59,20.85 20,16.14 20,11.09V5L12,2M12,4.5L17,6.6V11.8C16.34,11.93 15.69,12 15,12C12.47,12 10.2,10.82 8.61,8.92L7.5,7.5L6,9.37L9.43,13.22C10.16,14.5 11.29,15.55 12.65,16.18L12,16.5L11.35,16.18C9.55,15.25 8.15,13.5 7.5,11.5V8.5L12,6.5V4.5M15,9C16.11,9 17,9.9 17,11C17,12.11 16.11,13 15,13C13.9,13 13,12.11 13,11C13,9.9 13.9,9 15,9Z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-violet-100">
            Ready to Cultivate?
          </h3>
          <p className="text-sm text-gray-600 dark:text-violet-200 mt-2">
            Set up your first farm to start monitoring crops and diseases
          </p>
          <button
            onClick={() => setActiveView("createFarm")}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center mx-auto shadow-md"
            data-tooltip-id="create-farm-tooltip"
            data-tooltip-content="Create a new farm to get started"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Setup New Farm
          </button>
          <Tooltip id="create-farm-tooltip" />
        </StyledCard>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 font-inter">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-50 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "lg:w-64" : "lg:w-20"
        } w-64 h-full bg-gradient-to-b from-indigo-800 to-violet-900 dark:from-gray-800 dark:to-gray-900 text-white flex flex-col border-r border-indigo-700 dark:border-gray-700 shadow-lg lg:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700 dark:border-gray-700">
          {sidebarOpen || mobileSidebarOpen ? (
            <h2 className="text-xl font-bold flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-violet-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-tooltip-id="logo-tooltip"
                data-tooltip-content="AgriConnect Pro Logo"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              AgriConnect Pro
            </h2>
          ) : (
            <div className="mx-auto">
              <svg
                className="w-6 h-6 text-violet-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-tooltip-id="logo-tooltip"
                data-tooltip-content="AgriConnect Pro Logo"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          )}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (mobileSidebarOpen) setMobileSidebarOpen(false);
            }}
            className="p-1 rounded-full hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors hidden lg:block"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            data-tooltip-id="sidebar-toggle-tooltip"
            data-tooltip-content={
              sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            {sidebarOpen || mobileSidebarOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="Close sidebar"
            data-tooltip-id="close-sidebar-tooltip"
            data-tooltip-content="Close mobile menu"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav>
            <ul className="space-y-1 px-2">
              {/* Dashboard */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("dashboard");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "dashboard"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="dashboard-tooltip"
                  data-tooltip-content="Go to Dashboard"
                >
                  <HomeIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Dashboard
                    </span>
                  )}
                </button>
              </li>
              {/* Farm Maps */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("farmsMap");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "farmsMap"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="farm-maps-tooltip"
                  data-tooltip-content="View Farm Maps"
                >
                  <MapIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Farm Maps
                    </span>
                  )}
                </button>
              </li>
              {/* Notifications */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("notifications");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "notifications"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="notifications-tooltip"
                  data-tooltip-content="View Notifications"
                >
                  <BellIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Notifications
                    </span>
                  )}
                  {unreadNotifications > 0 &&
                    (sidebarOpen || mobileSidebarOpen) && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                        {unreadNotifications}
                      </span>
                    )}
                </button>
              </li>
              {/* Disease Alerts */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("diseaseAlerts");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "diseaseAlerts"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="disease-alerts-tooltip"
                  data-tooltip-content="View Disease Alerts"
                >
                  <ShieldExclamationIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Disease Alerts
                    </span>
                  )}
                </button>
              </li>
              {/* Reports */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("reports");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "reports"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="reports-tooltip"
                  data-tooltip-content="View Farm Reports"
                >
                  <ClipboardDocumentCheckIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Reports
                    </span>
                  )}
                </button>
              </li>
              {/* Past Searches */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("past");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "past"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="past-analyses-tooltip"
                  data-tooltip-content="View Past Analyses"
                >
                  <ClockIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Past Analyses
                    </span>
                  )}
                </button>
              </li>
              {/* Crop Analytics */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("analytics");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "analytics"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="analytics-tooltip"
                  data-tooltip-content="View Crop Analytics"
                >
                  <ChartPieIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Crop Analytics
                    </span>
                  )}
                </button>
              </li>
              {/* My Farms */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("myFarms");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "myFarms"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="my-farms-tooltip"
                  data-tooltip-content="View My Farms"
                >
                  <HomeModernIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      My Farms
                    </span>
                  )}
                </button>
              </li>
              {/* Profile */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("profile");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "profile"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="profile-tooltip"
                  data-tooltip-content="Manage your Profile"
                >
                  <UserIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Profile
                    </span>
                  )}
                </button>
              </li>
              {/* Settings */}
              <li>
                <button
                  onClick={() => {
                    setActiveView("settings");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 w-full rounded-lg ${
                    activeView === "settings"
                      ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                      : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
                  } transition-all duration-200 ease-in-out group`}
                  data-tooltip-id="settings-tooltip"
                  data-tooltip-content="Adjust Application Settings"
                >
                  <Cog6ToothIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      Settings
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-indigo-700 dark:border-gray-700">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-600 dark:border-violet-400 object-cover"
                data-tooltip-id="user-avatar-tooltip"
                data-tooltip-content={`Logged in as ${user.name}`}
              />
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-ping-slow"
                  data-tooltip-id="unread-notifications-tooltip"
                  data-tooltip-content={`${unreadNotifications} unread notifications`}
                >
                  {unreadNotifications}
                </span>
              )}
            </div>
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-50">
                  {user.name}
                </p>
                <p className="text-xs text-indigo-200 dark:text-violet-300">
                  Verified Farmer
                </p>
              </div>
            )}
          </div>
          {(sidebarOpen || mobileSidebarOpen) && (
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center p-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors group"
              data-tooltip-id="logout-tooltip"
              data-tooltip-content="Sign out of your account"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-slate-100 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center">
              {/* Mobile menu button (Hamburger/X icon) */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-violet-300 hover:bg-slate-100 dark:hover:bg-gray-700 mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Toggle mobile menu"
                data-tooltip-id="mobile-menu-tooltip"
                data-tooltip-content="Toggle mobile menu"
              >
                {mobileSidebarOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-violet-100">
                {activeView === "dashboard" &&
                  `${selectedFarm?.farm_name || "Farm"} Dashboard`}
                {activeView === "farmsMap" && "Farm Maps"}
                {activeView === "notifications" && "Notifications"}
                {activeView === "diseaseAlerts" && "Disease Alerts"}
                {activeView === "reports" && "Farm Reports"}
                {activeView === "analytics" && "Crop Analytics"}
                {activeView === "past" && "Past Analyses"}
                {activeView === "profile" && "My Profile"}
                {activeView === "settings" && "Settings"}
                {activeView === "createFarm" && "Setup New Farm"}
                {activeView === "myFarms" && "My Farms"}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Toggle theme"
                data-tooltip-id="theme-toggle-tooltip"
                data-tooltip-content="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-violet-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => {
                    setActiveView("notifications");
                    markNotificationsAsRead();
                  }}
                  aria-label="Notifications"
                  data-tooltip-id="notifications-bell-tooltip"
                  data-tooltip-content="View your notifications"
                >
                  <BellIcon className="h-5 w-5 text-gray-600 dark:text-violet-300" />
                  {unreadNotifications > 0 && (
                    <span
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-ping-slow"
                      data-tooltip-id="unread-count-tooltip"
                      data-tooltip-content={`${unreadNotifications} unread notifications`}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-indigo-600 dark:border-violet-400 object-cover"
                  data-tooltip-id="header-avatar-tooltip"
                  data-tooltip-content={`Logged in as ${user.name}`}
                />
                <span className="hidden sm:block ml-2 text-sm font-medium text-gray-700 dark:text-violet-200">
                  {user.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Alert Message */}
        <AlertMessage
          isOpen={alert.isOpen}
          title={alert.type === "success" ? "Success" : "Error"}
          message={alert.message}
          type={alert.type}
          onClose={closeAlert}
        />

        {/* Content Views */}
        <main className="p-4 sm:p-6">
          {activeView === "dashboard" && selectedFarm && (
            <>
              <WelcomeBanner user={user.name} selectedFarm={selectedFarm} />
              {/* Mobile sidebar opener - place this in your top header, above or beside your main content */}
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />

              {/* Farm Selector for Mobile */}
              <div className="mb-6">
                <label
                  htmlFor="farm-select"
                  className="block text-sm font-medium text-gray-700 dark:text-violet-200 mb-2"
                >
                  Select Farm
                </label>
                <select
                  id="farm-select"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-violet-100"
                  value={selectedFarm?.farm_id || ""}
                  onChange={(e) => {
                    const farm = farms.find(
                      (f) => f.farm_id === e.target.value
                    );
                    if (farm) setSelectedFarm(farm);
                  }}
                  data-tooltip-id="farm-select-tooltip"
                  data-tooltip-content="Select a farm to view its dashboard"
                >
                  {farms.map((farm) => (
                    <option key={farm.farm_id} value={farm.farm_id}>
                      {farm.farm_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <FarmOverviewCard farmData={selectedFarm} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <DiseaseRiskCard
                      risks={selectedFarm.top_disease_risks}
                      predictions={selectedFarm.lstm_prediction}
                    />
                    <UserAnalyticsCard summary={userSummary} />
                  </div>
                  <RainfallCard />
                  <CropDiseaseStats stats={farmStats} />
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  <FarmMapCard farmData={selectedFarm} />
                  <NearbyFarmsCard nearbyFarms={selectedFarm.nearby_farms} />
                  <RecentActivity reports={diseaseReports} />
                </div>
              </div>
              <AgriConnectBenefits />
              <CropRecommendation className="" farm_name={selectedFarm.farm_name} />
            </>
          )}
          {activeView === "farmsMap" && selectedFarm && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <div className="h-[calc(100vh-180px)] z--10 rounded-lg shadow-xl overflow-hidden">
                <FarmsMap
                  farmData={selectedFarm}
                  nearbyFarms={selectedFarm.nearby_farms}
                />
              </div>
            </>
          )}
          {activeView === "notifications" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <NotificationView
                notifications={notifications}
                farms={farms}
                markNotificationsAsRead={markNotificationsAsRead}
                fetchData={fetchData}
              />
            </>
          )}
          {activeView === "diseaseAlerts" && selectedFarm && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <DiseaseAlert
                farmData={selectedFarm}
                alerts={selectedFarm.top_disease_risks}
                notifications={notifications}
              />
            </>
          )}
          {activeView === "reports" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <AllReportsSection />
            </>
          )}
          {activeView === "past" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <PastSearches farmData={selectedFarm} userId={user?._id} />
            </>
          )}
          {activeView === "myFarms" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-violet-100">
                      🌾 My Farms
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-violet-300">
                      Manage your agricultural properties and view their status
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView("createFarm")}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center shadow-md transition-all hover:shadow-violet-500/20"
                    data-tooltip-id="add-farm-tooltip"
                    data-tooltip-content="Add a new farm to your account"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Add New Farm
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                  </div>
                ) : farms.length === 0 ? (
                  <StyledCard className="text-center py-12 bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-gray-800">
                    <HomeModernIcon className="mx-auto h-16 w-16 text-violet-400 dark:text-violet-300" />
                    <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-violet-100">
                      No farms found
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-violet-300 max-w-md mx-auto">
                      You haven't created any farms yet. Get started by
                      registering your first agricultural property.
                    </p>
                    <button
                      onClick={() => setActiveView("createFarm")}
                      className="mt-6 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-md transition-all"
                      data-tooltip-id="create-first-farm-tooltip"
                      data-tooltip-content="Create your first farm"
                    >
                      Create Your First Farm
                    </button>
                  </StyledCard>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farms.map((farm) => (
                      <StyledCard
                        key={farm._id}
                        className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                          selectedFarm?.farm_id === farm.farm_id
                            ? "ring-2 ring-violet-500 dark:ring-violet-400 shadow-violet-500/20"
                            : ""
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 dark:text-violet-100 flex items-center">
                                {farm.farm_name}
                                <span
                                  className="ml-2 text-xs bg-violet-100 dark:bg-violet-800 text-violet-800 dark:text-violet-200 px-2 py-0.5 rounded-full"
                                  data-tooltip-id="farm-id-tooltip"
                                  data-tooltip-content={`Farm ID: ${farm.farm_id}`}
                                >
                                  ID
                                </span>
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-violet-300 mt-1">
                                Created:{" "}
                                {new Date(farm.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                farm.is_active
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}
                              data-tooltip-id="farm-status-tooltip"
                              data-tooltip-content={
                                farm.is_active
                                  ? "This farm is active"
                                  : "This farm is inactive"
                              }
                            >
                              {farm.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="flex items-start">
                              <MapPinIcon className="h-5 w-5 text-violet-500 mr-3 mt-0.5 flex-shrink-0 dark:text-violet-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-violet-200">
                                  Location Coordinates
                                </p>
                                <p className="text-sm text-gray-600 dark:text-violet-300">
                                  {farm.latitude?.toFixed(6)},{" "}
                                  {farm.longitude?.toFixed(6)}
                                </p>
                                {farm.agro_polygon && (
                                  <p className="text-xs text-gray-500 dark:text-violet-400 mt-1">
                                    Area: {farm.agro_polygon.area} km²
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start">
                              <ClipboardDocumentCheckIcon className="h-5 w-5 text-violet-500 mr-3 mt-0.5 flex-shrink-0 dark:text-violet-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-violet-200">
                                  Disease Reports
                                </p>
                                <p className="text-sm text-gray-600 dark:text-violet-300">
                                  {farm.top_disease_risks?.length || 0} active
                                  risks
                                </p>
                                {farm.top_disease_risks?.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {farm.top_disease_risks
                                      .slice(0, 3)
                                      .map((risk, i) => (
                                        <span
                                          key={i}
                                          className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                          data-tooltip-id={`disease-risk-${i}-tooltip`}
                                          data-tooltip-content={`Risk level: ${risk.risk_level}`}
                                        >
                                          {risk.disease.replace(/_/g, " ")}
                                        </span>
                                      ))}
                                    {farm.top_disease_risks.length > 3 && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        +{farm.top_disease_risks.length - 3}{" "}
                                        more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start">
                              <UserGroupIcon className="h-5 w-5 text-violet-500 mr-3 mt-0.5 flex-shrink-0 dark:text-violet-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-violet-200">
                                  Nearby Farms
                                </p>
                                <p className="text-sm text-gray-600 dark:text-violet-300">
                                  {farm.nearby_farms?.length || 0} within 5km
                                  radius
                                </p>
                                {farm.nearby_farms?.length > 0 && (
                                  <div className="mt-1">
                                    {farm.nearby_farms
                                      .slice(0, 2)
                                      .map((nearby, i) => (
                                        <p
                                          key={i}
                                          className="text-xs text-gray-500 dark:text-violet-400"
                                        >
                                          • {nearby.farm_name} (
                                          {nearby.distance_km.toFixed(2)}km)
                                        </p>
                                      ))}
                                    {farm.nearby_farms.length > 2 && (
                                      <p className="text-xs text-gray-500 dark:text-violet-400">
                                        +{farm.nearby_farms.length - 2} more...
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {farm.lstm_prediction?.length > 0 && (
                              <div className="flex items-start">
                                <ChartBarIcon className="h-5 w-5 text-violet-500 mr-3 mt-0.5 flex-shrink-0 dark:text-violet-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-violet-200">
                                    Disease Forecast
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-sm font-medium text-gray-600 dark:text-violet-300">
                                      {farm.lstm_prediction[0].predicted_risk}%
                                      risk
                                    </span>
                                    <span className="mx-2 text-gray-400">
                                      •
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-violet-400">
                                      Next {farm.lstm_prediction.length} days
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                            <button
                              onClick={() => handleFarmSelect(farm)}
                              className="text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 flex items-center"
                              data-tooltip-id="view-dashboard-tooltip"
                              data-tooltip-content="View this farm's dashboard"
                            >
                              <ArrowRightIcon className="h-4 w-4 mr-1" />
                              View Dashboard
                            </button>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  // Implement farm details modal
                                }}
                                className="text-sm text-gray-600 hover:text-gray-800 dark:text-violet-300 dark:hover:text-violet-200"
                                data-tooltip-id="farm-details-tooltip"
                                data-tooltip-content="View farm details"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => {
                                  // Implement quick actions menu
                                }}
                                className="text-sm text-gray-600 hover:text-gray-800 dark:text-violet-300 dark:hover:text-violet-200"
                                data-tooltip-id="farm-actions-tooltip"
                                data-tooltip-content="More actions"
                              >
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </StyledCard>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {activeView === "analytics" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <StyledCard color="purple">
                <h2 className="text-xl font-bold text-gray-800 dark:text-violet-100 mb-4">
                  Crop Analytics
                </h2>
                <UserAnalyticsCard summary={userSummary} />
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-violet-200">
                    Detailed analytics on crop health and disease trends will be
                    available soon.
                  </p>
                </div>
              </StyledCard>
            </>
          )}
          {activeView === "profile" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <StyledCard color="indigo">
                <h2 className="text-xl font-bold text-gray-800 dark:text-violet-100 mb-4">
                  My Profile
                </h2>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt="User Avatar"
                      className="w-24 h-24 rounded-full border-4 border-indigo-600 dark:border-violet-400 object-cover shadow-md"
                      data-tooltip-id="profile-avatar-tooltip"
                      data-tooltip-content="Your profile picture"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-violet-100">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-violet-200">
                          {user.email}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-violet-300">
                            Account Type
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-violet-200">
                            Farmer
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-violet-300">
                            Member Since
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-violet-200">
                            {new Date(
                              user.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-violet-300">
                            Total Farms
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-violet-200">
                            {farms.length}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-violet-300">
                            Active Farm
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-violet-200">
                            {selectedFarm?.farm_name || "None"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-md hover:shadow-lg"
                          data-tooltip-id="edit-profile-tooltip"
                          data-tooltip-content="Edit your profile details"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </StyledCard>
            </>
          )}
          {activeView === "settings" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <StyledCard color="gray">
                <h2 className="text-xl font-bold text-gray-800 dark:text-violet-100 mb-4">
                  Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2 text-gray-800 dark:text-violet-100">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-violet-200 mb-1">
                          Notification Methods
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="email-notifications"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                              defaultChecked
                              data-tooltip-id="email-notifications-tooltip"
                              data-tooltip-content="Enable or disable email notifications"
                            />
                            <label
                              htmlFor="email-notifications"
                              className="ml-2 block text-sm text-gray-700 dark:text-violet-200"
                            >
                              Email Notifications
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="push-notifications"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                              defaultChecked
                              data-tooltip-id="push-notifications-tooltip"
                              data-tooltip-content="Enable or disable push notifications"
                            />
                            <label
                              htmlFor="push-notifications"
                              className="ml-2 block text-sm text-gray-700 dark:text-violet-200"
                            >
                              Push Notifications
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="sms-notifications"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                              defaultChecked={false}
                              data-tooltip-id="sms-notifications-tooltip"
                              data-tooltip-content="Enable or disable SMS notifications"
                            />
                            <label
                              htmlFor="sms-notifications"
                              className="ml-2 block text-sm text-gray-700 dark:text-violet-200"
                            >
                              SMS Alerts
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="theme-select"
                          className="block text-sm font-medium text-gray-700 dark:text-violet-200 mb-1"
                        >
                          Theme
                        </label>
                        <select
                          id="theme-select"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-violet-100"
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          data-tooltip-id="theme-select-tooltip"
                          data-tooltip-content="Select your preferred theme"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2 text-gray-800 dark:text-violet-100">
                      Danger Zone
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <button
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-md hover:shadow-lg"
                          data-tooltip-id="delete-account-tooltip"
                          data-tooltip-content="Permanently delete your account. This action cannot be undone."
                        >
                          Delete Account
                        </button>
                        <p className="mt-1 text-xs text-gray-500 dark:text-violet-200">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </StyledCard>
            </>
          )}
          {activeView === "createFarm" && (
            <>
              <MobileSidebarOpen setMobileSidebarOpen={setMobileSidebarOpen} />
              <CreateFarm
                userId={user._id}
                username={user.name}
                onFarmCreated={handleFarmCreated}
                onCancel={() =>
                  setActiveView(farms.length > 0 ? "myFarms" : "dashboard")
                }
              />
            </>
          )}
        </main>
      </div>

      {/* Tooltips */}
      <Tooltip id="logo-tooltip" />
      <Tooltip id="sidebar-toggle-tooltip" />
      <Tooltip id="close-sidebar-tooltip" />
      <Tooltip id="dashboard-tooltip" />
      <Tooltip id="farm-maps-tooltip" />
      <Tooltip id="notifications-tooltip" />
      <Tooltip id="disease-alerts-tooltip" />
      <Tooltip id="reports-tooltip" />
      <Tooltip id="past-analyses-tooltip" />
      <Tooltip id="analytics-tooltip" />
      <Tooltip id="my-farms-tooltip" />
      <Tooltip id="profile-tooltip" />
      <Tooltip id="settings-tooltip" />
      <Tooltip id="user-avatar-tooltip" />
      <Tooltip id="unread-notifications-tooltip" />
      <Tooltip id="logout-tooltip" />
      <Tooltip id="mobile-menu-tooltip" />
      <Tooltip id="theme-toggle-tooltip" />
      <Tooltip id="notifications-bell-tooltip" />
      <Tooltip id="unread-count-tooltip" />
      <Tooltip id="header-avatar-tooltip" />
      <Tooltip id="farm-select-tooltip" />
      <Tooltip id="add-farm-tooltip" />
      <Tooltip id="create-first-farm-tooltip" />
      <Tooltip id="farm-id-tooltip" />
      <Tooltip id="farm-status-tooltip" />
      <Tooltip id="disease-risk-0-tooltip" />
      <Tooltip id="disease-risk-1-tooltip" />
      <Tooltip id="disease-risk-2-tooltip" />
      <Tooltip id="view-dashboard-tooltip" />
      <Tooltip id="farm-details-tooltip" />
      <Tooltip id="farm-actions-tooltip" />
      <Tooltip id="profile-avatar-tooltip" />
      <Tooltip id="edit-profile-tooltip" />
      <Tooltip id="email-notifications-tooltip" />
      <Tooltip id="push-notifications-tooltip" />
      <Tooltip id="sms-notifications-tooltip" />
      <Tooltip id="theme-select-tooltip" />
      <Tooltip id="delete-account-tooltip" />
      <Tooltip id="mark-read-tooltip" />
      <Tooltip id="refresh-tooltip" />
      <Tooltip id="retry-tooltip" />
      <Tooltip id="create-farm-tooltip" />
    </div>
  );
};

export default FarmerDashboard;
