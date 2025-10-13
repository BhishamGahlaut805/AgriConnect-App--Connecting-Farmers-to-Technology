import {
  BellIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  MapPinIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";
import StyledCard from "../Components/StyleCard";

const NotificationView = ({
  notifications = [],
  farms = [],
  markNotificationsAsRead,
  fetchData,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-violet-100 flex items-center space-x-2">
          <BellIcon className="h-6 w-6 text-gray-600 dark:text-violet-200" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>

        <div className="flex items-center space-x-4">
          <button
            onClick={markNotificationsAsRead}
            className="text-sm text-blue-600 dark:text-violet-400 hover:underline"
            data-tooltip-id="mark-read-tooltip"
            data-tooltip-content="Mark all notifications as read"
          >
            Mark all as read
          </button>
          <button
            onClick={fetchData}
            className="text-sm text-blue-600 dark:text-violet-400 hover:underline"
            data-tooltip-id="refresh-tooltip"
            data-tooltip-content="Refresh notifications"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* No notifications */}
      {notifications.length === 0 ? (
        <StyledCard color="indigo">
          <div className="text-center py-10">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-violet-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-violet-100">
              No notifications yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-violet-200">
              We'll notify you when something new happens
            </p>
          </div>
        </StyledCard>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {notifications.map((notification) => {
            const farmName =
              farms.find((f) => f.farm_id === notification.farmId)?.farm_name ||
              "Your Farm";

            let colorClass;
            let IconComponent;
            switch (notification.type) {
              case "warning":
                colorClass = "red";
                IconComponent = ShieldExclamationIcon;
                break;
              case "info":
                colorClass = "blue";
                IconComponent = BellIcon;
                break;
              default:
                colorClass = "emerald";
                IconComponent = CheckCircleIcon;
            }

            return (
              <StyledCard
                key={notification._id}
                color={colorClass}
                className={`transition-all duration-200 ${
                  !notification.read
                    ? "ring-2 ring-opacity-50 ring-violet-500 dark:ring-violet-300"
                    : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    <IconComponent
                      className={`h-5 w-5 text-${colorClass}-500`}
                    />
                  </div>

                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-violet-100">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-violet-400"></span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      {notification.farmId && (
                        <span className="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs flex items-center">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {farmName}
                        </span>
                      )}
                      {notification.disease && (
                        <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs">
                          {notification.disease}
                        </span>
                      )}
                      {notification.severity && (
                        <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs">
                          {notification.severity} risk
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </StyledCard>
            );
          })}
        </div>
      )}

      <Tooltip id="mark-read-tooltip" />
      <Tooltip id="refresh-tooltip" />
    </div>
  );
};

export default NotificationView;
