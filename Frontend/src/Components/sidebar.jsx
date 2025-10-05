// src/Components/sidebar.jsx
import React, { useState } from "react";
import {
  FiHome,
  FiUpload,
  FiBook,
  FiSearch,
  FiCalendar,
  FiMap,
  FiBarChart2,
  FiSettings,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX as XIcon,
  FiArrowLeft as ArrowLeftOnRectangleIcon,
  
} from "react-icons/fi";
// Assuming Tooltip is defined globally or imported from a shared components folder
// For self-containment as per previous instructions, re-defining it here if not already shared.
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

const SidebarItem = ({
  icon,
  text,
  active,
  onClick,
  tooltip,
  showBadge,
  collapsed,
}) => (
  <button
    onClick={onClick}
    data-tooltip-id="sidebar-tooltip"
    data-tooltip-content={tooltip}
    className={`
      group relative flex items-center p-3 rounded-lg transition-all w-full text-left font-medium tracking-wide
      ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg transform scale-[1.02]" // Updated active gradient
          : "text-blue-100 hover:bg-blue-700 hover:bg-opacity-30 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700"
      }
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
    `}
  >
    <span className="text-xl">{icon}</span>
    {!collapsed && <span className="ml-3 whitespace-nowrap">{text}</span>}
    {showBadge && (
      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white animate-pulse"></span>
    )}
  </button>
);

const Sidebar = ({
  activeTab,
  setActiveTab,
  farmData,
  stats,
  setMessage,
  user, // Added user prop
  unreadNotifications, // Added unreadNotifications prop
  handleLogout, // Added handleLogout prop
}) => {
  const [collapsed, setCollapsed] = useState(false); // Default to expanded on desktop
  const [mobileOpen, setMobileOpen] = useState(false); // For mobile

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  // Adjusted commonWrapperClasses for new theme and responsiveness
  const commonWrapperClasses = `
    fixed z-40 top-0 left-0 h-full bg-gradient-to-b from-blue-800 to-indigo-900 dark:from-gray-800 dark:to-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out
    ${collapsed ? "w-20" : "w-64"}
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:relative lg:flex-shrink-0
    flex flex-col
  `;

  return (
    <>
      {/* Mobile Hamburger Button - now handled in CropDiseasePage Header */}

      {/* Sidebar Wrapper */}
      <div className={commonWrapperClasses}>
        {/* Header */}
        <div
          className={`
            flex items-center justify-between h-16 px-4
            bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 // Updated gradient
            dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 // Dark mode gradient
            border-b border-blue-700 dark:border-gray-700 shadow-md
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Brand Logo / Name */}
          <span
            className={`
              text-white font-extrabold text-2xl tracking-wider transition-all duration-300
              ${
                collapsed
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100 w-auto"
              }
            `}
          >
            🌾 AgriConnect
          </span>

          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={toggleSidebar}
            className={`
              text-white bg-blue-700 hover:bg-blue-600 p-2 rounded-full transition-transform duration-300
              hidden lg:inline-flex // Changed from md:inline-flex to lg:inline-flex for consistency
              ${collapsed ? "rotate-180" : ""}
            `}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <FiChevronRight size={20} />
            ) : (
              <FiChevronLeft size={20} />
            )}
          </button>
          {/* Close Mobile Sidebar Button (Mobile Only) */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden text-white p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close mobile sidebar"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col px-2 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem
            icon={<FiHome />}
            text="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setMobileOpen(false);
            }}
            tooltip="View your farm dashboard"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<FiUpload />}
            text="Disease Prediction"
            active={["upload", "results"].includes(activeTab)}
            onClick={() => {
              setActiveTab("upload");
              setMobileOpen(false);
            }}
            tooltip="Upload images for disease check"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<FiBook />}
            text="Crop Reports"
            active={activeTab === "reports"}
            onClick={() => {
              setActiveTab("reports");
              setMobileOpen(false);
            }}
            tooltip="Detailed crop disease reports"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<FiSearch />}
            text="Past Analyses"
            active={activeTab === "searches"}
            onClick={() => {
              setActiveTab("searches");
              setMobileOpen(false);
            }}
            tooltip="Review past analyses"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<FiAlertCircle />}
            text="All Reports"
            active={activeTab === "allReports"}
            onClick={() => {
              setActiveTab("allReports");
              setMobileOpen(false);
            }}
            tooltip="Browse all reports"
            collapsed={collapsed}
          />

          {/* Coming Soon Items */}
          {[
            ["Farm Schedule", FiCalendar],
            ["Farm Map", FiMap],
            ["Advanced Analytics", FiBarChart2],
            ["Settings", FiSettings],
          ].map(([label, Icon]) => (
            <SidebarItem
              key={label}
              icon={<Icon />}
              text={label}
              onClick={() =>
                setMessage({
                  type: "info",
                  text: `${label} feature coming soon!`,
                })
              }
              tooltip={`Coming soon: ${label}`}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-blue-700 dark:border-gray-700 mt-auto">
          {" "}
          {/* mt-auto pushes it to bottom */}
          <div className="flex items-center mb-3">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${
                  user?.username || "Guest"
                }&background=random`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-blue-600 dark:border-amber-400 object-cover"
                title={`Logged in as ${user?.username || "Guest"}`}
              />
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-ping-slow"
                  title={`${unreadNotifications} unread notifications`}
                >
                  {unreadNotifications}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-50">
                  {user?.username || "Guest"}
                </p>
                <p className="text-xs text-blue-200 dark:text-amber-300">
                  {user?.username === "Guest"
                    ? "Guest User"
                    : "Verified Farmer"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Tooltip text="Sign out of your account">
              <button
                onClick={handleLogout}
                className="mt-2 w-full flex items-center justify-center p-2 text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors group"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Sign Out
              </button>
            </Tooltip>
          )}
          {/* Farm Info Card */}
          {farmData && !collapsed && (
            <div className="mt-4 p-4 bg-gradient-to-br from-indigo-700 to-purple-600 rounded-xl text-white shadow-xl border border-indigo-600 dark:border-purple-800 text-sm">
              {" "}
              {/* Updated gradient and border */}
              <h3 className="font-bold text-lg">{farmData.farm_name}</h3>
              <p className="opacity-80">ID: {farmData.farm_id}</p>
              {stats && (
                <div className="mt-2 border-t pt-2 border-indigo-300">
                  {" "}
                  {/* Updated border color */}
                  <p className="flex justify-between">
                    Last Scan:{" "}
                    <span>
                      {new Date(stats.last_updated).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="flex justify-between mt-1">
                    Disease Risk:{" "}
                    <span className="font-bold">{stats.max_risk_percent}%</span>
                  </p>
                </div>
              )}
              <button
                onClick={() => setActiveTab("dashboard")}
                className="mt-3 w-full bg-white text-blue-800 hover:bg-blue-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 text-sm py-2 rounded-md transition-all flex items-center justify-center gap-2" // Updated button styles
                data-tooltip-id="sidebar-tooltip"
                data-tooltip-content="Go to farm dashboard"
              >
                <FiHome className="text-blue-800 dark:text-gray-900" /> View
                Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optional: Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
