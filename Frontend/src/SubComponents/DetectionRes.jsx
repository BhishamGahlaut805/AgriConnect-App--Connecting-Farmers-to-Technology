import coverImage from "../assets/SVG/icon1.svg"; // replace with a proper cover image if you have one

export default function DetectionSummary({ results }) {
  const totalDetections = results.detections.length;
  const weedCount = results.counts?.Weed || 0;
  const cottonCount = results.counts?.Cotton || 0;
  const soilCount = results.counts?.Soil || 0;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden">
      {/* Cover Image */}
      <div className="h-full w-full bg-yellow">
        <img
          src={coverImage}
          alt="Detection Cover"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Detection Summary
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          A quick overview of your farm detections. Keep an eye on weed spread
          and cotton growth.
        </p>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
            <h4 className="text-lg font-semibold text-red-700 dark:text-red-200">
              {weedCount}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-300">Weeds</p>
          </div>

          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <h4 className="text-lg font-semibold text-green-700 dark:text-green-200">
              {cottonCount}
            </h4>
            <p className="text-xs text-green-600 dark:text-green-300">Cotton</p>
          </div>

          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
            <h4 className="text-lg font-semibold text-amber-700 dark:text-amber-200">
              {soilCount}
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-300">Soil</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Total Detections: {totalDetections}
        </div>
      </div>
    </div>
  );
}
