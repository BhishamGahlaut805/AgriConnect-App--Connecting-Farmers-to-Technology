// src/components/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size]} border-4 border-green-200 border-t-green-500 rounded-full animate-spin`}
      ></div>
      {text && (
        <p className="text-green-600 dark:text-green-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
