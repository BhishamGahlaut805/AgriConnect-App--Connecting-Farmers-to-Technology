import { MapPinIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Fix for default marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Set up the default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
          <p className="font-semibold">
            Oops! Something went wrong with the map.
          </p>
          <p className="text-sm">
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const FarmMap = ({ farmData }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("all");
  const [showLegend, setShowLegend] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [mapInitialized, setMapInitialized] = useState(false);

  // useRef to hold Leaflet layer groups
  const layersRef = useRef({
    farm: L.layerGroup(),
    neighbors: L.layerGroup(),
    diseases: L.layerGroup(),
  });

  // Custom icons
  const farmIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3012/3012026.png",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  const diseaseIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4841/4841487.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

  const neighborIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3012/3012005.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Legend items
  const legendItems = [
    { color: "#4ade80", label: "Your Farm", icon: farmIcon },
    { color: "#f59e0b", label: "Neighboring Farms", icon: neighborIcon },
    { color: "#ef4444", label: "Disease Risks", icon: diseaseIcon },
    { color: "#bbf7d0", label: "Your Farm Area", type: "polygon" },
    { color: "#fca5a5", label: "Disease Risk Zone", type: "circle" },
  ];

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    // Skip if no farm data or container not ready
    if (
      !farmData ||
      !farmData.latitude ||
      !farmData.longitude ||
      !mapContainerRef.current
    ) {
      return;
    }

    const initializeMap = () => {
      // Clean up previous map if exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Reset container's leaflet ID
      if (mapContainerRef.current._leaflet_id) {
        mapContainerRef.current._leaflet_id = null;
      }

      try {
        // Initialize map with proper options
        mapRef.current = L.map(mapContainerRef.current, {
          center: [farmData.latitude, farmData.longitude],
          zoom: zoomLevel,
          scrollWheelZoom: true,
          zoomControl: false,
          attributionControl: false,
          renderer: L.svg(), // Force SVG renderer for better stability
        });

        // Add base layers
        const osmLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(mapRef.current);

        const satelliteLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          }
        );

        // Add layer control
        L.control
          .layers(
            {
              "Street Map": osmLayer,
              "Satellite View": satelliteLayer,
            },
            null,
            { position: "topright" }
          )
          .addTo(mapRef.current);

        // Add zoom control
        L.control.zoom({ position: "topright" }).addTo(mapRef.current);

        // Add scale control
        L.control.scale({ position: "bottomleft" }).addTo(mapRef.current);

        // Set initialized flag
        setMapInitialized(true);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapInitialized(false);
    };
  }, [farmData]); // Only re-run if farmData changes

  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !farmData) return;

    const {
      latitude,
      longitude,
      agro_polygon,
      nearby_farms,
      top_disease_risks,
      farm_name,
      crops,
    } = farmData;

    // Clear existing layers
    Object.values(layersRef.current).forEach((layerGroup) => {
      layerGroup.clearLayers();
      if (mapRef.current.hasLayer(layerGroup)) {
        mapRef.current.removeLayer(layerGroup);
      }
    });

    // Add farm polygon if available
    if (agro_polygon?.geo_json?.geometry?.coordinates?.[0]) {
      const polygonCoords = agro_polygon.geo_json.geometry.coordinates[0].map(
        ([lat, lon]) => [lat, lon]
      );

      const farmArea = L.polygon(polygonCoords, {
        color: "#4ade80",
        weight: 3,
        fillColor: "#bbf7d0",
        fillOpacity: 0.4,
      }).bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg text-green-700">${farm_name}</h3>
          <p class="text-sm text-gray-600">Farm Area: ${(
            agro_polygon.area_ha || 0
          ).toFixed(2)} ha</p>
          ${
            crops
              ? `<p class="text-sm text-gray-600">Main Crops: ${crops.join(
                  ", "
                )}</p>`
              : ""
          }
        </div>
      `);

      layersRef.current.farm.addLayer(farmArea);
    }

    // Add main farm marker
    const mainFarmMarker = L.marker([latitude, longitude], {
      icon: farmIcon,
    }).bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg text-green-700">${farm_name}</h3>
        <p class="text-sm text-gray-600">Location: ${latitude.toFixed(
          4
        )}, ${longitude.toFixed(4)}</p>
        ${
          crops
            ? `<p class="text-sm text-gray-600">Main Crops: ${crops.join(
                ", "
              )}</p>`
            : ""
        }
      </div>
    `);

    layersRef.current.farm.addLayer(mainFarmMarker);

    // Add nearby farms with clustering
    const neighborCluster = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center border-2 border-amber-300" style="width: 40px; height: 40px;">${count}</div>`,
          className: "",
          iconSize: L.point(40, 40),
        });
      },
    });

    nearby_farms?.forEach((f) => {
      const distanceLabel =
        f.distance_km < 1
          ? `${Math.round(f.distance_km * 1000)} m`
          : `${f.distance_km.toFixed(1)} km`;

      const neighborMarker = L.marker([f.latitude, f.longitude], {
        icon: neighborIcon,
      }).bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg text-amber-700">${f.farm_name}</h3>
          <p class="text-sm text-gray-600">Distance: ${distanceLabel}</p>
          <p class="text-sm text-gray-600">Crops: ${
            f.crops?.join(", ") || "Unknown"
          }</p>
        </div>
      `);

      neighborCluster.addLayer(neighborMarker);
    });

    layersRef.current.neighbors.addLayer(neighborCluster);

    // Add disease risks
    top_disease_risks?.forEach((risk) => {
      const distanceText =
        risk.distance_km < 1
          ? `${Math.round(risk.distance_km * 1000)} m`
          : `${risk.distance_km.toFixed(1)} km`;

      const riskLevel = Math.round(risk.confidence * 100);
      let riskColor = "#ef4444";
      let riskClass = "high";

      if (riskLevel < 30) {
        riskColor = "#f59e0b";
        riskClass = "low";
      } else if (riskLevel < 70) {
        riskColor = "#f97316";
        riskClass = "medium";
      }

      const riskZone = L.circle([latitude, longitude], {
        radius: risk.distance_km * 1000,
        color: riskColor,
        fillColor: riskColor,
        fillOpacity: 0.15,
        weight: 2,
      });

      layersRef.current.diseases.addLayer(riskZone);
    });

    // Add layers based on active selection
    if (activeLayer === "all" || activeLayer === "farm") {
      mapRef.current.addLayer(layersRef.current.farm);
    }
    if (activeLayer === "all" || activeLayer === "neighbors") {
      mapRef.current.addLayer(layersRef.current.neighbors);
    }
    if (activeLayer === "all" || activeLayer === "diseases") {
      mapRef.current.addLayer(layersRef.current.diseases);
    }

    // Fit bounds if we have valid data
    if (agro_polygon?.geo_json?.geometry?.coordinates?.[0]) {
      const bounds = L.latLngBounds(
        agro_polygon.geo_json.geometry.coordinates[0].map(([lat, lon]) => [
          lat,
          lon,
        ])
      );
      nearby_farms?.forEach((f) => bounds.extend([f.latitude, f.longitude]));
      if (bounds.isValid()) {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        }, 100);
      }
    }

    // Invalidate size to ensure proper rendering
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 0);
  }, [mapInitialized, farmData, activeLayer, zoomLevel]);

  const toggleLayer = (layer) => {
    setActiveLayer(layer);
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };
  return (
    <ErrorBoundary>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg mr-3">
                <MapPinIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Farm Geographic Overview
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Interactive map showing your farm and surrounding agricultural
                  landscape
                </p>
              </div>
            </div>
            <button
              onClick={toggleLegend}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Toggle legend"
            >
              <InformationCircleIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => toggleLayer("all")}
              className={`px-3 py-1 text-sm rounded-full ${
                activeLayer === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              Show All
            </button>
            <button
              onClick={() => toggleLayer("farm")}
              className={`px-3 py-1 text-sm rounded-full ${
                activeLayer === "farm"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              Your Farm Only
            </button>
            <button
              onClick={() => toggleLayer("neighbors")}
              className={`px-3 py-1 text-sm rounded-full ${
                activeLayer === "neighbors"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              Nearby Farms
            </button>
            <button
              onClick={() => toggleLayer("diseases")}
              className={`px-3 py-1 text-sm rounded-full ${
                activeLayer === "diseases"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              Disease Risks
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Click on any marker or colored area to see
              detailed information. Use the buttons above to filter what's shown
              on the map.
            </p>
          </div>
        </div>

        <div
          id="farm-map"
          ref={mapContainerRef}
          className="h-[500px] w-full rounded-b-xl relative"
        >
          {!farmData && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center rounded-b-xl">
              <p className="text-gray-500 dark:text-gray-400">
                Loading farm map data...
              </p>
            </div>
          )}
        </div>

        <style jsx global>{`
          .leaflet-popup-content {
            margin: 8px 12px;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .farm-polygon {
            stroke-dasharray: 5, 5;
            animation: dash 30s linear infinite;
          }
          @keyframes dash {
            to {
              stroke-dashoffset: -100;
            }
          }
          .disease-zone.high {
            animation: pulse-high 2s infinite;
          }
          .disease-zone.medium {
            animation: pulse-medium 3s infinite;
          }
          .disease-zone.low {
            animation: pulse-low 4s infinite;
          }
          @keyframes pulse-high {
            0% {
              opacity: 0.15;
            }
            50% {
              opacity: 0.3;
            }
            100% {
              opacity: 0.15;
            }
          }
          @keyframes pulse-medium {
            0% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.2;
            }
            100% {
              opacity: 0.1;
            }
          }
          @keyframes pulse-low {
            0% {
              opacity: 0.05;
            }
            50% {
              opacity: 0.15;
            }
            100% {
              opacity: 0.05;
            }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

export default FarmMap;
