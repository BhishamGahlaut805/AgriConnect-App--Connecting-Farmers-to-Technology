import React, { useEffect } from "react";
import clsx from "clsx";

export const Dialog = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={clsx(
          "bg-white dark:bg-gray-800 rounded-xl shadow-2xl",
          "w-[95vw] max-w-6xl h-[90vh] max-h-[800px]",
          "border-4 border-blue-500 dark:border-blue-600",
          "transform transition-all duration-300 scale-95 hover:scale-100",
          "flex flex-col overflow-hidden",
          "relative" // For close button positioning
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className={clsx(
            "absolute top-4 right-4 z-10",
            "p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30",
            "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className = "", children }) => (
  <div className={clsx("flex-1 overflow-y-auto p-6", className)}>
    {children}
  </div>
);

export const DialogHeader = ({ className = "", children }) => (
  <div
    className={clsx(
      "border-b border-gray-200 dark:border-gray-700 p-6",
      "bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800",
      className
    )}
  >
    {children}
  </div>
);

export const DialogTitle = ({ className = "", children }) => (
  <h2
    className={clsx(
      "text-2xl md:text-3xl font-bold text-gray-900 dark:text-white",
      "flex items-center gap-3",
      className
    )}
  >
    {children}
  </h2>
);

export const DialogDescription = ({ className = "", children }) => (
  <p
    className={clsx(
      "text-base text-gray-600 dark:text-gray-300 mt-2",
      "max-w-3xl",
      className
    )}
  >
    {children}
  </p>
);

export const DialogTrigger = ({ onClick, children }) => (
  <button
    className={clsx(
      "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
      "font-medium transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "inline-flex items-center gap-1"
    )}
    onClick={onClick}
  >
    {children}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

export const DialogFooter = ({ className = "", children }) => (
  <div
    className={clsx(
      "border-t border-gray-200 dark:border-gray-700 p-4",
      "bg-gray-50 dark:bg-gray-900/50",
      "flex justify-end space-x-3",
      className
    )}
  >
    {children}
  </div>
);
