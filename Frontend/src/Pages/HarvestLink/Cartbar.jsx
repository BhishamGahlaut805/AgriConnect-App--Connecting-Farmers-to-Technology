// File: CartBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaBell, FaSearch } from "react-icons/fa";
import CartNav from "./CartNav";

const CartBar = ({ className = "" }) => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userDetails")) || {
    name: "User",
    _id: "defaultId",
  };

  useEffect(() => {
    // Mock cart count - replace with actual cart API or context
    setCartCount(3);
  }, []);

  return (
    <nav
      className={`fixed top-20 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Container */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/harvestLink/v1/agriConnect"
            className="flex items-center space-x-2"
          >
            <div className="bg-green-600 dark:bg-green-500 text-white p-2 rounded-lg shadow-sm">
              <FaShoppingCart className="text-lg sm:text-xl" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400">
                HarvestLink
              </span>
              <span className="ml-1 text-xs sm:text-sm text-yellow-500 italic">
                Beta
              </span>
            </div>
          </Link>

          {/* Search Bar - visible on md+ screens */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products, categories..."
                className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition">
              <FaBell className="text-lg sm:text-xl" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                onClick={() => navigate(`/user/dashboard/${user._id}`)}
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {/* Optional username (hidden on small screens) */}
              <span className="hidden sm:inline text-gray-800 dark:text-gray-200 font-medium text-sm">
                {user.name}
              </span>
            </div>
            {/*SellerDashboard Link*/}
            <div className="font-bold text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-300 px-3 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform">
              <button
                onClick={() => navigate(`/harvestLink/seller-dashboard`)}
                className="flex items-center gap-2"
              >
                {/* Icon visible only on mobile */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 block md:hidden"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h18v4H3zM5 7h14v14H5z"
                  />
                </svg>

                {/* Text visible only on medium+ screens */}
                <span className="hidden md:inline">Sell With Us</span>
              </button>
            </div>

            {/* Cart Menu */}
            <CartNav />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (visible only on small screens) */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </nav>
  );
};

export default CartBar;
