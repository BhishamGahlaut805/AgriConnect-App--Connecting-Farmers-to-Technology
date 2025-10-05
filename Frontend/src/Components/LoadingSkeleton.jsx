import React from "react";

import PropTypes from "prop-types";

const LoadingSkeleton = ({ count = 5, className = "" }) => {
  return (
    <div className={`space-y-4 p-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse border-gray-200 dark:border-gray-700"
        >
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />

          {/* Text content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>

          {/* Action button */}
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
LoadingSkeleton.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};
