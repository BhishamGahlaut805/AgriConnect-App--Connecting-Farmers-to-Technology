import {
  ChartBarIcon,
  CameraIcon,
  BugAntIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const UserAnalyticsCard = ({ summary }) => {
  if (!summary || !summary.summary) return null;

  const { total_images, total_diseased, max_risk_percent, top_diseases } =
    summary.summary;

  const diseaseRate = Math.round((total_diseased / total_images) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            🌿 Disease Analytics Summary
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This data includes all farms within 4 km of your location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Images */}
        <div className="bg-green-100 dark:bg-green-700 p-4 rounded-lg">
          <div className="flex items-center">
            <CameraIcon className="h-5 w-5 text-green-800 dark:text-green-200 mr-2" />
            <span className="text-sm" title="All images scanned across farms">
              Total Images
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-800 dark:text-white">
            {total_images}
          </p>
        </div>

        {/* Diseased */}
        <div className="bg-red-100 dark:bg-red-700 p-4 rounded-lg">
          <div className="flex items-center">
            <BugAntIcon className="h-5 w-5 text-red-600 dark:text-red-200 mr-2" />
            <span className="text-sm" title="Images identified as infected">
              Diseased
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600 dark:text-white">
            {total_diseased} ({diseaseRate}%)
          </p>
        </div>

        {/* Max Risk */}
        <div className="bg-blue-100 dark:bg-blue-700 p-4 rounded-lg">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-200 mr-2" />
            <span className="text-sm" title="Peak threat level recorded">
              Max Risk %
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-white">
            {max_risk_percent}%
          </p>
        </div>
      </div>

      {top_diseases && (
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <span className="text-md font-semibold text-gray-700 dark:text-gray-300">
              🦠 Most Common Diseases
            </span>
            <InformationCircleIcon
              className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-300"
              title="Based on frequency across nearby farms"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(top_diseases)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([disease, count], index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  title={`Reported ${count} times`}
                >
                  {disease}: {count}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalyticsCard;
