import {
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

const DiseaseRiskCard = ({ risks = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-red-200 dark:border-red-300 p-6">
      <div className="flex items-center mb-4">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          🌾 Disease Risk Around Your Farm
        </h3>
      </div>

      {risks.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No current disease alerts nearby.
        </p>
      ) : (
        <div className="space-y-4">
          {risks.slice(0, 3).map((risk, index) => (
            <div
              key={index}
              className="bg-red-50 dark:bg-gray-600 p-4 rounded-xl shadow-sm"
            >
              <h4 className="text-md font-semibold text-red-700 dark:text-gray-900">
                {risk.disease}
              </h4>
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Detected {risk.distance_km.toFixed(2)} km from your farm
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                {/* <ClockIcon className="h-4 w-4 mr-1" /> */}
                {risk.timestamp ? (
                  <div className="flex items-center mt-1 text-sm text-gray-800 dark:text-gray-800">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Last seen:{" "}
                    {new Date(risk.timestamp).toString() !== "Invalid Date"
                      ? new Date(risk.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Unknown"}
                  </div>
                ) : (
                  <div className="flex items-center mt-1 text-sm text-gray-500 italic">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Last seen: 2d
                  </div>
                )}
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${Math.round(risk.confidence * 100)}%`,
                  }}
                />
              </div>
              <div className="text-right text-xs mt-1 text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(risk.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiseaseRiskCard;
