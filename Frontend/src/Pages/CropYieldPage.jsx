import React, { useEffect, useState } from "react";
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

import { CropIcons } from "../icons/Cropicons";
import {
  ChevronDown,
  ChevronUp,
  BarChart2,
  LineChart as LineChartIcon,
  ArrowRight,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  TrendingUp,
  Info,
  ArrowLeft, // Added for collapse icon
} from "lucide-react";
import { Button } from "../ui/Button";
import PriceStatisticsPage from "../SubComponents/PriceStatistics";
import { Tooltip as ReactTooltip } from "react-tooltip";

// High-quality crop images mapping
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

const convertYield = (valueInKgPerHa, unit) => {
  if (valueInKgPerHa === null || valueInKgPerHa === undefined) return null;
  switch (unit) {
    case "kg_per_ha":
      return valueInKgPerHa;
    case "quintal_per_ha":
      return valueInKgPerHa / KG_TO_QUINTAL;
    case "quintal_per_acre":
      return valueInKgPerHa / KG_TO_QUINTAL / HECTARE_TO_ACRE;
    default:
      return valueInKgPerHa;
  }
};

const CustomTooltip = ({ active, payload, label, title, valueSuffix = "" }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-blue-200 dark:border-blue-800">
      <p className="font-bold text-lg mb-1 text-gray-800 dark:text-gray-200">
        {label}
      </p>
      <p className="text-blue-600 dark:text-blue-400 text-lg">
        {title}: {payload[0].value?.toFixed(2)}
        {valueSuffix}
      </p>
    </div>
  );
};

const WeatherFactorTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-blue-200 dark:border-blue-800">
      <p className="font-bold text-lg mb-1 text-gray-800 dark:text-gray-200">
        {label}
      </p>
      <p className="text-green-600 dark:text-green-400 text-lg">
        Impact: {payload[0].value?.toFixed(2)}
      </p>
    </div>
  );
};

const YieldUnitComparison = ({ valueInKgPerHa }) => {
  if (!valueInKgPerHa) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {YIELD_UNITS.map((unit) => (
        <div
          key={unit.value}
          className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-center border border-blue-100 dark:border-blue-800"
        >
          <p className="text-xs text-blue-600 dark:text-blue-300">
            {unit.label}
          </p>
          <p className="font-bold text-blue-800 dark:text-blue-200">
            {convertYield(valueInKgPerHa, unit.value)?.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};

const Dialog = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[85vw] max-w-6xl h-[85vh] max-h-[800px] border-4 border-blue-500 dark:border-blue-600 overflow-hidden transform transition-all duration-300 scale-[0.98] hover:scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
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

const DialogTrigger = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
  >
    {children}
  </button>
);

const YieldChartDialog = ({ crop, state, data, yieldUnit, onClose }) => {
  const unitLabel =
    YIELD_UNITS.find((u) => u.value === yieldUnit)?.label || "Kg/Hectare";
  const cropImage = CROP_IMAGES[crop] || CROP_IMAGES.Default;
  const validData = data.filter((d) => d.yield_kg_per_ha !== null);

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={cropImage}
              alt={crop}
              className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200 dark:border-blue-800"
            />
            <div>
              <DialogTitle>{crop} Yield Analysis</DialogTitle>
              <DialogDescription>
                {state} • {validData[0]?.year || "Current"} - Current
                (2025-2026) Analysis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-auto">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900">
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
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis
                    dataKey="year"
                    stroke="#3b82f6"
                    tick={{ fill: "#1e40af" }}
                  />
                  <YAxis
                    stroke="#3b82f6"
                    label={{
                      value: unitLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "#1e40af",
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
                    dataKey="yield_display"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
              Key Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {YIELD_UNITS.map((unit) => {
                const values = validData.map((d) =>
                  convertYield(d.yield_kg_per_ha, unit.value)
                );
                const avg =
                  values.length > 0
                    ? values.reduce((a, b) => a + b, 0) / values.length
                    : null;

                return (
                  avg && (
                    <div
                      key={unit.value}
                      className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"
                    >
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {unit.label}
                      </p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {avg.toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-500 dark:text-blue-400">
                        Avg. yield
                      </p>
                    </div>
                  )
                );
              })}
            </div>

            {validData.length > 1 && (
              <div className="space-y-3">
                <h4 className="font-medium text-blue-700 dark:text-blue-300">
                  Yield Change
                </h4>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    First Year:{" "}
                    {convertYield(
                      validData[0]?.yield_kg_per_ha,
                      yieldUnit
                    )?.toFixed(2)}{" "}
                    {unitLabel}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    Latest:{" "}
                    {convertYield(
                      validData[validData.length - 1]?.yield_kg_per_ha,
                      yieldUnit
                    )?.toFixed(2)}{" "}
                    {unitLabel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CropCard = ({ entry, yieldUnit, onClick }) => {
  const CropIcon = CropIcons[entry.crop] || CropIcons.Default;
  const predictedYieldValue = convertYield(
    entry.prediction?.predicted_yield,
    yieldUnit
  );
  const unitLabel =
    YIELD_UNITS.find((u) => u.value === yieldUnit)?.label || "Kg/Hectare";
  const cropImage = CROP_IMAGES[entry.crop] || CROP_IMAGES.Default;
  const lastYearYield = convertYield(
    entry.last_5_years?.[0]?.yield_kg_per_ha,
    yieldUnit
  );
  const yieldChange =
    predictedYieldValue && lastYearYield
      ? (predictedYieldValue - lastYearYield).toFixed(2)
      : null;

  if (!predictedYieldValue) return null;

  return (
    <div
      className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-b-blue-500 cursor-pointer"
      onClick={onClick}
    >
      <div className="h-40 relative overflow-hidden rounded-t-xl">
        <img
          src={cropImage}
          alt={entry.crop}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-xl font-bold text-white">{entry.crop}</h3>
          <p className="text-sm text-blue-200">{entry.state}</p>
        </div>
        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {entry.season}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Predicted Yield
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {predictedYieldValue.toFixed(2)}
              <span className="text-sm ml-1 text-blue-500">{unitLabel}</span>
            </p>
          </div>
          <CropIcon className="text-green-500 text-3xl" />
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Last year: {lastYearYield?.toFixed(2) || "N/A"}</span>
          {yieldChange && (
            <span
              className={yieldChange >= 0 ? "text-green-600" : "text-red-600"}
            >
              {yieldChange >= 0 ? "↑" : "↓"} {Math.abs(yieldChange)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

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
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 tracking-wide">
          {title} Crops
        </h3>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        <div
          className="flex space-x-4 pb-4"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          {filteredCrops.map((entry, idx) => (
            <div
              key={`yield-card-${idx}`}
              className="snap-start shrink-0"
              style={{ minWidth: "260px" }}
            >
              <CropCard
                entry={entry}
                yieldUnit={yieldUnit}
                onClick={() => setSelectedCrop(entry)}
                className="transition-transform transform hover:scale-[1.03] hover:shadow-lg duration-300 ease-out border border-blue-200 dark:border-blue-700 rounded-xl"
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
          data={selectedCrop.last_5_years.filter(
            (y) => y.yield_kg_per_ha !== null
          )}
          yieldUnit={yieldUnit}
          onClose={() => setSelectedCrop(null)}
        />
      )}
    </div>
  );
};

export default function CropYieldPortal() {
  const [yieldState, setYieldState] = useState("All India");
  const [yieldUnit, setYieldUnit] = useState("kg_per_ha");
  const [yieldData, setYieldData] = useState([]);
  const [yieldLoading, setYieldLoading] = useState(true);
  const [yieldError, setYieldError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open by default for desktop
  const [activeTab, setActiveTab] = useState("yield");
  const [darkMode, setDarkMode] = useState(false); // Unused in this snippet but kept for completeness

  // Effect to fetch yield data based on yieldState
  useEffect(() => {
    const fetchData = async () => {
      setYieldLoading(true);
      setYieldError(null);
      try {
        const data = await fetchYieldByState(yieldState);
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
  }, [yieldState]); // Refetch when yieldState changes

  // Effect to manage sidebar responsiveness on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // 'lg' breakpoint
        setSidebarOpen(false); // Open sidebar by default on desktop
      } else {
        setSidebarOpen(false); // Close sidebar by default on mobile
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount to set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 font-inter">
      <ReactTooltip effect="solid" place="top" />

      {/* Header */}
      <header className="w-full shadow-md border-b border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-200 via-blue-100 to-green-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 h-16 flex items-center">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
          {/* Left: Title */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-green-900 dark:text-green-100">
            PRAWAH
          </h1>

          {/* Right: Tagline */}
          <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 text-right">
            Predictive Rain & Weather Analytics for Agriculture and Horticulture
          </p>
        </div>
      </header>
  <div className="flex" >
      {/* Sidebar */}
  <aside
    className={`static lg:static z-50 ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    } lg:translate-x-0 transition-transform duration-300 ease-in-out ${
      sidebarOpen ? "lg:w-64" : "lg:w-20"
    } w-fit max-h-[1000vh] bg-gradient-to-b from-indigo-800 to-violet-900 dark:from-gray-800 dark:to-gray-900 text-white flex flex-col border-r border-indigo-700 dark:border-gray-700 shadow-lg lg:shadow-none`}
  >
    {/* Sidebar Header */}
    <div className="p-4 flex items-center justify-between border-b border-indigo-700 dark:border-gray-700">
      {sidebarOpen ? (
        <h2 className="text-xl font-bold flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-violet-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1 rounded-full hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors hidden lg:block"
      >
        {sidebarOpen ? (
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
        onClick={() => setSidebarOpen(false)}
        className="p-1 rounded-full hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors lg:hidden"
      >
        <X className="h-6 w-6" />
      </button>
      </div>
    {/* Sidebar Navigation */}
    <div className="flex-1 overflow-y-auto py-4">
      <nav>
        <ul className="space-y-1 px-2">
          {/* Yield Forecast */}
          <li>
            <button
              onClick={() => {
                setActiveTab("yield");
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`flex items-center p-3 w-full rounded-lg ${
                activeTab === "yield"
                  ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                  : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
              } transition-all duration-200 ease-in-out group`}
            >
              <BarChart2 className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {sidebarOpen && (
                <span className="ml-3 whitespace-nowrap overflow-hidden">
                  Yield Forecast
                </span>
              )}
            </button>
          </li>

          {/* Price Statistics */}
          <li>
            <button
              onClick={() => {
                setActiveTab("prices");
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`flex items-center p-3 w-full rounded-lg ${
                activeTab === "prices"
                  ? "bg-indigo-700 dark:bg-gray-700 text-violet-200 shadow-inner"
                  : "hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-violet-100"
              } transition-all duration-200 ease-in-out group`}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {sidebarOpen && (
                <span className="ml-3 whitespace-nowrap overflow-hidden">
                  Price Statistics
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </div>

    {/* Yield Filters - only shown when yield tab is active and sidebar is open */}
    {activeTab === "yield" && sidebarOpen && (
      <div className="p-4 border-t border-indigo-700 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-violet-200 border-b border-violet-700 pb-2">
          Yield Filters
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="yield-state-select"
              className="block text-sm font-medium mb-2 text-violet-300"
            >
              Select State
            </label>
            <Select value={yieldState} onValueChange={setYieldState}>
              <SelectTrigger
                id="yield-state-select"
                className="w-full bg-indigo-900 dark:bg-gray-700 text-violet-100 dark:text-violet-200 border-indigo-700 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 rounded-lg px-3 py-2 hover:border-violet-500 dark:hover:border-violet-400"
              >
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 dark:bg-gray-700 text-violet-100 dark:text-violet-200 border-indigo-700 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {[
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
                ].map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="hover:bg-indigo-800 dark:hover:bg-gray-600 focus:bg-indigo-800 dark:focus:bg-gray-600 cursor-pointer py-2 px-3"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="yield-unit-select"
              className="block text-sm font-medium mb-2 text-violet-300"
            >
              Display Unit
            </label>
            <Select value={yieldUnit} onValueChange={setYieldUnit}>
              <SelectTrigger
                id="yield-unit-select"
                className="w-full bg-indigo-900 dark:bg-gray-700 text-violet-100 dark:text-violet-200 border-indigo-700 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 rounded-lg px-3 py-2 hover:border-violet-500 dark:hover:border-violet-400"
              >
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 dark:bg-gray-700 text-violet-100 dark:text-violet-200 border-indigo-700 dark:border-gray-600 rounded-lg shadow-lg">
                {YIELD_UNITS.map((unit) => (
                  <SelectItem
                    key={unit.value}
                    value={unit.value}
                    className="hover:bg-indigo-800 dark:hover:bg-gray-600 focus:bg-indigo-800 dark:focus:bg-gray-600 cursor-pointer py-2 px-3"
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
  </aside>

        {/* Main Content Area */}
        <main
          className={`
            flex-1 transition-all duration-300 ease-in-out p-4 md:p-6
            ${
              sidebarOpen ? "lg:ml-64" : "lg:ml-0"
            } // Adjust margin for desktop when sidebar is open
          `}
        >
          {activeTab === "yield" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                  First Advanced Crop Yield Forecast for{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {yieldState}
                  </span>{" "}
                  Based on Historical Weather Data and Current Conditions
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Predictive analytics for agricultural yield based on
                  historical data and weather patterns
                </p>
              </div>

              {yieldLoading ? (
                <div className="text-center p-8 bg-blue-50 dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-blue-200 dark:bg-blue-900/50 rounded-full mb-4"></div>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      Loading yield data...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Please wait while we fetch the latest predictions
                    </p>
                  </div>
                </div>
              ) : yieldError ? (
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-xl text-red-600 dark:text-red-400">
                    {yieldError}
                  </p>
                  <p className="text-sm text-red-500 dark:text-red-300 mt-2">
                    Please try again or contact support
                  </p>
                </div>
              ) : yieldData.length === 0 ? (
                <div className="text-center p-6 bg-blue-50 dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
                  <p className="text-xl text-gray-700 dark:text-gray-300">
                    No yield data available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Adjust your filters to see results
                  </p>
                </div>
              ) : (
                <div className="space-y-8 overflow-x-scroll snap-x snap-mandatory scroll-smooth scrollbar-hide max-w-[100vw]">
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
          ) : (
            <PriceStatisticsPage />
          )}
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Price Statistics
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View the latest price trends and forecasts for your selected
                crops.
              </p>
            </div>
          </aside>
        </main>
      </div>
      </div>
  );
}
