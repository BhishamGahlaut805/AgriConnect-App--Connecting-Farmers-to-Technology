import React from "react";
import { FiFileText,FiAlertTriangle,FiXCircle,FiInfo,FiCheckCircle } from "react-icons/fi";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
// Helper Component: Message for displaying alerts/notifications
const Message = ({ type, message, onDismiss }) => {
  const bgColor = {
    error: "bg-red-100 dark:bg-red-900/50",
    success: "bg-green-100 dark:bg-green-900/50",
    info: "bg-blue-100 dark:bg-blue-900/50",
    warning: "bg-yellow-100 dark:bg-yellow-900/50",
  };
  const textColor = {
    error: "text-red-800 dark:text-red-200",
    success: "text-green-800 dark:text-green-200",
    info: "text-blue-800 dark:text-blue-200",
    warning: "text-yellow-800 dark:text-yellow-200",
  };
  const iconColor = {
    error: "text-red-500",
    success: "text-green-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  if (!message) return null; // Don't render if no message

  return (
    <div
      className={`p-4 rounded-lg flex items-center justify-between ${bgColor[type]} ${textColor[type]} mb-4 shadow-md animate-fade-in`}
      role="alert"
    >
      <div className="flex items-center">
        {type === "error" && (
          <FiAlertTriangle className={`mr-2 ${iconColor.error}`} />
        )}
        {type === "success" && (
          <FiCheckCircle className={`mr-2 ${iconColor.success}`} />
        )}
        {type === "info" && <FiInfo className={`mr-2 ${iconColor.info}`} />}
        {type === "warning" && (
          <FiAlertTriangle className={`mr-2 ${iconColor.warning}`} />
        )}
        <p className="text-sm md:text-base">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 p-1 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          aria-label="Dismiss message"
        >
          <FiXCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
export default Message;