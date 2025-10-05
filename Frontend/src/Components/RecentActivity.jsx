import { ClockIcon } from "@heroicons/react/24/outline";

const RecentActivity = ({ reports }) => {
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 7);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Activity
          </h3>
        </div>

        <div className="space-y-4">
          {recentReports.map((report, index) => (
            <div key={index} className="flex items-start">
              <div
                className={`flex-shrink-0 h-3 w-3 mt-1.5 rounded-full ${
                  report.disease === "Healthy" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {report.disease === "Healthy"
                    ? "Healthy plant detected"
                    : `${report.disease.replace(/_/g, " ")} detected`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {report.crop} •{" "}
                  {new Date(report.timestamp).toLocaleDateString()} •{" "}
                  {Math.round(report.confidence * 100)}% confidence
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
