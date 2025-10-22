// Enhanced AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
// Assuming AdminService exists in the correct path
import AdminService from "../API/AdminService";
import {
  FaBox,
  FaList,
  FaUsers,
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaShoppingCart,
  FaMoneyBillWave,
  FaUserCheck,
  FaChartLine,
  FaServer,
  FaTractor,
  FaLeaf,
  FaChartPie,
  FaPercentage,
  FaDownload,
  FaSync,
} from "react-icons/fa";

// --- Presentational Components (StatCard, MetricChart, QuickAction, StatusIndicator) ---
// Note: These components were kept as provided in the previous turn,
// as they correctly handle props and do not contain hooks that violate the rules.

const StatCard = ({
  title,
  value,
  icon,
  color,
  change,
  changeType,
  loading,
  onClick,
  subtitle,
  maxValue,
  format = "number",
}) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "object" && !Array.isArray(val)) return "N/A";

    const numVal = Number(val);
    if (isNaN(numVal)) return String(val);

    if (format === "currency") {
      return `₹${numVal.toLocaleString()}`;
    } else if (format === "percentage") {
      return `${numVal.toFixed(1)}%`;
    }
    return numVal.toLocaleString();
  };

  const progress = maxValue ? (value / maxValue) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 ${
        onClick ? "hover:scale-105 transform transition-transform" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? (
              <FaSpinner className="animate-spin text-2xl" />
            ) : (
              formatValue(value)
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
      </div>

      {change !== undefined && (
        <div
          className={`flex items-center text-sm ${
            changeType === "positive" ? "text-green-600" : "text-red-600"
          }`}
        >
          <FaChartLine
            className={`mr-1 ${
              changeType === "negative" ? "transform rotate-180" : ""
            }`}
          />
          {change}% from last period
        </div>
      )}

      {maxValue && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>{formatValue(maxValue)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricChart = ({ title, data, type = "line", height = "h-64" }) => {
  // Dummy chart components for visualization (LineChart, BarChart, PieChart)
  const LineChart = () => (
    <div className="w-full h-full p-4">
      <div className="relative h-full">
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <div className="ml-8 h-full">
          <div className="h-full border-l border-b border-gray-300 dark:border-gray-600 relative">
            <svg className="w-full h-full">
              {/* Dummy path */}
              <path
                d="M0,80 L25,60 L50,40 L75,60 L100,20"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{data && data.length > 0 ? data[0]._id : "Start"}</span>
            <span>
              {data && data.length > 0 ? data[data.length - 1]._id : "End"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const BarChart = () => (
    <div className="w-full h-full p-4">
      <div className="flex items-end justify-between h-5/6 space-x-2">
        {[65, 45, 75, 35, 85, 55].map((height, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t transition-all duration-500"
              style={{ height: `${height}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );

  const PieChart = () => (
    <div className="w-32 h-32 mx-auto relative">
      <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 transform rotate-45"></div>
      <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full"></div>
      {Array.isArray(data) && data.length > 0 && (
        <div className="absolute -right-32 top-1/2 transform -translate-y-1/2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {data.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2`}
                style={{
                  backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"][index],
                }}
              ></span>
              {item.category || "Category"} ({item.count || 0})
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChart = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="text-gray-500 dark:text-gray-400">
          No data available for this chart.
        </div>
      );
    }

    switch (type) {
      case "line":
        return <LineChart data={data} />;
      case "bar":
        return <BarChart data={data} />;
      case "pie":
        return <PieChart data={data} />;
      default:
        return <LineChart data={data} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className={`${height} flex items-center justify-center`}>
        {renderChart()}
      </div>
    </div>
  );
};

const QuickAction = ({
  icon,
  title,
  description,
  onClick,
  color = "blue",
  count,
}) => (
  <button
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-lg p-4 text-left hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-${color}-300 dark:hover:border-${color}-600 relative group`}
  >
    {/* Correctly handle count: only render if it's a valid number and non-zero */}
    {typeof count === "number" && count > 0 && (
      <div
        className={`absolute -top-2 -right-2 bg-${color}-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}
      >
        {count}
      </div>
    )}
    <div
      className={`w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
    >
      <div className={`text-${color}-600 dark:text-${color}-400 text-xl`}>
        {icon}
      </div>
    </div>
    <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
      {description}
    </p>
  </button>
);

const StatusIndicator = ({ status, label }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-900 dark:text-white">
        ({displayStatus})
      </span>
    </div>
  );
};

// --- Main Component ---
const AdminDashboard = () => {
  // 1. USE STATE HOOKS (UNCONDITIONAL)
  const [metrics, setMetrics] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 2,
      kycPending: 0,
      totalProducts: 0,
      totalListings: 0,
      totalOrders: 0,
      totalFarms: 0,
    },
    pendingApprovals: {
      products: 0,
      listings: 0,
      kyc: 0,
    },
    products: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      byCategory: [],
    },
    financial: {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalTransactions: 0,
      paymentSuccessRate: 0,
      monthlyRevenueTrend: [],
    },
    farmAnalytics: {
      totalFarms: 0,
      totalDiseaseReports: 0,
      imagesAnalyzed: 0,
      diseasedImages: 0,
      diseaseRate: 0,
    },
    platformHealth: {
      database: "connected",
      api: "healthy",
      storage: "normal",
      uptime: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  // 2. OTHER HOOKS (UNCONDITIONAL)
  const navigate = useNavigate();

  // 3. USE MEMO HOOKS (UNCONDITIONAL)
  const approvalRate = useMemo(() => {
    const total = metrics.products?.total;
    const approved = metrics.products?.approved;
    return total && total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
  }, [metrics.products]);

  const uptimeHoursMinutes = useMemo(() => {
    const uptimeSeconds = metrics.platformHealth?.uptime;
    if (
      typeof uptimeSeconds !== "number" ||
      isNaN(uptimeSeconds) ||
      uptimeSeconds <= 0
    ) {
      return "N/A";
    }
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, [metrics.platformHealth?.uptime]);

  // 4. USE EFFECT HOOKS (UNCONDITIONAL)
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Assuming AdminService.getDashboardMetrics() takes a timeRange argument
      const dashboardData = await AdminService.getDashboardMetrics(timeRange);
      console.log("Dashboard Data:", dashboardData);

      // Calculate the correct metric for array length and update state
      const totalDiseaseReportsCount = Array.isArray(
        dashboardData.farmAnalytics?.totalDiseaseReports
      )
        ? dashboardData.farmAnalytics.totalDiseaseReports.length
        : dashboardData.farmAnalytics?.totalDiseaseReports || 0;

      setMetrics((prevMetrics) => ({
        ...prevMetrics, // Use previous state as fallback for missing fields
        ...dashboardData, // Overwrite with new data
        farmAnalytics: {
          ...prevMetrics.farmAnalytics,
          ...dashboardData.farmAnalytics,
          totalDiseaseReports: totalDiseaseReportsCount, // Inject the fixed count
        },
        platformHealth: {
          ...prevMetrics.platformHealth,
          ...dashboardData.platformHealth,
        },
        // Ensure all top-level objects are preserved/overwritten cleanly
      }));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(
        err.message ||
          (typeof err === "object" && err !== null
            ? JSON.stringify(err)
            : "Failed to load dashboard data")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]); // Dependency on timeRange

  // --- Helper Functions (NOT hooks) ---
  const handleRefresh = () => {
    fetchMetrics();
  };

  const handleExportData = async (type) => {
    // ... (Export logic remains the same)
    try {
      const blob = await AdminService.exportData(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed: " + (err.message || String(err)));
    }
  };

  // Quick Actions (using the fixed totalDiseaseReports from state)
  const quickActions = [
    {
      icon: <FaBox />,
      title: "Manage Products",
      description: "Approve, reject, or manage products",
      onClick: () => navigate("/harvestLink/admin/products/pending"),
      color: "blue",
      count: metrics.pendingApprovals?.products,
    },
    {
      icon: <FaList />,
      title: "Manage Listings",
      description: "Review and manage marketplace listings",
      onClick: () => navigate("/harvestLink/admin/listings/pending"),
      color: "green",
      count: metrics.pendingApprovals?.listings,
    },
    {
      icon: <FaUserCheck />,
      title: "Verify KYC",
      description: "Review pending KYC applications",
      onClick: () => navigate("/harvestLink/admin/kyc/pending"),
      color: "purple",
      count: metrics.pendingApprovals?.kyc,
    },
    {
      icon: <FaTractor />,
      title: "Farm Analytics",
      description: "View farm and crop insights",
      onClick: () => navigate("/harvestLink/admin/farms"),
      color: "orange",
    },
    {
      icon: <FaChartPie />,
      title: "Financial Reports",
      description: "Revenue and transaction analytics",
      onClick: () => navigate("/harvestLink/admin/financial"),
      color: "indigo",
    },
    {
      icon: <FaLeaf />,
      title: "Disease Reports",
      description: "Crop health monitoring",
      onClick: () => navigate("/harvestLink/admin/diseases"),
      color: "red",
      count: metrics.farmAnalytics?.totalDiseaseReports, // Now a guaranteed number
    },
  ];

  // 5. CONDITIONAL RENDERING (AFTER ALL HOOKS)
  if (loading && metrics.overview.totalUsers === 0) {
    return (
      <div className="mt-20 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading comprehensive dashboard...
          </p>
        </div>
      </div>
    );
  }

  // 6. MAIN RENDER
  return (
    <div className="mt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive overview of your agricultural marketplace
              </p>
            </div>
            <div
              onClick={() => window.open("/agribot/admin", "_blank")}
              className="cursor-pointer bg-yellow-400 dark:bg-yellow-600 hover:bg-yellow-500 dark:hover:bg-yellow-500 transition-colors duration-300 rounded-xl shadow-lg p-6 flex items-center justify-center"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
                AgriBot - Admin Dashboard
              </h1>
            </div>

            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
              <button
                onClick={() => handleExportData("full")}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={metrics.financial?.totalRevenue || 1000}
            icon={<FaMoneyBillWave size={20} />}
            color="bg-green-500"
            format="currency"
            loading={loading}
          />
          <StatCard
            title="Active Users"
            value={metrics.overview?.activeUsers || 2}
            icon={<FaUsers size={20} />}
            color="bg-blue-500"
            subtitle={`of ${metrics.overview?.totalUsers} total`}
            maxValue={metrics.overview?.totalUsers}
            loading={loading}
          />
          <StatCard
            title="Total Orders"
            value={metrics.overview?.totalOrders || 6}
            icon={<FaShoppingCart size={20} />}
            color="bg-purple-500"
            loading={loading}
          />
          <StatCard
            title="Payment Success Rate"
            value={metrics.financial?.paymentSuccessRate || 98.98}
            icon={<FaPercentage size={20} />}
            color="bg-emerald-500"
            format="percentage"
            loading={loading}
          />
        </div>

        {/* Marketplace Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={metrics.products?.total}
            icon={<FaBox size={20} />}
            color="bg-indigo-500"
            loading={loading}
          />
          <StatCard
            title="Approval Rate"
            value={approvalRate}
            icon={<FaCheckCircle size={20} />}
            color="bg-green-500"
            format="percentage"
            loading={loading}
          />
          <StatCard
            title="Total Farms"
            value={metrics.overview?.totalFarms}
            icon={<FaTractor size={20} />}
            color="bg-orange-500"
            loading={loading}
          />
          <StatCard
            title="Disease Rate"
            value={metrics.farmAnalytics?.diseaseRate}
            icon={<FaLeaf size={20} />}
            color="bg-red-500"
            format="percentage"
            loading={loading}
          />
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <FaClock className="mr-3 text-yellow-500" />
            Pending Approvals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Products"
              value={metrics.pendingApprovals?.products}
              icon={<FaBox size={24} />}
              color="bg-yellow-500"
              loading={loading}
              onClick={() => navigate("/harvestLink/admin/products/pending")}
            />
            <StatCard
              title="Pending Listings"
              value={metrics.pendingApprovals?.listings}
              icon={<FaList size={24} />}
              color="bg-orange-500"
              loading={loading}
              onClick={() => navigate("/harvestLink/admin/listings/pending")}
            />
            <StatCard
              title="Pending KYC"
              value={metrics.pendingApprovals?.kyc}
              icon={<FaUserCheck size={24} />}
              color="bg-red-500"
              loading={loading}
              onClick={() => navigate("/harvestLink/admin/kyc/pending")}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MetricChart
            title="Revenue Trends"
            data={metrics.financial?.monthlyRevenueTrend}
            type="line"
            height="h-80"
          />
          <MetricChart
            title="Product Categories Distribution"
            data={metrics.products?.byCategory}
            type="pie"
            height="h-80"
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                title={action.title}
                description={action.description}
                onClick={action.onClick}
                color={action.color}
                count={action.count}
              />
            ))}
          </div>
        </div>

        {/* Platform Health & Farm Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Health */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaServer className="mr-2 text-blue-500" />
              Platform Health
            </h3>
            <div className="space-y-4">
              <StatusIndicator
                status={metrics.platformHealth?.database || "unknown"}
                label="Database"
              />
              <StatusIndicator
                status={metrics.platformHealth?.api || "unknown"}
                label="API Services"
              />
              <StatusIndicator
                status={metrics.platformHealth?.storage || "unknown"}
                label="File Storage"
              />
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Uptime:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {uptimeHoursMinutes}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaTractor className="mr-2 text-green-500" />
              Farm Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Farms
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.farmAnalytics?.totalFarms?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Images Analyzed
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {metrics.farmAnalytics?.imagesAnalyzed?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Disease Reports
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {metrics.farmAnalytics?.totalDiseaseReports?.toLocaleString() ||
                    0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Disease Rate
                </span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {metrics.farmAnalytics?.diseaseRate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FaChartBar className="mr-2 text-purple-500" />
            Product Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.products?.approved?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Approved
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {metrics.products?.pending?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Pending
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {metrics.products?.rejected?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Rejected
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.products?.total?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
