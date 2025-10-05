// src/components/ReportsDetail.jsx
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

const confidenceLevel = (conf) => {
  if (conf >= 0.8) return { label: "High", color: "bg-red-600" };
  if (conf >= 0.5) return { label: "Medium", color: "bg-yellow-500" };
  return { label: "Low", color: "bg-green-500" };
};

const ReportsDetail = ({ reports = [], stats = {} }) => {
  const topReports = reports
    .filter((r) => r.disease?.toLowerCase() !== "healthy")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-700">
      <div className="flex items-center mb-4">
        <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600 dark:text-green-300 mr-2" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Disease Reports (from your farm and nearby locations)
        </h2>
      </div>

      {topReports.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No significant disease detections available yet.
        </p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-100 dark:bg-green-900 text-gray-700 dark:text-white">
              <tr>
                <th className="py-2 px-4">Crop</th>
                <th className="py-2 px-4">Disease</th>
                <th className="py-2 px-4">Confidence</th>
                <th className="py-2 px-4">Detected At</th>
              </tr>
            </thead>
            <tbody>
              {topReports.map((r, index) => {
                const level = confidenceLevel(r.confidence || 0);
                const detectedTime = new Date(r.timestamp);
                const timeString = isNaN(detectedTime)
                  ? "Invalid Time"
                  : detectedTime.toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-2 px-4 text-gray-800 dark:text-white font-medium">
                      {r.crop || "N/A"}
                    </td>
                    <td className="py-2 px-4">
                      <span className="inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                        {r.disease || "Unknown"}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold text-white rounded-full ${level.color}`}
                      >
                        {level.label} ({(r.confidence * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-gray-300">
                      {timeString}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsDetail;
