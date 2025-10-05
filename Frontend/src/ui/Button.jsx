// Button.jsx
import React from "react";

/**
 * A reusable Button component with customizable styling.
 * It supports standard HTML button attributes and can accept children as its content.
 *
 * @param {object} props - The props for the Button component.
 * @param {string} [props.className] - Additional Tailwind CSS classes to apply.
 * @param {React.ReactNode} props.children - The content to be rendered inside the button.
 * @param {string} [props.variant="primary"] - Defines the button's visual style.
 * Can be "primary", "secondary", "destructive", "outline", "ghost", or "link".
 * @param {string} [props.size="default"] - Defines the button's size.
 * Can be "default", "sm" (small), "lg" (large), or "icon" (square for icons).
 * @param {object} [props.props] - Any other standard HTML button attributes (e.g., onClick, type).
 */
const Button = ({
  className = "",
  children,
  variant = "primary",
  size = "default",
  ...props
}) => {
  // Base styling for the button, applying common interactive states.
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  // Variant-specific styles
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };

  // Size-specific styles
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10", // Square button for icons
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
