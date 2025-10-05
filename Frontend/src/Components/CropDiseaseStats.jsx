import { ChartBarIcon } from "@heroicons/react/24/outline";

const CropDiseaseStats = ({ stats }) => {
  if (!stats || !Array.isArray(stats) || stats.length === 0 || !stats[0])
    return null;

  const latestStats = stats[0];
  const totalCrops = latestStats?.total_images_analyzed || 1;
  const totalDiseased = latestStats?.diseased_images_found || 1;

  const getPercentage = (count, total) =>
    total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-green-100 dark:border-green-700">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="h-6 w-6 text-green-500 dark:text-green-300 mr-2" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Crop & Disease Statistics (Based on your farm and nearby farms)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop Distribution */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Crop Distribution
          </h3>
          <div className="space-y-3">
            {latestStats?.crop_counts &&
              Object.entries(latestStats.crop_counts)
                .filter(([key]) => key !== "_id")
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([crop, count]) => (
                  <div key={crop}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {crop.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {count} plants ({getPercentage(count, totalCrops)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${getPercentage(count, totalCrops)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Disease Prevalence */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Disease Prevalence
          </h3>
          <div className="space-y-3">
            {latestStats?.disease_counts &&
              Object.entries(latestStats.disease_counts)
                .filter(
                  ([key]) => key.toLowerCase() !== "healthy" && key !== "_id"
                )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([disease, count]) => (
                  <div key={disease}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {disease.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {count} cases ({getPercentage(count, totalDiseased)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${getPercentage(count, totalDiseased)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDiseaseStats;
