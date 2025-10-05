import { useState } from "react";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 w-48 p-2 mt-1 text-xs rounded shadow-lg bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-200">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
