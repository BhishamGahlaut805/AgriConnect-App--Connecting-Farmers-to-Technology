import {
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const NearbyFarmsCard = ({ nearbyFarms }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-green-200 dark:border-green-700">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          🧭 Farms Close to You
        </h3>

        {nearbyFarms.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No nearby farms detected within 4 km.
          </p>
        ) : (
          <div className="space-y-4">
            {nearbyFarms.map((farm, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {farm.farm_name}
                  </p>
                  <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400 text-sm">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{farm.distance_km.toFixed(2)} km away</span>
                  </div>
                </div>
                <button
                  title="View on Map"
                  className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-600"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 hover:text-green-600 dark:hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyFarmsCard;
