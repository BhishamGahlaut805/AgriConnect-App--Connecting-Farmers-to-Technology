import {
  FiVolume2, // This icon is no longer used for language toggle, but kept if other speech controls use it
  FiUpload,
  FiFileText,
  FiClock,
  FiHelpCircle,
  FiBarChart,
  FiHome,
  FiAlertCircle,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";

// TabButton component for individual navigation tabs
const TabButton = ({
  active, // Boolean: true if this tab is currently active
  onClick, // Function: handler for click events
  text, // String: visible text for the button
  icon: Icon, // React Component: icon to display (e.g., FiHome)
  disabled, // Boolean: if true, the button is disabled
  mobile, // Boolean: if true, applies mobile-specific styling
  tooltip, // String: content for the tooltip
  showBadge, // Boolean: if true, displays a small red badge
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    // Data attributes for react-tooltip to associate tooltip with this button
    data-tooltip-id="tab-tooltip"
    data-tooltip-content={tooltip}
    // Dynamic Tailwind CSS classes for styling
    className={`
      relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg shadow-sm
      ${mobile ? "mr-2 flex-shrink-0" : "mr-4"}
      ${
        active
          ? "bg-gradient-to-r from-green-500 to-blue-400 text-white shadow-lg transform scale-105" // Active state: vibrant gradient, larger shadow, slight scale
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-700 hover:shadow-md" // Inactive state: subtle background, hover effects
      }
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}
      focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 // Focus styles for accessibility
    `}
  >
    {/* Render icon if provided */}
    {Icon && <Icon className="text-lg" />}
    {/* Render button text */}
    {text}
    {/* Render badge if showBadge is true */}
    {showBadge && (
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border border-white dark:border-gray-800 animate-pulse"></span>
    )}
  </button>
);

// TabNavigation component for the main application navigation
const TabNavigation = ({
  activeTab, // String: currently active tab identifier
  setActiveTab, // Function: callback to change active tab
  result, // Object: prediction result (used to enable/disable results tab)
  hasNewReports, // Boolean: indicates if there are new reports
  hasUnresolvedIssues, // Boolean: indicates if there are unresolved issues/alerts
}) => {
  // Helper function to get tab titles and icons based on active tab
  const getTabTitle = (tab) => {
    const titles = {
      dashboard: {
        mobile: "Dashboard",
        desktop: "📊 Farm Dashboard",
        icon: <FiHome />,
      },
      upload: {
        mobile: "Upload",
        desktop: "🌱 Disease Prediction",
        icon: <FiUpload />,
      },
      results: {
        mobile: "Results",
        desktop: "🔍 Analysis Results",
        icon: <FiBarChart />,
      },
      guide: {
        mobile: "Guide",
        desktop: "📖 How It Works",
        icon: <FiHelpCircle />,
      },
      reports: {
        mobile: "Reports",
        desktop: "📄 Crop Reports",
        icon: <FiFileText />,
      },
      searches: {
        mobile: "History",
        desktop: "🕓 Past Analyses",
        icon: <FiClock />,
      },
      report: {
        mobile: "Report",
        desktop: "📘 Detailed Report",
        icon: <FiFileText />, // Reusing FiFileText for detailed report
      },
      issues: {
        mobile: "Alerts", // Changed from "Issues" for more farmer-friendly term
        desktop: "⚠️ Disease Alerts",
        icon: <FiAlertCircle />,
      },
    };
    return titles[tab] || { mobile: tab, desktop: tab }; // Fallback for unknown tabs
  };

  return (
    <>
      {/* Mobile Header (visible on small screens) */}
      <header className="md:hidden bg-gradient-to-r from-green-600 to-blue-500 dark:from-green-800 dark:to-blue-700 text-white p-4 flex justify-between items-center shadow-lg rounded-b-md">
        <h1 className="text-lg font-semibold tracking-wide">
          {getTabTitle(activeTab).mobile}
        </h1>
        {/* Language Toggle Button removed from here */}
      </header>

      {/* Desktop Header (visible on larger screens) */}
      <div className="hidden md:flex justify-between items-center mb-6 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-green-700 dark:text-blue-300 tracking-tight flex items-center">
          {getTabTitle(activeTab).icon && (
            <span className="mr-3 text-4xl">{getTabTitle(activeTab).icon}</span> // Larger icon for desktop
          )}
          {getTabTitle(activeTab).desktop}
        </h1>
        {/* Language Toggle Button removed from here */}
      </div>

      {/* Desktop Tabs Navigation */}
      <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <TabButton
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          text="Dashboard"
          icon={FiHome}
          tooltip="View your farm overview and key statistics"
        />
        <TabButton
          active={activeTab === "upload"}
          onClick={() => setActiveTab("upload")}
          text="Prediction"
          icon={FiUpload}
          tooltip="Upload crop images for disease detection and analysis"
        />
        <TabButton
          active={activeTab === "results"}
          onClick={() => setActiveTab("results")}
          disabled={!result} // Disable if no prediction result is available
          text="Results"
          icon={FiBarChart}
          tooltip={
            !result
              ? "Analyze images first to see the prediction results"
              : "View detailed analysis results and recommendations"
          }
          showBadge={result && hasUnresolvedIssues} // Show badge if results exist and issues are unresolved
        />
        <TabButton
          active={activeTab === "reports"}
          onClick={() => setActiveTab("reports")}
          text="Reports"
          icon={FiFileText}
          tooltip="Browse detailed crop disease information and reports"
          showBadge={hasNewReports} // Show badge for new reports
        />
        <TabButton
          active={activeTab === "searches"}
          onClick={() => setActiveTab("searches")}
          text="History"
          icon={FiClock}
          tooltip="View your previous disease analysis history and reports"
        />
        <TabButton
          active={activeTab === "issues"}
          onClick={() => setActiveTab("issues")}
          text="Alerts"
          icon={FiAlertCircle}
          tooltip="View important disease alerts and warnings for your farm"
          showBadge={hasUnresolvedIssues} // Show badge for unresolved issues
        />
        <TabButton
          active={activeTab === "guide"}
          onClick={() => setActiveTab("guide")}
          text="Guide"
          icon={FiHelpCircle}
          tooltip="Learn how to effectively use the crop disease prediction tool"
        />
      </div>

      {/* Mobile Tabs Navigation (horizontal scrollable) */}
      <div className="md:hidden flex overflow-x-auto pb-2 mb-4 no-scrollbar border-b border-gray-200 dark:border-gray-700">
        <TabButton
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          text="Home"
          icon={FiHome}
          mobile
          tooltip="Farm dashboard overview"
        />
        <TabButton
          active={activeTab === "upload"}
          onClick={() => setActiveTab("upload")}
          text="Upload"
          icon={FiUpload}
          mobile
          tooltip="Upload images for disease analysis"
        />
        <TabButton
          active={activeTab === "results"}
          onClick={() => setActiveTab("results")}
          disabled={!result}
          text="Results"
          icon={FiBarChart}
          mobile
          tooltip={!result ? "Analyze images first" : "View results"}
          showBadge={result && hasUnresolvedIssues}
        />
        <TabButton
          active={activeTab === "reports"}
          onClick={() => setActiveTab("reports")}
          text="Reports"
          icon={FiFileText}
          mobile
          tooltip="Browse disease reports"
          showBadge={hasNewReports}
        />
        <TabButton
          active={activeTab === "searches"}
          onClick={() => setActiveTab("searches")}
          text="History"
          icon={FiClock}
          mobile
          tooltip="View past searches"
        />
        <TabButton
          active={activeTab === "issues"}
          onClick={() => setActiveTab("issues")}
          text="Alerts"
          icon={FiAlertCircle}
          mobile
          tooltip="Disease alerts"
          showBadge={hasUnresolvedIssues}
        />
      </div>
    </>
  );
};

export default TabNavigation;
