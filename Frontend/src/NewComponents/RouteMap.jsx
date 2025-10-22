import React, { useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  HomeIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  EyeIcon,
  ArrowRightIcon,
  MapIcon,
  CubeIcon,
  ServerIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// --- Utility Components for Flowchart Elements ---

// Node Component with enhanced visual design
const FlowNode = ({
  title,
  path,
  description,
  color = "blue",
  isProtected = false,
  requiredRoles = null,
  isModule = false,
  icon: Icon = CubeIcon,
  status = "active",
}) => {
  const colorMap = {
    purple: {
      bg: "bg-purple-500",
      hover: "hover:bg-purple-600",
      light: "bg-purple-100",
      text: "text-purple-700",
      dark: "bg-purple-900",
      border: "border-purple-300",
    },
    red: {
      bg: "bg-red-500",
      hover: "hover:bg-red-600",
      light: "bg-red-100",
      text: "text-red-700",
      dark: "bg-red-900",
      border: "border-red-300",
    },
    blue: {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
      light: "bg-blue-100",
      text: "text-blue-700",
      dark: "bg-blue-900",
      border: "border-blue-300",
    },
    green: {
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
      light: "bg-green-100",
      text: "text-green-700",
      dark: "bg-green-900",
      border: "border-green-300",
    },
    emerald: {
      bg: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
      light: "bg-emerald-100",
      text: "text-emerald-700",
      dark: "bg-emerald-900",
      border: "border-emerald-300",
    },
    teal: {
      bg: "bg-teal-500",
      hover: "hover:bg-teal-600",
      light: "bg-teal-100",
      text: "text-teal-700",
      dark: "bg-teal-900",
      border: "border-teal-300",
    },
    sky: {
      bg: "bg-sky-500",
      hover: "hover:bg-sky-600",
      light: "bg-sky-100",
      text: "text-sky-700",
      dark: "bg-sky-900",
      border: "border-sky-300",
    },
    orange: {
      bg: "bg-orange-500",
      hover: "hover:bg-orange-600",
      light: "bg-orange-100",
      text: "text-orange-700",
      dark: "bg-orange-900",
      border: "border-orange-300",
    },
    indigo: {
      bg: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      light: "bg-indigo-100",
      text: "text-indigo-700",
      dark: "bg-indigo-900",
      border: "border-indigo-300",
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  const baseClasses =
    "p-4 rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer text-left h-full flex flex-col justify-between border-2";

  const moduleClasses = isModule
    ? `bg-gradient-to-br ${colors.bg} to-${color}-600 text-white ${colors.border} hover:shadow-2xl hover:scale-105`
    : `bg-white dark:bg-gray-800 ${colors.border} hover:shadow-xl hover:scale-102 text-gray-800 dark:text-gray-200`;

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    development:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    beta: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    planned: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const handleNavigation = () => {
    console.log(`Navigating to: ${path}`);
    if (path && path !== "#") {
      window.location.href = path;
    }
  };

  return (
    <div
      className={`${baseClasses} ${moduleClasses} group relative overflow-hidden`}
      onClick={handleNavigation}
    >
      {/* Animated background effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isModule ? "rotate-180" : ""
        }`}
      ></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon
              className={`w-5 h-5 ${isModule ? "text-white" : colors.text}`}
            />
            <h3
              className={`text-sm font-bold ${
                isModule ? "text-white" : "text-gray-900 dark:text-white"
              }`}
            >
              {title}
            </h3>
          </div>
          <div className="flex space-x-1">
            {isProtected && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-yellow-500 text-white flex items-center">
                <LockClosedIcon className="w-3 h-3 mr-0.5" />
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 text-xs rounded-full ${statusColors[status]}`}
            >
              {status}
            </span>
          </div>
        </div>

        <p className="text-xs mb-3 line-clamp-2 opacity-90">{description}</p>

        <div className="mt-auto">
          <code className="text-xs font-mono break-all opacity-75 bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
            {path}
          </code>
          {requiredRoles && (
            <p className="text-xs mt-1 opacity-75">
              👥 {requiredRoles.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Connector Component with animated design
const FlowConnector = ({
  color = "blue",
  direction = "vertical",
  length = "long",
}) => {
  const colorMap = {
    purple: "bg-purple-400",
    red: "bg-red-400",
    blue: "bg-blue-400",
    green: "bg-green-400",
    emerald: "bg-emerald-400",
    teal: "bg-teal-400",
    sky: "bg-sky-400",
    orange: "bg-orange-400",
    indigo: "bg-indigo-400",
  };

  const heightClass = length === "long" ? "h-8" : "h-4";
  const widthClass = length === "long" ? "w-8" : "w-4";

  if (direction === "horizontal") {
    return (
      <div className="flex items-center my-4">
        <div
          className={`${widthClass} ${heightClass} ${colorMap[color]} rounded-full animate-pulse`}
        ></div>
        <ArrowRightIcon
          className={`w-6 h-6 ${colorMap[color].replace("bg-", "text-")} mx-2`}
        />
        <div
          className={`${widthClass} ${heightClass} ${colorMap[color]} rounded-full animate-pulse`}
        ></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-2">
      <div
        className={`w-1 ${heightClass} ${colorMap[color]} rounded-full animate-pulse relative`}
      >
        <div className="absolute inset-0 bg-white dark:bg-gray-800 animate-ping opacity-20 rounded-full"></div>
      </div>
    </div>
  );
};

// Module Header Component
const ModuleHeader = ({
  title,
  description,
  color,
  icon: Icon,
  stats,
  isExpanded,
  onToggle,
}) => {
  const colorMap = {
    purple: "from-purple-500 to-indigo-600",
    red: "from-red-500 to-pink-600",
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    emerald: "from-emerald-500 to-teal-600",
    teal: "from-teal-500 to-cyan-600",
    sky: "from-sky-500 to-blue-600",
    orange: "from-orange-500 to-red-600",
    indigo: "from-indigo-500 to-purple-600",
  };

  const gradient = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] mb-6`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-blue-100 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {stats && (
            <div className="text-right">
              <div className="text-sm opacity-90">{stats.routes} Routes</div>
              <div className="text-xs opacity-75">
                {stats.protected} Protected
              </div>
            </div>
          )}
          <div
            className={`transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDownIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Flowchart Component ---
const AgriConnectSystemFlowchart = () => {
  const [expandedModules, setExpandedModules] = useState({
    authentication: true,
    aiTools: true,
    marketplace: true,
    chatbot: true,
    dashboards: true,
  });
  const [viewMode, setViewMode] = useState("hierarchical"); // hierarchical, grid, compact

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };
  // Custom icons
  const ChartBarIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
  const CloudIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z"
      />
    </svg>
  );

  const MagnifyingGlassIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
  // Enhanced data structure with hierarchical relationships
  const systemArchitecture = {
    entry: {
      id: "entry",
      title: "Application Entry Point",
      path: "/",
      description: "Primary landing and navigation hub",
      color: "purple",
      icon: HomeIcon,
      status: "active",
      isModule: true,
      stats: { routes: 1, protected: 0 },
    },
    modules: [
      {
        id: "authentication",
        title: "Authentication & Security",
        description: "User authentication, authorization and error handling",
        color: "red",
        icon: ShieldCheckIcon,
        stats: { routes: 3, protected: 0 },
        routes: [
          {
            title: "Login/Auth Handler",
            path: "/auth/v1/app/:id/AgriSupport/:token",
            description: "Secure token-based authentication endpoint",
            isProtected: false,
            status: "active",
            icon: LockClosedIcon,
          },
          {
            title: "Unauthorized Access",
            path: "/unauthorized",
            description: "Access denied and permission error pages",
            isProtected: false,
            status: "active",
            icon: EyeIcon,
          },
          {
            title: "Global 404 Catch-All",
            path: "*",
            description: "Fallback route for undefined paths",
            isProtected: false,
            status: "active",
            icon: DocumentTextIcon,
          },
        ],
      },
      {
        id: "aiTools",
        title: "AI & Advisory Tools",
        description: "Machine learning powered agricultural intelligence",
        color: "blue",
        icon: CpuChipIcon,
        stats: { routes: 5, protected: 0 },
        routes: [
          {
            title: "Crop Disease Detection",
            path: "/crop-disease",
            description: "AI-powered image analysis for crop health",
            isProtected: false,
            status: "active",
            icon: CubeIcon,
          },
          {
            title: "Disease Result Analysis",
            path: "/:farmId/results",
            description: "Detailed diagnosis and treatment recommendations",
            isProtected: false,
            status: "active",
            icon: DocumentTextIcon,
          },
          {
            title: "Yield Prediction Model",
            path: "/crop-yield",
            description: "LSTM-based crop yield forecasting",
            isProtected: false,
            status: "active",
            icon: ChartBarIcon,
          },
          {
            title: "Weather Intelligence",
            path: "/weather",
            description: "Real-time weather analytics and forecasts",
            isProtected: false,
            status: "active",
            icon: CloudIcon,
          },
          {
            title: "Weed Detection Dashboard",
            path: "/weed-detection",
            description: "YOLOv8 powered weed identification system",
            isProtected: false,
            status: "active",
            icon: MagnifyingGlassIcon,
          },
        ],
      },
      {
        id: "marketplace",
        title: "HarvestLink Marketplace",
        description: "Agricultural e-commerce and trading platform",
        color: "green",
        icon: ShoppingCartIcon,
        stats: { routes: 16, protected: 12 },
        subModules: [
          {
            id: "publicView",
            title: "Public Marketplace",
            color: "emerald",
            description: "Public product browsing and viewing",
            routes: [
              {
                title: "Marketplace Home",
                path: "/harvestLink/v1/agriConnect",
                description: "Main e-commerce landing page",
                isProtected: false,
                status: "active",
              },
              {
                title: "Product Catalog",
                path: "/harvestLink/browse",
                description: "Browse all available products",
                isProtected: false,
                status: "active",
              },
              {
                title: "Product Details",
                path: "/harvestLink/product/:productId",
                description: "Detailed product information",
                isProtected: false,
                status: "active",
              },
              {
                title: "Live Listing View",
                path: "/harvestLink/listing/:listingId",
                description: "Public sales listing display",
                isProtected: false,
                status: "active",
              },
            ],
          },
          {
            id: "userPlatform",
            title: "User Trading Platform",
            color: "teal",
            description: "Protected user trading and management",
            routes: [
              {
                title: "My Inventory",
                path: "/harvestLink/my-products",
                description: "Manage registered products",
                isProtected: true,
                requiredRoles: ["farmer", "trader", "admin"],
                status: "active",
              },
              {
                title: "Create Product",
                path: "/harvestLink/create-product",
                description: "Register new agricultural products",
                isProtected: true,
                requiredRoles: ["farmer", "trader", "admin"],
                status: "active",
              },
              {
                title: "Create Listing",
                path: "/harvestLink/create-listing",
                description: "Create sales listings",
                isProtected: true,
                requiredRoles: ["farmer", "trader", "admin"],
                status: "active",
              },
              {
                title: "My Listings",
                path: "/harvestLink/my-listings",
                description: "Manage active sales listings",
                isProtected: true,
                requiredRoles: ["farmer", "trader", "admin"],
                status: "active",
              },
              {
                title: "Seller Dashboard",
                path: "/harvestLink/seller-dashboard",
                description: "Sales analytics and metrics",
                isProtected: true,
                requiredRoles: ["farmer", "trader", "admin"],
                status: "active",
              },
              {
                title: "Shopping Cart",
                path: "/harvestLink/cart",
                description: "Purchase management",
                isProtected: true,
                status: "active",
              },
              {
                title: "Address Book",
                path: "/harvestLink/addresses",
                description: "Shipping and billing addresses",
                isProtected: true,
                status: "active",
              },
              {
                title: "Checkout Process",
                path: "/harvestLink/checkout",
                description: "Order placement and payment",
                isProtected: true,
                status: "active",
              },
              {
                title: "Order History",
                path: "/harvestLink/orders",
                description: "Past and current orders",
                isProtected: true,
                status: "active",
              },
              {
                title: "Order Tracking",
                path: "/harvestLink/orders/:orderId",
                description: "Detailed order information",
                isProtected: true,
                status: "active",
              },
              {
                title: "Pending Orders",
                path: "/harvestLink/users/orders/pending",
                description: "OTP verification queue",
                isProtected: true,
                status: "active",
              },
              {
                title: "OTP Verification",
                path: "/harvestLink/users/orders/:orderId/verify",
                description: "Delivery confirmation interface",
                isProtected: true,
                status: "active",
              },
            ],
          },
        ],
      },
      {
        id: "chatbot",
        title: "Agribot AI Assistant",
        description: "Intelligent multilingual agricultural assistant",
        color: "sky",
        icon: ChatBubbleLeftRightIcon,
        stats: { routes: 3, protected: 3 },
        routes: [
          {
            title: "Agribot Home",
            path: "/agribot",
            description: "AI assistant landing page",
            isProtected: true,
            status: "beta",
          },
          {
            title: "Chat Interface",
            path: "/agribot/chat",
            description: "Main conversational interface",
            isProtected: true,
            status: "beta",
          },
          {
            title: "Admin Panel",
            path: "/agribot/admin",
            description: "Bot configuration and knowledge management",
            isProtected: true,
            requiredRoles: ["admin"],
            status: "beta",
          },
        ],
      },
      {
        id: "dashboards",
        title: "Dashboards & Analytics",
        description: "Role-based dashboards and administrative controls",
        color: "orange",
        icon: UserGroupIcon,
        stats: { routes: 6, protected: 6 },
        routes: [
          {
            title: "User Dashboard",
            path: "/user/dashboard/:userid",
            description: "Personalized user portal",
            isProtected: true,
            status: "active",
          },
          {
            title: "Farmer/Trader Dashboard",
            path: "/Farmer/dashboard/:userid",
            description: "Production and sales analytics",
            isProtected: true,
            status: "active",
          },
          {
            title: "Admin Dashboard",
            path: "/Admin/dashboard/:userid",
            description: "System-wide administration",
            isProtected: true,
            requiredRoles: ["admin"],
            status: "active",
          },
          {
            title: "Product Moderation",
            path: "/harvestLink/admin/products/pending",
            description: "Product approval queue",
            isProtected: true,
            requiredRoles: ["admin"],
            status: "active",
          },
          {
            title: "Listing Moderation",
            path: "/harvestLink/admin/listings/pending",
            description: "Sales listing approval",
            isProtected: true,
            requiredRoles: ["admin"],
            status: "active",
          },
          {
            title: "User Management",
            path: "/harvestLink/admin/users",
            description: "User accounts and permissions",
            isProtected: true,
            requiredRoles: ["admin"],
            status: "active",
          },
        ],
      },
    ],
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-2xl top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                <MapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AgriConnect Route Map
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Hierarchical System Architecture Visualization
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {["hierarchical", "grid", "compact"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                      viewMode === mode
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-semibold text-sm">
                  {systemArchitecture.modules.reduce(
                    (total, module) => total + module.stats.routes,
                    0
                  ) + 1}{" "}
                  Total Routes
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Entry Point */}
        <div className="text-center mb-12">
          <FlowNode {...systemArchitecture.entry} />
          <FlowConnector color="purple" />
        </div>

        {/* Modules */}
        <div className="space-y-8">
          {systemArchitecture.modules.map((module) => (
            <div key={module.id} id={module.id} className="scroll-mt-24">
              <ModuleHeader
                {...module}
                isExpanded={expandedModules[module.id]}
                onToggle={() => toggleModule(module.id)}
              />

              {expandedModules[module.id] && (
                <div className="space-y-6">
                  {/* Direct Routes */}
                  {module.routes && (
                    <div
                      className={`grid gap-4 ${
                        viewMode === "compact"
                          ? "grid-cols-1"
                          : viewMode === "grid"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                          : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                      }`}
                    >
                      {module.routes.map((route, index) => (
                        <FlowNode key={index} {...route} color={module.color} />
                      ))}
                    </div>
                  )}

                  {/* Sub-modules */}
                  {module.subModules && (
                    <div className="space-y-8 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
                      {module.subModules.map((subModule, subIndex) => (
                        <div key={subModule.id}>
                          <div className="flex items-center space-x-3 mb-4">
                            <div
                              className={`w-3 h-3 rounded-full bg-${subModule.color}-500`}
                            ></div>
                            <h3
                              className={`text-lg font-bold text-${subModule.color}-700 dark:text-${subModule.color}-300`}
                            >
                              {subModule.title}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {subModule.description}
                            </span>
                          </div>

                          <div
                            className={`grid gap-4 ${
                              viewMode === "compact"
                                ? "grid-cols-1"
                                : viewMode === "grid"
                                ? "grid-cols-1 md:grid-cols-2"
                                : "grid-cols-1 lg:grid-cols-2"
                            }`}
                          >
                            {subModule.routes.map((route, routeIndex) => (
                              <FlowNode
                                key={routeIndex}
                                {...route}
                                color={subModule.color}
                              />
                            ))}
                          </div>

                          {subIndex < module.subModules.length - 1 && (
                            <FlowConnector
                              color={module.color}
                              length="short"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <FlowConnector color={module.color} />
            </div>
          ))}
        </div>

        {/* System Footer */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl p-8 text-white shadow-2xl max-w-2xl mx-auto">
            <ServerIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">
              System Architecture Complete
            </h3>
            <p className="text-gray-200">
              AgriConnect Platform - All Routes Mapped and Functional
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div>
                <div className="font-bold">Frontend</div>
                <div className="text-gray-300">React • Port 3000</div>
              </div>
              <div>
                <div className="font-bold">Backend</div>
                <div className="text-gray-300">Node.js • Port 5000</div>
              </div>
              <div>
                <div className="font-bold">ML Server</div>
                <div className="text-gray-300">Python • Port 5500</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Sidebar */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 hidden xl:block">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            QUICK NAV
          </div>
          {systemArchitecture.modules.map((module) => (
            <a
              key={module.id}
              href={`#${module.id}`}
              className={`block p-2 rounded-lg text-xs font-medium transition-colors bg-${module.color}-100 dark:bg-${module.color}-900 text-${module.color}-700 dark:text-${module.color}-300 hover:bg-${module.color}-200 dark:hover:bg-${module.color}-800`}
            >
              {module.title.split(" ")[0]}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgriConnectSystemFlowchart;
