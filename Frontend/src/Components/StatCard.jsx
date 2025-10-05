const StatCard = ({ title, value, icon, color, tooltip }) => (
  <div
    data-tooltip-id="stat-tooltip"
    data-tooltip-content={tooltip}
    className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center text-center backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-200"
  >
    <div
      className={`p-3 rounded-full bg-opacity-20 ${color} bg-${
        color.split("-")[1]
      }-100 dark:bg-opacity-10 mb-2`}
    >
      {/* Icon for the stat card */}
      {icon}
    </div>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {title}
    </h3>
    <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
      {value}
    </p>
  </div>
);
export default StatCard;