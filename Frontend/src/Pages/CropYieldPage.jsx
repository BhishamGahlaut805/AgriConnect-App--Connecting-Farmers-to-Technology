import React, { useEffect, useState, useCallback,useMemo } from "react";
import { fetchYieldByState } from "../API/YieldService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
// Assuming custom icon components are correctly implemented
import { CropIcons } from "../icons/Cropicons";
import {
  ChevronLeft,
  ChevronRight,
  BarChart2,
  TrendingUp,
  MapPin,
  Filter,
  Database,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
} from "lucide-react";
import IndianMap from "../SubComponents/indianMap";

import cardcontainerimage1 from "../assets/images/cont1.png";
import cardcontainerimage2 from "../assets/images/cont2.png";
import cardcontainerimage3 from "../assets/images/cont3.png";
import cardcontainerimage4 from "../assets/images/cont4.png";
import image1 from "../assets/images/bg1.png";
import image2 from "../assets/images/bg2.png";
import image3 from "../assets/images/bg3.png";
import image4 from "../assets/images/bg4.png";
import campingimg from "/src/assets/images/camping.gif";
import newimg from "/src/assets/images/newi.gif";
import envirimg from "/src/assets/images/environment.gif";
import harvestimg from "/src/assets/images/fruit.gif";
import agribotimg from "/src/assets/images/chat-bot.gif";
import communityimg from "/src/assets/images/communityimg.gif";

// Assuming custom Button component
import { Button } from "../ui/Button";
// Assuming external component for price stats
import PriceStatisticsPage from "../SubComponents/PriceStatistics";
import { Tooltip as ReactTooltip } from "react-tooltip";
import CropYieldHero from "../SubComponents/CropYieldHero";
// High-quality crop images mapping (Static data is fine)
const CROP_IMAGES = {
  Rice: "https://www.upag.gov.in/assets/png/1.png",
  Wheat: "https://www.upag.gov.in/assets/png/2.png",
  Maize: "https://www.upag.gov.in/assets/png/5.png",
  Jowar: "https://www.upag.gov.in/assets/png/3.png",
  Bajra: "https://www.upag.gov.in/assets/png/4.png",
  Ragi: "https://www.upag.gov.in/assets/png/6.png",
  Tur: "https://www.upag.gov.in/assets/png/7.png",
  Urad: "https://www.upag.gov.in/assets/png/8.png",
  Moong: "https://www.upag.gov.in/assets/png/9.png",
  Gram: "https://www.upag.gov.in/assets/png/10.png",
  Lentil: "https://www.upag.gov.in/assets/png/11.png",
  Barley: "https://www.upag.gov.in/assets/png/12.png",
  "Other Pulses": "https://www.upag.gov.in/assets/png/13.png",
  "Total Pulses": "https://www.upag.gov.in/assets/png/13.png",
  "Total Food Grains": "https://www.upag.gov.in/assets/png/14.png",
  "Nutri/Coarse Cereals": "https://www.upag.gov.in/assets/png/2.png",
  "Small Millets": "https://www.upag.gov.in/assets/png/2.png",
  "Shree Anna /Nutri Cereals": "https://www.upag.gov.in/assets/png/2.png",
  Default: "https://www.upag.gov.in/assets/png/31.png",
};

const CROP_CATEGORIES = {
  kharif: [
    "Rice",
    "Cereals",
    "Total Food Grains",
    "Maize",
    "Nutri/Coarse Cereals",
    "Tur",
    "Jowar",
    "Bajra",
    "Ragi",
    "Small Millets",
    "Shree Anna /Nutri Cereals",
    "Urad",
    "Moong",
    "Other Pulses",
  ],
  rabi: [
    "Urad",
    "Moong",
    "Total Food Grains",
    "Rice",
    "Maize",
    "Jowar",
    "Shree Anna /Nutri Cereals",
    "Nutri/Coarse Cereals",
    "Cereals",
    "Other Pulses",
    "Gram",
    "Lentil",
    "Wheat",
    "Barley",
  ],
  cereals: [
    "Rice",
    "Wheat",
    "Maize",
    "Jowar",
    "Bajra",
    "Ragi",
    "Small Millets",
    "Shree Anna /Nutri Cereals",
    "Nutri/Coarse Cereals",
    "Cereals",
    "Barley",
  ],
  pulses: [
    "Tur",
    "Urad",
    "Moong",
    "Other Pulses",
    "Gram",
    "Lentil",
    "Total Pulses",
  ],
};

const YIELD_UNITS = [
  { value: "kg_per_ha", label: "Kg/Hectare" },
  { value: "quintal_per_ha", label: "Quintals/Hectare" },
  { value: "quintal_per_acre", label: "Quintals/Acre" },
];

const KG_TO_QUINTAL = 100;
const HECTARE_TO_ACRE = 2.47105;

// Convert yield utility function
const convertYield = (valueInKgPerHa, unit) => {
  if (valueInKgPerHa === null || valueInKgPerHa === undefined) return null;
  const value = parseFloat(valueInKgPerHa);
  if (isNaN(value)) return null;

  switch (unit) {
    case "kg_per_ha":
      return value;
    case "quintal_per_ha":
      return value / KG_TO_QUINTAL;
    case "quintal_per_acre":
      return value / KG_TO_QUINTAL / HECTARE_TO_ACRE;
    default:
      return value;
  }
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label, title, valueSuffix = "" }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-blue-200 dark:border-blue-800">
      <p className="font-bold mb-1 text-gray-800 dark:text-gray-200">{label}</p>
      <p className="text-blue-600 dark:text-blue-400 text-md">
        {title}: {payload[0].value?.toFixed(2)}
        {valueSuffix}
      </p>
    </div>
  );
};

// --- Dialog Components (Re-used as they are functional) ---

const Dialog = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Fixed inset overlay for dialog background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm p-4">
      {/* Dialog container with improved centering and responsiveness */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[800px] border-4 border-blue-500 dark:border-blue-600 overflow-hidden transform transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 dark:bg-gray-700/70 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors"
          aria-label="Close dialog"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => (
  <div className="h-full flex flex-col">{children}</div>
);
const DialogHeader = ({ children }) => (
  <div className="border-b border-blue-100 dark:border-blue-900 p-6 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
    {children}
  </div>
);
const DialogTitle = ({ children }) => (
  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">
    {children}
  </h2>
);
const DialogDescription = ({ children }) => (
  <p className="text-blue-600 dark:text-blue-400 mt-1">{children}</p>
);

const YieldChartDialog = ({ crop, state, data, yieldUnit, onClose }) => {
  const unitLabel =
    YIELD_UNITS.find((u) => u.value === yieldUnit)?.label || "Kg/Hectare";
  const cropImage = CROP_IMAGES[crop] || CROP_IMAGES.Default;
  const validData = data.filter((d) => d.yield_kg_per_ha !== null);
  const latestYear =
    validData.length > 0 ? validData[validData.length - 1]?.year : "Current";

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={cropImage}
              alt={crop}
              className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200 dark:border-blue-800 flex-shrink-0"
            />
            <div>
              <DialogTitle>{crop} Yield Analysis</DialogTitle>
              <DialogDescription>
                {state} • {validData[0]?.year || "N/A"} - {latestYear} Analysis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Yield Trend Chart */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
              Yield Trend (Last 5 Years)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={validData.map((item) => ({
                    ...item,
                    yield_display: convertYield(
                      item.yield_kg_per_ha,
                      yieldUnit
                    ),
                  }))}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="year" stroke="#3b82f6" />
                  <YAxis
                    stroke="#3b82f6"
                    label={{
                      value: unitLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "#1e40af",
                      offset: -5,
                    }}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        title="Yield"
                        valueSuffix={` ${unitLabel}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="yield_display"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Statistics & Comparison */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
              Key Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {YIELD_UNITS.map((unit) => {
                const values = validData
                  .map((d) => convertYield(d.yield_kg_per_ha, unit.value))
                  .filter((v) => v !== null);

                const avg =
                  values.length > 0
                    ? values.reduce((a, b) => a + b, 0) / values.length
                    : null;

                return (
                  <div
                    key={unit.value}
                    className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Average Yield
                    </p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {avg?.toFixed(2) || "N/A"}
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">
                      {unit.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {validData.length > 1 && (
              <div className="space-y-3 pt-4 border-t border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 text-lg">
                  Yield Comparison
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[120px] p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      First Year ({validData[0]?.year})
                    </p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      {convertYield(
                        validData[0]?.yield_kg_per_ha,
                        yieldUnit
                      )?.toFixed(2)}{" "}
                      <span className="text-xs">{unitLabel.split("/")[0]}</span>
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px] p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Latest Year ({latestYear})
                    </p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      {convertYield(
                        validData[validData.length - 1]?.yield_kg_per_ha,
                        yieldUnit
                      )?.toFixed(2)}{" "}
                      <span className="text-xs">{unitLabel.split("/")[0]}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Crop Card Component (Minor structural improvements) ---
const CropCard = React.memo(({ entry, yieldUnit, onClick }) => {
  const CropIcon = CropIcons[entry.crop] || BarChart2; // Fallback icon
  const predictedYieldValue = convertYield(
    entry.prediction?.predicted_yield,
    yieldUnit
  );
  const unitLabel =
    YIELD_UNITS.find((u) => u.value === yieldUnit)?.label || "Kg/Hectare";
  const cropImage = CROP_IMAGES[entry.crop] || CROP_IMAGES.Default;

  // Last year's yield is the *latest* historical data point
  const lastYearYieldData = entry.last_5_years
    ?.filter((y) => y.yield_kg_per_ha !== null)
    .pop();
  const lastYearYield = convertYield(
    lastYearYieldData?.yield_kg_per_ha,
    yieldUnit
  );

  const yieldChange =
    predictedYieldValue && lastYearYield
      ? predictedYieldValue - lastYearYield
      : null;

  if (!predictedYieldValue) return null;

  return (
    <div
      className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 border-t-4 border-t-blue-500 hover:shadow-xl cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="h-32 relative overflow-hidden rounded-t-xl">
        <img
          src={cropImage}
          alt={entry.crop}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-end p-3">
          <h3 className="text-xl font-bold text-white">{entry.crop}</h3>
        </div>
        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
          {entry.season}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Predicted Yield (2025-26)
            </p>
            <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
              {predictedYieldValue.toFixed(2)}
              <span className="text-sm ml-1 font-medium text-blue-500 dark:text-blue-400">
                {unitLabel.split("/")[0]}
              </span>
            </p>
          </div>
          <CropIcon className="text-green-500 w-8 h-8 flex-shrink-0" />
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span>
            Last Year ({lastYearYieldData?.year || "N/A"}):{" "}
            {lastYearYield?.toFixed(2) || "N/A"}
          </span>
          {yieldChange !== null && (
            <span
              className={`font-semibold ${
                yieldChange >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {yieldChange >= 0 ? "↑" : "↓"} {Math.abs(yieldChange).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// --- Crop Category Row (Crucial for horizontal scroll) ---
const CropCategoryRow = ({ title, crops, yieldData, yieldUnit }) => {
  const filteredCrops = yieldData.filter(
    (entry) =>
      crops.includes(entry.crop) && entry.prediction?.predicted_yield !== null
  );

  const [selectedCrop, setSelectedCrop] = useState(null);

  if (filteredCrops.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Category Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 tracking-wide border-b-2 border-blue-500/50 pb-1">
          {title} Crops Forecast
        </h3>
      </div>

      {/* Scrollable Container - Implemented with Tailwind utility classes for responsiveness and scroll behavior */}
      <div className="relative">
        <div
          className="flex space-x-6 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-700 dark:scrollbar-track-blue-900/30"
          style={{ WebkitOverflowScrolling: "touch" }} // Ensures native-feeling scroll on iOS
        >
          {filteredCrops.map((entry, idx) => (
            <div
              key={`yield-card-${idx}`}
              className="flex-shrink-0" // Important: prevents stretching
              style={{ minWidth: "288px" }} // min-w-72
            >
              <CropCard
                entry={entry}
                yieldUnit={yieldUnit}
                onClick={() => setSelectedCrop(entry)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Crop details chart modal */}
      {selectedCrop && (
        <YieldChartDialog
          crop={selectedCrop.crop}
          state={selectedCrop.state}
          data={selectedCrop.last_5_years || []}
          yieldUnit={yieldUnit}
          onClose={() => setSelectedCrop(null)}
        />
      )}
    </div>
  );
};


// --- Hero Section (Responsive design) ---
const HeroSection = ({ yieldState, yieldData, selectedCrop, onCropSelect }) => {
  const totalCrops = yieldData.filter(
    (entry) => entry.prediction?.predicted_yield
  ).length;
  const availableStates = [...new Set(yieldData.map((entry) => entry.state))]
    .length;

  return (
    <div className="relative bg-gradient-to-tr from-teal-500 via-cyan-500 to-sky-600 dark:from-teal-900 dark:via-cyan-900 dark:to-sky-950 rounded-2xl shadow-2xl overflow-hidden mb-8">
      {/* Background Shapes for visual interest */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 p-6 md:p-6 lg:p-2">
        <div>
          <CropYieldHero
            yieldState={yieldState}
            totalCrops={totalCrops}
            availableStates={availableStates}
          />
          {/* Quick Crop Selector (Col span 1) */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/30 self-stretch flex flex-col justify-center">
            <h3 className="text-white text-xl font-bold mb-4">
              Quick Crop Select
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {["Rice", "Wheat", "Maize", "Pulses"].map((crop) => (
                <button
                  key={crop}
                  onClick={() => onCropSelect(crop)}
                  className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 border-2 ${
                    selectedCrop === crop
                      ? "bg-yellow-400 text-gray-900 border-yellow-200 shadow-md transform scale-[1.02]"
                      : "bg-white/20 text-white border-white/10 hover:bg-white/30 hover:shadow-lg"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Navigation Item Component
const SidebarNavItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  sidebarOpen,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center p-3 w-full rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-300 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
        : "hover:bg-white/10 text-blue-100 hover:text-white hover:shadow-md"
    } ${!sidebarOpen ? "justify-center" : ""}`}
    aria-current={isActive ? "page" : undefined}
    title={!sidebarOpen ? label : undefined}
  >
    <div className={`relative flex items-center ${sidebarOpen ? "w-full" : "w-auto"}`}>
      <Icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
        isActive ? "scale-110" : "group-hover:scale-110"
      }`} />
      {sidebarOpen && (
        <span className="ml-4 whitespace-nowrap overflow-hidden font-medium text-left text-lg">
          {label}
        </span>
      )}
      {isActive && sidebarOpen && (
        <div className="absolute right-0 w-1 h-6 bg-yellow-400 rounded-full"></div>
      )}
    </div>
  </button>
);

// Enhanced Sidebar Component
const EnhancedSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  yieldState,
  setYieldState,
  yieldUnit,
  setYieldUnit
}) => {
  const navigationItems = [
    { key: "yield", label: "Yield Forecast", icon: BarChart2 },
    { key: "prices", label: "Price Statistics", icon: TrendingUp },
    { key: "map", label: "Yield Map", icon: MapPin },
    { key: "data", label: "Data Sources", icon: Database },
  ];

  const availableStates = [
    "All India",
    "Andhra Pradesh",
    "Bihar",
    "Gujarat",
    "Haryana",
    "Karnataka",
    "Madhya Pradesh",
    "Maharashtra",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Uttar Pradesh",
    "West Bengal",
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-36 lg:sticky gap-4 z-49 transition-all duration-500 ease-in-out
          ${
            sidebarOpen
              ? "translate-x-0 w-80"
              : "-translate-x-full lg:translate-x-0 lg:w-20"
          }
          h-[calc(400vh-4rem)] bg-gradient-to-b from-violet-900 via-purple-900 to-purple-800
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
          text-white flex flex-col border-r border-purple-600/30 dark:border-gray-700
          shadow-2xl shadow-purple-500/10`}
      >
        {/* Sidebar Header */}
        <div
          className={`p-6 flex items-center justify-between border-b border-purple-600/30 dark:border-gray-700 transition-all duration-300 ${
            !sidebarOpen && "flex-col justify-center space-y-3"
          }`}
        >
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                    AgriConnect Pro
                  </h2>
                  <p className="text-xs text-purple-200">
                    AI Powered Analytics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
                aria-label="Collapse sidebar"
                title="Collapse menu"
              >
                <ChevronLeft className="w-5 h-5 text-white group-hover:text-yellow-300" />
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
                aria-label="Expand sidebar"
                title="Expand menu"
              >
                <ChevronRight className="w-5 h-5 text-white group-hover:text-yellow-300" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav>
            <ul className="space-y-3 px-4">
              {navigationItems.map((item) => (
                <li
                  key={item.key}
                  className={!sidebarOpen ? "flex justify-center" : ""}
                >
                  <SidebarNavItem
                    icon={item.icon}
                    label={item.label}
                    isActive={activeTab === item.key}
                    onClick={() => {
                      setActiveTab(item.key);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    sidebarOpen={sidebarOpen}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Actions Section - Only when sidebar is open */}
          {sidebarOpen && (
            <div className="mt-8 px-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-purple-200 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white">
                    📊 Export Report
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white">
                    🔔 Set Alerts
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white">
                    📈 Compare Regions
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Yield Filters Section */}
          {activeTab === "yield" && sidebarOpen && (
            <div className="p-4 border-t border-purple-600/30 dark:border-gray-700 bg-gradient-to-t from-purple-900/50 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-yellow-400" />
                  Yield Filters
                </h3>
                <div
                  className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                  title="Live Data"
                ></div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-200">
                    🌍 Select State
                  </label>
                  <Select value={yieldState} onValueChange={setYieldState}>
                    <SelectTrigger className="w-full bg-white/10 border-purple-500/50 text-white hover:border-purple-400 transition-colors backdrop-blur-sm">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500 text-white z-50 backdrop-blur-sm">
                      {availableStates.map((state) => (
                        <SelectItem
                          key={state}
                          value={state}
                          className="hover:bg-purple-600 cursor-pointer focus:bg-purple-600 focus:text-white"
                        >
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-200">
                    📏 Display Unit
                  </label>
                  <Select value={yieldUnit} onValueChange={setYieldUnit}>
                    <SelectTrigger className="w-full bg-white/10 border-purple-500/50 text-white hover:border-purple-400 transition-colors backdrop-blur-sm">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500 text-white z-50 backdrop-blur-sm">
                      {YIELD_UNITS.map((unit) => (
                        <SelectItem
                          key={unit.value}
                          value={unit.value}
                          className="hover:bg-purple-600 cursor-pointer focus:bg-purple-600 focus:text-white"
                        >
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-4 border-t border-purple-600/30 dark:border-gray-700 transition-all duration-300 ${
            !sidebarOpen ? "text-center" : ""
          }`}
        >
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-300">
                <span>Last Updated</span>
                <span>Just now</span>
              </div>
              <div className="w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent h-px"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    System Active
                  </p>
                  <p className="text-xs text-purple-300">95% Accuracy</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div className="w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent h-px"></div>
              <p className="text-xs text-purple-300">Live</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// --- Main Portal Component ---
export default function CropYieldPortal() {
  const [yieldState, setYieldState] = useState("All India");
  const [yieldUnit, setYieldUnit] = useState("kg_per_ha");
  const [yieldData, setYieldData] = useState([]);
  const [yieldLoading, setYieldLoading] = useState(true);
  const [yieldError, setYieldError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start collapsed on mobile
  const [activeTab, setActiveTab] = useState("yield");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [mapYieldData, setMapYieldData] = useState(null);

  // Set initial dark mode state
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  // In the main useEffect for fetching data - REPLACE:
  useEffect(() => {
    const fetchData = async () => {
      setYieldLoading(true);
      setYieldError(null);
      try {
        const data = await fetchYieldByState(yieldState);
        // console.log(data);
        setYieldData(data);
      } catch (err) {
        console.error("Failed to fetch yield data:", err);
        setYieldError("Failed to load yield data. Please try again later.");
        setYieldData([]);
      } finally {
        setYieldLoading(false);
      }
    };
    fetchData();
  }, [yieldState]);
  // In your parent component

  const [allStatesYieldData, setAllStatesYieldData] = useState([]);
  const [allDataLoading, setAllDataLoading] = useState(false);
  const [allDataError, setAllDataError] = useState(null);

  useEffect(() => {
    const fetchAllStatesYieldData = async () => {
      setAllDataLoading(true);
      setAllDataError(null);

      try {
        // Fetch yield data for all available states in parallel
        const allStatePromises = availableStates.map((state) =>
          fetchYieldByState(state)
        );

        const results = await Promise.all(allStatePromises);

        // Flatten results to a single array
        const flattenedData = results.flat();

        // console.log("All states yield data:", flattenedData);

        setAllStatesYieldData(flattenedData);
      } catch (err) {
        console.error("Failed to fetch yield data for all states:", err);
        setAllDataError(
          "Failed to load yield data for all states. Please try again later."
        );
        setAllStatesYieldData([]);
      } finally {
        setAllDataLoading(false);
      }
    };

    fetchAllStatesYieldData();
  }, []); // run once on mount

  // Effect to manage sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Open sidebar by default on large screens
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        // Keep it closed on mobile/tablet
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on initial load

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const handleStateHover = useCallback((stateName, yieldValue) => {
    setHoveredState(stateName);
    setMapYieldData(yieldValue); // Not strictly needed, but keeps the state sync
  }, []);

  const navigationItems = [
    { key: "yield", label: "Yield Forecast", icon: BarChart2 },
    { key: "prices", label: "Price Statistics", icon: TrendingUp },
    { key: "map", label: "Yield Map", icon: MapPin },
    { key: "data", label: "Data Sources", icon: Database },
  ];

  // States available in the select dropdown
  const availableStates = [
    "All India",
    "Andhra Pradesh",
    "Bihar",
    "Gujarat",
    "Haryana",
    "Karnataka",
    "Madhya Pradesh",
    "Maharashtra",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Uttar Pradesh",
    "West Bengal",
  ];

  return (
    // Min-h-screen ensures the background gradient covers the whole viewport height

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-20 left-0 right-0 z-50 shadow-xl border-b border-blue-200 dark:border-blue-900 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 dark:from-green-700 dark:via-blue-700 dark:to-purple-800 h-16 flex items-center">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left: Menu Button and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 lg:hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              PRAWAH
            </h1>
          </div>

          {/* Center: Tagline */}
          <p className="hidden md:block text-lg font-medium text-white/90 text-center">
            Predictive Rain & Weather Analytics for Agriculture
          </p>

          {/* Right: Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mt-20 flex pt-16">
        {/* Enhanced Sidebar */}
        <EnhancedSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          yieldState={yieldState}
          setYieldState={setYieldState}
          yieldUnit={yieldUnit}
          setYieldUnit={setYieldUnit}
        />

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-500 ease-in-out p-4 md:p-6 min-h-[calc(100vh-4rem)] ${
            sidebarOpen ? "lg:ml-0" : "lg:ml-0"
          }`}
        >
          {activeTab === "yield" && (
            <div className="space-y-8">
              {/* Hero Section */}
              <HeroSection
                yieldState={yieldState}
                yieldData={yieldData}
                selectedCrop={selectedCrop}
                onCropSelect={setSelectedCrop}
              />

              {/* Map Section - Use IndianMap here */}
              <IndianMap
                yieldData={allStatesYieldData}
                selectedCrop={selectedCrop || "Rice"} // Default to Rice for map visualization
                onStateHover={handleStateHover}
                selectedState={hoveredState}
                yieldUnit={yieldUnit}
              />

              {/* Loading State */}
              {yieldLoading && (
                <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-700">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-16 w-16 bg-blue-200 dark:bg-blue-900/50 rounded-full mb-6 flex items-center justify-center">
                      <BarChart2 className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Loading Yield Data
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Analyzing weather patterns and historical data for{" "}
                      {yieldState}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {yieldError && (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <p className="text-xl text-red-600 dark:text-red-400 font-semibold mb-2">
                    {yieldError}
                  </p>
                  <p className="text-red-500 dark:text-red-300">
                    Please try refreshing the page or contact support
                  </p>
                </div>
              )}

              {/* Crop Categories - Only render if data is loaded */}
              {!yieldLoading && !yieldError && yieldData.length > 0 && (
                <div className="space-y-12 pt-4">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b-4 border-blue-500 pb-2">
                    Detailed Crop Forecasts
                  </h2>
                  <CropCategoryRow
                    title="Kharif"
                    crops={CROP_CATEGORIES.kharif}
                    yieldData={yieldData}
                    yieldUnit={yieldUnit}
                  />

                  <CropCategoryRow
                    title="Rabi"
                    crops={CROP_CATEGORIES.rabi}
                    yieldData={yieldData}
                    yieldUnit={yieldUnit}
                  />

                  <CropCategoryRow
                    title="Cereals"
                    crops={CROP_CATEGORIES.cereals}
                    yieldData={yieldData}
                    yieldUnit={yieldUnit}
                  />

                  <CropCategoryRow
                    title="Pulses"
                    crops={CROP_CATEGORIES.pulses}
                    yieldData={yieldData}
                    yieldUnit={yieldUnit}
                  />
                </div>
              )}
            </div>
          )}

          {/* Other Tabs - Cleaned up to ensure proper styling */}
          {activeTab === "prices" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 min-h-96">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Agricultural Price Statistics
              </h2>
              <PriceStatisticsPage />
            </div>
          )}

          {activeTab === "map" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Interactive Yield Map
              </h2>
              <IndianMap
                yieldData={yieldData}
                selectedCrop={selectedCrop || "Rice"}
                onStateHover={handleStateHover}
                selectedState={hoveredState}
                yieldUnit={yieldUnit}
              />
            </div>
          )}

          {activeTab === "data" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
                Data Sources & Methodology
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-indigo-500" />
                    Data Sources
                  </h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400 list-disc list-inside ml-4">
                    <li>IMD Weather Data (Historical & Real-time)</li>
                    <li>Satellite Imagery (NDVI, soil moisture)</li>
                    <li>Soil Health Cards and Soil Type Maps</li>
                    <li>
                      Historical Yield Records (GOI/State Agriculture Dept.)
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" />
                    Methodology
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our **AI models** leverage **Time-Series Forecasting
                    (LSTM)** and **Random Forest** algorithms for highly
                    accurate predictions. The models are trained on regional
                    historical data, adjusting for real-time weather anomalies
                    and projected climate shifts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


