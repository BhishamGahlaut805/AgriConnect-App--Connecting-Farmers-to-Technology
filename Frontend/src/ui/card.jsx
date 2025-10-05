import React from "react";
import clsx from "clsx";

export const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ className = "", children, ...props }) => {
  return (
    <div
      className={clsx("p-4 md:p-6 text-gray-900 dark:text-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card header
export const CardHeader = ({ className = "", children, ...props }) => (
  <div className={clsx("px-4 md:px-6 pt-4 md:pt-6", className)} {...props}>
    {children}
  </div>
);

// Card title (for heading)
export const CardTitle = ({ className = "", children, ...props }) => (
  <h3
    className={clsx(
      "text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

//card CardDescription

export const CardDescription = ({ className = "", children, ...props }) => (
  <p
    className={clsx("text-sm text-gray-600 dark:text-gray-300 mt-1", className)}
    {...props}
  >
    {children}
  </p>
);

//card CardFooter
export const CardFooter = ({ className = "", children, ...props }) => (
  <div
    className={clsx(
      "px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-200 dark:border-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
