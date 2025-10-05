import {
  MapPinIcon,
  RssIcon,
  GlobeAsiaAustraliaIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

const FarmOverviewCard = ({ farmData }) => {
  if (!farmData) return null;

  const { farm_name, latitude, longitude, agro_polygon, nearby_farms } =
    farmData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-green-200 dark:border-green-700 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Farm Name */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {farm_name || "Unnamed Farm"}
            </h2>
            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            🟢 Active
          </span>
        </div>

        {/* Area */}
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <GlobeAsiaAustraliaIcon className="h-5 w-5 mr-2 text-blue-500" />
          <p className="text-sm">
            <strong className="font-semibold">Farm Area:</strong>{" "}
            {agro_polygon?.area?.toFixed(2)} hectares
          </p>
        </div>

        {/* Nearby Farms */}
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <RssIcon className="h-5 w-5 mr-2 text-yellow-500" />
          <p className="text-sm">
            <strong className="font-semibold">Nearby Farms:</strong>{" "}
            {nearby_farms?.length || 0} within 4 km
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmOverviewCard;
