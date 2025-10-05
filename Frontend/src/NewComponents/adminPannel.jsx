// src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Cloud,
  Newspaper,
  FileText,
  Bug,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  Upload,
  Database,
  Trash2,
  Eye,
  Download,
  BarChart3,
  Settings,
  Users,
  Shield,
} from "lucide-react";
import adminService from "../API/adminAgribot";
import LoadingSpinner from "./LoadingSpinner";
import PDFUpload from "./PDFUpload";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("scraping");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState({});
  const [results, setResults] = useState({});
  const [systemHealth, setSystemHealth] = useState(null);
  const [stats, setStats] = useState(null);

  const dataTypes = [
    {
      key: "weather",
      name: "Weather Data",
      icon: Cloud,
      description: "Current weather forecasts for agricultural regions",
      color: "blue",
      interval: "6 hours",
    },
    {
      key: "news",
      name: "Agricultural News",
      icon: Newspaper,
      description: "Latest farming news and updates",
      color: "green",
      interval: "24 hours",
    },
    {
      key: "bulletins",
      name: "IMD Bulletins",
      icon: FileText,
      description: "Official agricultural advisories",
      color: "purple",
      interval: "24 hours",
    },
    {
      key: "diseases",
      name: "Crop Diseases",
      icon: Bug,
      description: "Disease information and treatments",
      color: "red",
      interval: "7 days",
    },
  ];

  const tabs = [
    {
      id: "scraping",
      name: "Data Scraping",
      icon: Database,
      description: "Manage automated data collection",
    },
    {
      id: "pdf-upload",
      name: "PDF Upload",
      icon: Upload,
      description: "Upload documents to knowledge base",
    },
    {
      id: "system",
      name: "System Health",
      icon: BarChart3,
      description: "Monitor system performance",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: Users,
      description: "View usage statistics",
    },
  ];

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await adminService.getScrapingStatus();
      if (response.success) {
        setStatus(response.data);
      } else {
        console.error("Failed to fetch status:", response.error);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await adminService.checkSystemHealth();
      if (response.success) {
        setSystemHealth(response.data);
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - you can replace with actual API calls
      setStats({
        totalQueries: 1250,
        activeUsers: 47,
        documentsIndexed: 389,
        systemUptime: "99.8%",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSystemHealth();
    fetchStats();
  }, []);

  const handleScrape = async (dataType) => {
    setScraping((prev) => ({ ...prev, [dataType]: true }));

    try {
      let result;
      switch (dataType) {
        case "weather":
          result = await adminService.scrapeWeather();
          break;
        case "news":
          result = await adminService.scrapeNews();
          break;
        case "bulletins":
          result = await adminService.scrapeBulletins();
          break;
        case "diseases":
          result = await adminService.scrapeDiseases();
          break;
        default:
          return;
      }

      setResults((prev) => ({ ...prev, [dataType]: result }));

      // Refresh status after scraping
      if (result.success) {
        setTimeout(fetchStatus, 1000);
      }
    } catch (error) {
      console.error(`Scraping error for ${dataType}:`, error);
    } finally {
      setScraping((prev) => ({ ...prev, [dataType]: false }));
    }
  };

  const handleScrapeAll = async () => {
    setScraping((prev) => ({ ...prev, all: true }));
    try {
      const result = await adminService.scrapeAll();
      setResults((prev) => ({ ...prev, all: result }));
      if (result.success) {
        setTimeout(fetchStatus, 2000);
      }
    } catch (error) {
      console.error("Scrape all error:", error);
    } finally {
      setScraping((prev) => ({ ...prev, all: false }));
    }
  };

  const getStatusIcon = (dataType) => {
    if (!status?.last_scrape_times)
      return <AlertTriangle className="h-5 w-5 text-gray-400" />;

    const lastScrape = status.last_scrape_times[dataType];
    if (lastScrape === "Never")
      return <XCircle className="h-5 w-5 text-red-500" />;

    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getTimeAgo = (timestamp) => {
    if (timestamp === "Never") return "Never";

    const time = new Date(timestamp);
    const now = new Date();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const refreshAll = () => {
    fetchStatus();
    fetchSystemHealth();
    fetchStats();
  };

  const renderScrapingTab = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Quick Actions
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh All</span>
            </button>
            <button
              onClick={handleScrapeAll}
              disabled={scraping.all}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
            >
              <Play className="h-4 w-4" />
              <span>
                {scraping.all ? "Scraping All..." : "Scrape All Data"}
              </span>
            </button>
          </div>
        </div>

        {/* Overall Status */}
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {
                  Object.values(status.last_scrape_times || {}).filter(
                    (t) => t !== "Never"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Data Sources
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {status.is_running ? "Running" : "Stopped"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Scraping Service
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(status.next_scrapes || {}).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Scheduled Tasks
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last Checked
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dataTypes.map((dataType) => (
          <div
            key={dataType.key}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`bg-${dataType.color}-100 dark:bg-${dataType.color}-900 p-3 rounded-xl`}
                >
                  <dataType.icon
                    className={`h-6 w-6 text-${dataType.color}-600 dark:text-${dataType.color}-400`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {dataType.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update: {dataType.interval}
                  </p>
                </div>
              </div>
              {getStatusIcon(dataType.key)}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {dataType.description}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleScrape(dataType.key)}
                disabled={scraping[dataType.key]}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-${dataType.color}-500 text-white rounded-lg hover:bg-${dataType.color}-600 disabled:opacity-50 transition-colors duration-200 font-medium`}
              >
                {scraping[dataType.key] ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>
                  {scraping[dataType.key] ? "Scraping..." : "Scrape Now"}
                </span>
              </button>

              {status?.last_scrape_times?.[dataType.key] &&
                status.last_scrape_times[dataType.key] !== "Never" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Last: {getTimeAgo(status.last_scrape_times[dataType.key])}
                  </div>
                )}

              {results[dataType.key] && (
                <div
                  className={`p-2 rounded text-sm ${
                    results[dataType.key].success
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  }`}
                >
                  {results[dataType.key].success
                    ? `✓ ${results[dataType.key].data?.message || "Success"}`
                    : `✗ ${results[dataType.key].error}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Status */}
      {status && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Detailed Scraping Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                Last Scrape Times
              </h4>
              <div className="space-y-2">
                {dataTypes.map((dataType) => (
                  <div
                    key={dataType.key}
                    className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {dataType.name}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {status.last_scrape_times?.[dataType.key] === "Never"
                        ? "Never"
                        : new Date(
                            status.last_scrape_times[dataType.key]
                          ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                Next Scheduled Scrapes
              </h4>
              <div className="space-y-2">
                {dataTypes.map((dataType) => (
                  <div
                    key={dataType.key}
                    className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {dataType.name}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {status.next_scrapes?.[dataType.key] ===
                      "Ready for first scrape"
                        ? "Ready now"
                        : status.next_scrapes?.[dataType.key]
                        ? new Date(
                            status.next_scrapes[dataType.key]
                          ).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Results */}
      {results.all && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Last Complete Scrape Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dataTypes.map((dataType) => (
              <div key={dataType.key} className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    results.all?.data?.results?.[dataType.key] > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {results.all?.data?.results?.[dataType.key] || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dataType.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSystemHealthTab = () => (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
              <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                System Status
              </h3>
              <p
                className={`text-sm ${
                  systemHealth?.status === "healthy"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {systemHealth?.status || "Checking..."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Indexes Ready
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {systemHealth?.indexes_ready?.length || 0} / 5
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl">
              <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Scraping Service
              </h3>
              <p
                className={`text-sm ${
                  systemHealth?.scraping_service_running
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {systemHealth?.scraping_service_running ? "Running" : "Stopped"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-xl">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                API Status
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Operational
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Index Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Pinecone Index Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {["weather", "news", "diseases", "bulletins", "general"].map(
            (index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div
                  className={`h-3 w-3 rounded-full mx-auto mb-2 ${
                    systemHealth?.indexes_ready?.includes(index)
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                  {index}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {systemHealth?.indexes_ready?.includes(index)
                    ? "Online"
                    : "Offline"}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Service Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              System startup
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              2 minutes ago
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Weather data updated
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              5 minutes ago
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              News scraping completed
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              1 hour ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats.totalQueries}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Queries
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.activeUsers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Users
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats.documentsIndexed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Documents Indexed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {stats.systemUptime}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              System Uptime
            </div>
          </div>
        </div>
      )}

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Query Distribution
          </h3>
          <div className="space-y-3">
            {[
              "Weather Queries",
              "Disease Questions",
              "News Updates",
              "General Farming",
              "Bulletin Info",
            ].map((category, index) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category}
                </span>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(index + 1) * 15}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {(index + 1) * 15}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Response Times
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Average Response
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  1.2s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Fastest Response
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  0.8s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Slowest Response
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  3.5s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: "80%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent User Activity
        </h3>
        <div className="space-y-3">
          {[
            {
              user: "Farmer Rajesh",
              action: "Asked about wheat rust treatment",
              time: "2 min ago",
            },
            {
              user: "Agricultural Officer",
              action: "Uploaded new disease PDF",
              time: "15 min ago",
            },
            {
              user: "Student Researcher",
              action: "Queried weather patterns",
              time: "1 hour ago",
            },
            {
              user: "Farm Manager",
              action: "Checked latest news",
              time: "2 hours ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div>
                <div className="font-medium text-gray-800 dark:text-white">
                  {activity.user}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.action}
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-20 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                AgriConnect Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage data scraping, knowledge base, and system monitoring
              </p>
            </div>
          </div>
          <button
            onClick={refreshAll}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh All</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading && activeTab === "scraping" && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner text="Loading admin status..." />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "scraping" && renderScrapingTab()}
      {activeTab === "pdf-upload" && <PDFUpload />}
      {activeTab === "system" && renderSystemHealthTab()}
      {activeTab === "analytics" && renderAnalyticsTab()}
    </div>
  );
};

export default AdminPanel;
