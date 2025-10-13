// Helper Component: ModelOption for selecting AI prediction model
const ModelOption = ({
  value, // String: unique value for the model
  selected, // Boolean: true if this option is currently selected
  onClick, // Function: handler for click event
  title, // String: display title of the model
  description, // String: brief description of the model
  tooltip, // String: tooltip content for more info
  children, // ReactNode: optional content like images or icons
}) => (
  <div
    onClick={onClick}
    data-tooltip-id="model-tooltip"
    data-tooltip-content={tooltip}
    className={`
      p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform
      ${
        selected
          ? "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700 shadow-md scale-[1.02]"
          : "border-gray-300 hover:border-green-300 dark:border-gray-600 dark:hover:border-green-600 shadow-sm hover:scale-[1.01] bg-white dark:bg-gray-700/50"
      }
      flex flex-col justify-between items-center
    `}
  >
    {/* Render children (like image) at the top */}
    {children && <div className="mb-3">{children}</div>}

    {/* Header with radio-like circle */}
    <div className="flex items-center mb-1 w-full justify-center">
      <div
        className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0
          ${
            selected
              ? "border-green-500 bg-green-500"
              : "border-gray-400 dark:border-gray-500"
          }
        `}
      >
        {selected && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <h3 className="font-medium text-gray-800 dark:text-white text-lg text-center">
        {title}
      </h3>
    </div>

    {/* Description */}
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
      {description}
    </p>
  </div>
);

export default ModelOption;
