import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { memo } from "react";
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
  Legend,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select"; // Assuming path

import {
  MapPin,
  Filter,
  BarChart3,
  TrendingUp,
  Ruler,
  Maximize,
  CheckCircle,
} from "lucide-react";

// --- START: CONSTANTS AND UTILITIES FROM indianMap.jsx (unchanged) ---

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

// Available states for coloring
const AVAILABLE_STATES = [
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

// Color palette for states
const STATE_COLORS = {
  "Andhra Pradesh": "#3B82F6", // Blue
  Bihar: "#10B981", // Green
  Gujarat: "#F59E0B", // Amber
  Haryana: "#EF4444", // Red
  Karnataka: "#8B5CF6", // Violet
  "Madhya Pradesh": "#EC4899", // Pink
  Maharashtra: "#06B6D4", // Cyan
  Punjab: "#84CC16", // Lime
  Rajasthan: "#F97316", // Orange
  "Tamil Nadu": "#6366F1", // Indigo
  "Uttar Pradesh": "#DC2626", // Strong Red
  "West Bengal": "#14B8A6", // Teal
};

// Default color for unavailable states
const UNAVAILABLE_COLOR = "#E5E7EB"; // gray-200
const HOVER_COLOR = "#60A5FA"; // blue-400

const ALL_CROPS = [
  ...new Set(Object.values(CROP_CATEGORIES).flatMap((crops) => crops)),
].sort();

// Memoized Geography component for optimal performance (unchanged)
const MemoizedGeography = memo(
  ({
    geo,
    stateName,
    yieldValue,
    isHovered,
    isSelected,
    onMouseEnter,
    onMouseLeave,
    onClick,
    yieldUnit,
  }) => {
    const fillColor = useMemo(() => {
      if (!yieldValue && !STATE_COLORS[stateName]) {
        return UNAVAILABLE_COLOR;
      }

      if (isSelected) return "#60A5FA"; // Light Blue on selection

      if (yieldValue) {
        const value = convertYield(yieldValue, yieldUnit);

        // Debug log
        // console.log(stateName, "converted yield:", value);

        // Adjust thresholds according to realistic yield values
        if (value < 1000) return "#fef9c3"; // Very Low
        if (value < 2000) return "#fde047"; // Low
        if (value < 3000) return "#f97316"; // Medium
        if (value < 4000) return "#dc2626"; // High
        if (value < 5000) return "#9a3412"; // Very High
        return "#4d7c0f"; // Excellent
      }

      return STATE_COLORS[stateName] || UNAVAILABLE_COLOR;
    }, [yieldValue, stateName, isHovered, isSelected, yieldUnit]);


    const strokeColor = useMemo(() => {
      if (isSelected) return "#1D4ED8"; // blue-700 on selection
      if (isHovered) return "#3B82F6"; // blue-500 on hover
      return "#FFFFFF"; // white border
    }, [isSelected, isHovered]);

    const strokeWidth = useMemo(() => {
      if (isSelected) return 2.5;
      if (isHovered) return 2;
      return 1;
    }, [isSelected, isHovered]);

    return (
      <Geography
        geography={geo}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          default: {
            outline: "none",
            transition: "all 0.3s ease-in-out",
          },
          hover: {
            outline: "none",
            fill: HOVER_COLOR,
            stroke: "#3B82F6",
            strokeWidth: 2.5,
            cursor: "pointer",
            transform: "scale(1.01)",
          },
          pressed: {
            outline: "none",
            fill: "#2563EB",
          },
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />
    );
  }
);

MemoizedGeography.displayName = "MemoizedGeography";

// --- END: CONSTANTS AND UTILITIES ---

// --- START: INDIAN MAP COMPONENT (Modified for advanced interaction) ---

const IndianMap = memo(
  ({ yieldData, selectedCrop, onStateSelect, selectedState, yieldUnit }) => {
    const [hoveredState, setHoveredState] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const geoUrl =
      "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

    // 1. Memoized state data map for fast lookup
    const stateDataMap = useMemo(() => {
      const map = new Map();
      AVAILABLE_STATES.forEach((state) => {
        const stateNameNormalized = state.toLowerCase().trim();

        const stateEntries = yieldData.filter(
          (entry) => entry.state?.toLowerCase().trim() === stateNameNormalized
        );

        const cropYieldMap = {};
        stateEntries.forEach((entry) => {
          if (entry.crop && entry.prediction?.predicted_yield != null) {
            // Store the raw yield in kg/ha
            cropYieldMap[entry.crop.trim()] = entry.prediction.predicted_yield;
          }
        });

        map.set(stateNameNormalized, {
          yields: cropYieldMap,
        });
      });
      return map;
    }, [yieldData]);

    // 2. Get yield utility, now more crucial
    const getStateYieldData = useCallback(
      (stateName, crop = selectedCrop) => {
        if (!stateName) return null;
        const stateEntry = stateDataMap.get(stateName.toLowerCase());
        if (!stateEntry || !crop) return null;
        return stateEntry.yields[crop] || null;
      },
      [stateDataMap, selectedCrop]
    );

    // 3. Handle mouse move for smooth tooltip
    const handleMouseMove = useCallback((event) => {
      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }, []);

    // 4. Enhanced event handlers
    const handleStateHover = useCallback((stateName) => {
      setHoveredState(stateName);
    }, []);

    const handleStateLeave = useCallback(() => {
      setHoveredState(null);
    }, []);

    const handleStateClick = useCallback(
      (stateName) => {
        const yieldValue = getStateYieldData(stateName);
        onStateSelect?.(stateName, yieldValue);
      },
      [getStateYieldData, onStateSelect]
    );

    // 5. Available states count (for header)
    const availableStatesCount = useMemo(() => {
      return AVAILABLE_STATES.filter((state) => getStateYieldData(state))
        .length;
    }, [getStateYieldData]);

    // Memoized legend items (adjusted ranges for quintal/acre visualization)
    const legendItems = useMemo(
      () => [
        { range: "< 10", color: "#fef9c3", description: "Very Low" },
        { range: "10-20", color: "#fde047", description: "Low" },
        { range: "20-30", color: "#f97316", description: "Medium" },
        { range: "30-40", color: "#dc2626", description: "High" },
        { range: "40-50", color: "#9a3412", description: "Very High" },
        { range: "50+", color: "#4d7c0f", description: "Excellent" },
      ],
      []
    );

    const unitLabel = YIELD_UNITS.find((u) => u.value === yieldUnit)?.label;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            India Agricultural Yield Map
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedCrop && (
              <>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {selectedCrop}
                </span>
                <span className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {availableStatesCount} States Mapped
                </span>
              </>
            )}
          </div>
        </div>

        {/* Map Container - Increased Height */}
        <div className="relative flex-grow min-h-[500px] lg:min-h-[600px]">
          <div className="h-full w-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-blue-900/20 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-inner">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [82, 23],
                scale: 900,
              }}
              style={{ width: "100%", height: "100%" }}
              onMouseMove={handleMouseMove}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName =
                      geo.properties.st_nm ||
                      geo.properties.NAME_1 ||
                      geo.properties.name;
                    const yieldValue = getStateYieldData(stateName);
                    const isHovered = hoveredState === stateName;
                    const isSelected = selectedState === stateName;

                    const isAvailable = AVAILABLE_STATES.some(
                      (availableState) =>
                        stateName
                          .toLowerCase()
                          .includes(availableState.toLowerCase()) ||
                        availableState
                          .toLowerCase()
                          .includes(stateName.toLowerCase())
                    );

                    return (
                      <MemoizedGeography
                        key={geo.rsmKey}
                        geo={geo}
                        stateName={stateName}
                        yieldValue={isAvailable ? yieldValue : null}
                        isHovered={isHovered}
                        isSelected={isSelected}
                        onMouseEnter={() => handleStateHover(stateName)}
                        onMouseLeave={handleStateLeave}
                        onClick={() => handleStateClick(stateName)}
                        yieldUnit={yieldUnit}
                      />
                    );
                  })
                }
              </Geographies>

              {/* City Markers (unchanged) */}
              {/* ... markers code ... */}
            </ComposableMap>
          </div>

          {/* Enhanced Hover Tooltip */}
          {hoveredState && selectedCrop && (
            <div
              className="absolute bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border-2 border-blue-200 dark:border-blue-700 max-w-xs z-20 transition-all duration-200 backdrop-blur-sm"
              style={{
                left: `${Math.min(
                  tooltipPosition.x + 20,
                  window.innerWidth - 350
                )}px`,
                top: `${Math.min(
                  tooltipPosition.y - 50,
                  window.innerHeight - 200
                )}px`,
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  {hoveredState}
                  {selectedState === hoveredState && (
                    <span className="ml-2 text-xs font-semibold text-green-500">
                      (Selected)
                    </span>
                  )}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Crop:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {selectedCrop}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Predicted Yield:
                  </span>
                  <span className="text-xl font-extrabold text-green-600 dark:text-green-400">
                    {convertYield(
                      getStateYieldData(hoveredState),
                      yieldUnit
                    )?.toFixed(2) || "N/A"}
                    <span className="text-sm ml-1 font-normal text-gray-500">
                      {unitLabel?.split("/")[0]}
                    </span>
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                    onClick={() => handleStateClick(hoveredState)}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    {selectedState === hoveredState
                      ? "Deselect State"
                      : "Select for Analysis"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1 border-gray-200 dark:border-gray-700">
              Yield Scale ({unitLabel})
            </h4>
            <div className="space-y-1">
              {legendItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.range} - {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

IndianMap.displayName = "IndianMap";

// --- END: INDIAN MAP COMPONENT ---

// --- START: CHART COMPONENTS (New) ---

const StateYieldBarChart = memo(({ chartData, yieldUnit, selectedState }) => {
  const unitLabel = YIELD_UNITS.find((u) => u.value === yieldUnit)?.label;
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-bold text-sm text-blue-600 dark:text-blue-400">
            {payload[0].payload.state}
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Yield:{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {payload[0].value.toFixed(2)}
            </span>{" "}
            {unitLabel?.split("/")[0]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="state"
          angle={-25}
          textAnchor="end"
          height={70}
          stroke="#555"
          style={{ fontSize: "10px" }}
        />
        <YAxis
          label={{
            value: `Yield (${unitLabel})`,
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
          stroke="#555"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="yield" fill="#3B82F6">
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.state === selectedState
                  ? "#DC2626" // Highlight selected state in red
                  : "#3B82F6"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

StateYieldBarChart.displayName = "StateYieldBarChart";

const CropYieldLineChart = memo(
  ({ cropComparisonData, selectedState, yieldUnit }) => {
    const unitLabel = YIELD_UNITS.find((u) => u.value === yieldUnit)?.label;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={cropComparisonData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="crop"
            angle={-25}
            textAnchor="end"
            height={70}
            stroke="#555"
            style={{ fontSize: "10px" }}
          />
          <YAxis
            label={{
              value: `Yield (${unitLabel})`,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            stroke="#555"
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="predicted_yield"
            stroke="#10B981"
            strokeWidth={2}
            name={`Predicted Yield in ${selectedState || "Selected State"}`}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
);

CropYieldLineChart.displayName = "CropYieldLineChart";

// --- END: CHART COMPONENTS ---

// --- START: DASHBOARD COMPONENT (The new main component) ---

// Mock Data Structure (for a working example without real API)
const mockYieldData = AVAILABLE_STATES.flatMap((state) =>
  ALL_CROPS.map((crop) => ({
    state: state,
    crop: crop,
    prediction: {
      predicted_yield: Math.random() * 5000 + 1000, // 1000 to 6000 kg/ha
    },
  }))
);

export const AgriculturalYieldDashboard = () => {
  const [selectedCrop, setSelectedCrop] = useState(ALL_CROPS[0]);
  const [selectedState, setSelectedState] = useState(null);
  const [yieldUnit, setYieldUnit] = useState(YIELD_UNITS[0].value);
  const yieldData = mockYieldData; // Replace with your actual data source

  const handleStateSelect = useCallback((stateName) => {
    setSelectedState((prev) => (prev === stateName ? null : stateName));
  }, []);

  // --- Data Preparation for Charts ---

  // 1. Bar Chart Data: Yield of selectedCrop across all states
  const stateBarChartData = useMemo(() => {
    return AVAILABLE_STATES.map((state) => {
      const entry = yieldData.find(
        (d) =>
          d.state.toLowerCase() === state.toLowerCase() &&
          d.crop === selectedCrop
      );
      const rawYield = entry?.prediction?.predicted_yield;

      return {
        state: state,
        yield: convertYield(rawYield, yieldUnit) || 0,
      };
    }).sort((a, b) => b.yield - a.yield); // Sort by yield descending
  }, [yieldData, selectedCrop, yieldUnit]);

  // 2. Line Chart Data: Yields of all crops for the selected state
  const cropLineChartData = useMemo(() => {
    if (!selectedState) return [];

    return ALL_CROPS.map((crop) => {
      const entry = yieldData.find(
        (d) =>
          d.state.toLowerCase() === selectedState.toLowerCase() &&
          d.crop === crop
      );
      const rawYield = entry?.prediction?.predicted_yield;

      return {
        crop: crop,
        predicted_yield: convertYield(rawYield, yieldUnit) || 0,
      };
    }).filter((d) => d.predicted_yield > 0);
  }, [yieldData, selectedState, yieldUnit]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Agriculture Yield Dashboard
          </h1>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Select onValueChange={setSelectedCrop} defaultValue={selectedCrop}>
              <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Crop" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700">
                {ALL_CROPS.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setYieldUnit} defaultValue={yieldUnit}>
              <SelectTrigger className="w-[150px] dark:bg-gray-700 dark:text-white">
                <Ruler className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700">
                {YIELD_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* MAP SECTION - BIGGER SIZE */}
        <div className="min-h-[700px]">
          <IndianMap
            yieldData={yieldData}
            selectedCrop={selectedCrop}
            onStateSelect={handleStateSelect}
            selectedState={selectedState}
            yieldUnit={yieldUnit}
          />
        </div>

        {/* COMPARISON GRAPHS SECTION - FILLING REST SPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* STATE-WISE BAR CHART */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              State Comparison: {selectedCrop} Yield
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ranked yields for {selectedCrop} across all available states.
              <span className="font-semibold text-red-500 ml-1">
                {selectedState}
              </span>{" "}
              is highlighted.
            </p>
            <StateYieldBarChart
              chartData={stateBarChartData}
              yieldUnit={yieldUnit}
              selectedState={selectedState}
            />
          </div>

          {/* CROP-WISE LINE CHART */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Crop Performance in {selectedState || "Selected State"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Yield comparison of all crops available in{" "}
              <span className="font-semibold text-blue-500">
                {selectedState || "your chosen state"}
              </span>
              .
            </p>
            {selectedState ? (
              <CropYieldLineChart
                cropComparisonData={cropLineChartData}
                selectedState={selectedState}
                yieldUnit={yieldUnit}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-center p-4">
                  Click on a state on the map to view its crop-wise yield
                  comparison.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriculturalYieldDashboard;
