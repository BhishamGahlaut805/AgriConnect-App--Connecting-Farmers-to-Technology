import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { ThemeContext } from "../Util/ThemeContext";
import campingimg from "/src/assets/images/camping.gif";
import newimg from "/src/assets/images/newi.gif";
import envirimg from "/src/assets/images/environment.gif";
import harvestimg from "/src/assets/images/fruit.gif";
import agribotimg from "/src/assets/images/chat-bot.gif";
import communityimg from "/src/assets/images/communityimg.gif";
import AgriConnectBenefits from "../SubComponents/AgriConnectBenefits";

const AgriConnectHome = () => {
  const { darkMode } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    {
      id: "crop-disease",
      title: "Crop Health Scanner",
      description:
        "Upload plant images to detect diseases and get treatment solutions",
      icon: "🔍",
      path: "/crop-disease",
      tutorial:
        "Simply take a clear photo of affected leaves. Our AI analyzes patterns and provides specific treatment recommendations.",
      color: "from-green-500 to-emerald-600",
      image: campingimg,
    },
    {
      id: "crop-yield",
      title: "Harvest Predictor",
      description:
        "Forecast your crop yield with advanced analytics and weather data",
      icon: "📊",
      path: "/crop-yield",
      tutorial:
        "Enter crop details and farming practices to receive accurate yield predictions with confidence intervals.",
      color: "from-amber-500 to-orange-600",
      image: harvestimg,
    },
    {
      id: "weather",
      title: "Farm Weather",
      description:
        "Hyper-local weather forecasts tailored for farming activities",
      icon: "🌤️",
      path: "/weather",
      tutorial:
        "Get precise weather updates and farming advisories specific to your location and crop type.",
      color: "from-blue-500 to-cyan-600",
      image: envirimg,
    },
    {
      id: "weed-detection",
      title: "Weed Spotter",
      description: "Identify weeds in your fields and get removal strategies",
      icon: "🌿",
      path: "/WeedDetection",
      tutorial:
        "Upload field images to automatically detect weed types and receive targeted removal recommendations.",
      color: "from-lime-500 to-green-600",
      image: newimg,
    },
    {
      id: "agribot",
      title: "Farming Assistant",
      description: "24/7 AI expert for instant farming guidance",
      icon: "🤖",
      path: "/agribot",
      tutorial:
        "Ask any farming question and get instant expert answers about crops, pests, or techniques.",
      color: "from-purple-500 to-indigo-600",
      image: agribotimg,
    },
    {
      id: "community",
      title: "Farmer Circle",
      description: "Connect with fellow farmers and share knowledge",
      icon: "👥",
      path: "/chat",
      tutorial:
        "Join community discussions, share experiences, and learn from other farmers in your region.",
      color: "from-teal-500 to-blue-600",
      image: communityimg,
    },
  ];

  const farmingTips = [
    {
      title: "Smart Monitoring",
      description: "Regular crop health checks prevent major losses",
      image: campingimg,
    },
    {
      title: "Weather Planning",
      description: "Plan activities around accurate weather forecasts",
      image: "/src/images/weather-planning.jpg",
    },
    {
      title: "Community Wisdom",
      description: "Learn from experienced farmers in your area",
      image: "/src/images/community.jpg",
    },
  ];

  // Close sidebar when clicking on a link (for mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className={`mt-20 min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-blue-50 to-amber-50"
      }`}
    >
      {/* <div
        className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
        onClick={() => setSidebarOpen(false)}
      /> */}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Floating Sidebar - Mobile Optimized */}
      <div
        className={`fixed overflow-y-auto inset-y-0 left-0 z-50 w-80 md:w-72 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          darkMode
            ? "bg-gray-800/95 backdrop-blur-md border-r border-gray-700"
            : "bg-white/95 backdrop-blur-md border-r border-green-100"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={`p-6 md:p-4 border-b ${
              darkMode ? "border-gray-700" : "border-green-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">🌱</span>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  AgriConnect
                </h2>
                <p
                  className={`text-xs md:text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Smart Farming Partner
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 md:p-6 space-y-2">
            {features.map((feature) => (
              <Link
                key={feature.id}
                to={feature.path}
                onClick={handleLinkClick}
                className={`group flex items-center space-x-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                  darkMode
                    ? "hover:bg-gray-700/50 text-gray-300"
                    : "hover:bg-green-50/80 text-gray-700"
                } backdrop-blur-sm border ${
                  darkMode ? "border-gray-700" : "border-green-200"
                } hover:shadow-lg hover:scale-105`}
                data-tooltip-id="sidebar-tooltip"
                data-tooltip-content={feature.tutorial}
              >
                <div
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-sm md:text-lg">{feature.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-lg truncate">
                    {feature.title}
                  </h3>
                  <p
                    className={`text-xs md:text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } truncate`}
                  >
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div
            className={`p-4 md:p-6 border-t ${
              darkMode ? "border-gray-700" : "border-green-200"
            }`}
          >
            <div
              className={`text-center p-3 md:p-4 rounded-xl md:rounded-2xl ${
                darkMode ? "bg-gray-700/50" : "bg-green-100/50"
              } backdrop-blur-sm`}
            >
              <p
                className={`text-xs md:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Ready to transform your farming?
              </p>
              <Link
                to="/auth/v1/app/AgriConnect/register"
                onClick={handleLinkClick}
                className="inline-block mt-2 md:mt-3 px-4 md:px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg md:rounded-xl font-semibold text-sm md:text-base hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Start Today
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : "ml-0"
        }`}
      >
        {/* Header Bar - Mobile Optimized */}
        <header
          className={`sticky top-0 z-40 ${
            darkMode
              ? "bg-gray-800/80 backdrop-blur-md border-b border-gray-700"
              : "bg-white/80 backdrop-blur-md border-b border-green-200"
          }`}
        >
          <div className="flex items-center justify-between p-4 md:p-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-green-100 hover:bg-green-200 text-gray-700"
              } hover:shadow-lg transform hover:scale-105`}
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="flex-1 mx-4 md:mx-0">
              <span
                className={`text-lg md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-500 bg-clip-text text-transparent  text-center block truncate`}
              >
                <span className="hidden md:inline">
                  Empowering Farmers, Connecting Fields — AgriConnect
                </span>
                <span className="md:hidden">AgriConnect</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                to="/auth/v1/app/AgriConnect/login"
                className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 ${
                  darkMode
                    ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                } shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                <span className="hidden md:inline">Sign In</span>
                <span className="md:hidden">Login</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section - Mobile Optimized */}
        <section className="relative py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                <div className="space-y-3 md:space-y-4">
                  <div
                    className={`inline-block px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl ${
                      darkMode
                        ? "bg-gray-700/50 text-green-400"
                        : "bg-green-100/80 text-green-700"
                    } backdrop-blur-sm border ${
                      darkMode ? "border-gray-600" : "border-green-300"
                    }`}
                  >
                    <span className="font-semibold text-sm md:text-base">
                      🌾 Transforming Agriculture
                    </span>
                  </div>
                  <h1
                    className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Grow Smarter,
                    <span className="block bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      Harvest Better
                    </span>
                  </h1>
                  <p
                    className={`text-lg md:text-2xl leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    AI-powered insights for healthier crops, higher yields, and
                    sustainable farming practices.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start">
                  <Link
                    to="/auth/v1/app/AgriConnect/register"
                    className={`px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg text-center transition-all duration-300 ${
                      darkMode
                        ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                    } shadow-2xl hover:shadow-3xl transform hover:scale-105`}
                  >
                    Start Your Journey
                  </Link>
                  <a
                    href="#features"
                    className={`px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg text-center border-2 transition-all duration-300 ${
                      darkMode
                        ? "border-green-500 text-green-400 hover:bg-green-900/30"
                        : "border-green-500 text-green-600 hover:bg-green-50"
                    } hover:shadow-xl transform hover:scale-105`}
                  >
                    Explore Tools
                  </a>
                </div>
              </div>

              {/* Hero Visual - Mobile Optimized */}
              <div className="relative mt-8 lg:mt-0">
                <div
                  className={`rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ${
                    darkMode
                      ? "ring-2 ring-green-500/30"
                      : "ring-2 ring-green-200"
                  }`}
                >
                  <img
                    src="/src/images/farm-hero.jpg"
                    alt="Modern farming with technology"
                    className="w-full h-64 md:h-96 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
                    }}
                  />
                </div>
                {/* Floating Cards - Hidden on mobile */}
                <div
                  className={`hidden md:block absolute -bottom-6 -left-6 p-4 md:p-6 rounded-xl md:rounded-2xl backdrop-blur-md border ${
                    darkMode
                      ? "bg-gray-800/80 border-gray-700"
                      : "bg-white/80 border-green-200"
                  } shadow-2xl`}
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm md:text-lg">📈</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm md:text-base">
                        +45% Yield
                      </p>
                      <p
                        className={`text-xs md:text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Average improvement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Mobile Optimized */}
        <section
          id="features"
          className="py-12 px-4 md:px-6 md:py-20 bg-gradient-to-br from-green-200 via-emerald-300/40 to-lime-200"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2
                className={`text-3xl md:text-5xl font-bold mb-4 md:mb-6 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Your Complete Farming Toolkit
              </h2>
              <p
                className={`text-lg md:text-xl max-w-3xl mx-auto ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Everything you need to make informed decisions and optimize your
                farm's performance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`group relative rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all duration-500 hover:scale-105 ${
                    darkMode
                      ? "bg-gray-800/50 hover:bg-gray-700/70"
                      : "bg-emerald-50/80 backdrop-blur-md border border-emerald-100 shadow-md"
                  } backdrop-blur-md border ${
                    darkMode ? "border-gray-700" : "border-green-200"
                  } shadow-xl md:shadow-2xl hover:shadow-3xl flex flex-col h-full`}
                  data-tooltip-id="feature-tooltip"
                  data-tooltip-content={feature.tutorial}
                >
                  {/* Feature GIF with Aspect Ratio */}
                  <div className="w-full aspect-video mb-2 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 dark:bg-gray-100 scale-100 border-green-200">
                    <div className="absolute inset-0 bg-emerald-50/80 backdrop-blur-md"></div>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="absolute bg-emerald-50/80 backdrop-blur-md inset-0 w-full h-full object-contain transform scale-90 group-hover:scale-105 transition-transform duration-500 rounded-xl md:rounded-2xl"
                      loading="lazy"
                      onError={(e) => {
                        const fallbacks = {
                          "crop-disease":
                            "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
                          "crop-yield":
                            "https://media.giphy.com/media/xULW8N9LfHnqKkKkQ0/giphy.gif",
                          weather:
                            "https://media.giphy.com/media/3o7aD2sa2AqQqQqQqQ/giphy.gif",
                          "weed-detection":
                            "https://media.giphy.com/media/l0MYJnJQ6XfK1qQrS/giphy.gif",
                          agribot:
                            "https://media.giphy.com/media/l0MYOUIjqF1KqQrS/giphy.gif",
                          community:
                            "https://media.giphy.com/media/l0MYOUIjqF1KqQrS/giphy.gif",
                        };
                        e.target.src =
                          fallbacks[feature.id] ||
                          "https://media.giphy.com/media/l0MYOUIjqF1KqQrS/giphy.gif";
                      }}
                    />
                  </div>


                  {/* Content Area */}
                  <div className="flex flex-col flex-1 space-y-3 md:space-y-4">
                    {/* Header with Icon */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-sm md:text-base flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                      >
                        {feature.icon}
                      </div>
                      <h3
                        className={`text-lg md:text-xl font-bold flex-1 ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p
                      className={`text-sm md:text-base flex-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      } leading-relaxed`}
                    >
                      {feature.description}
                    </p>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Link
                        to={feature.path}
                        onClick={handleLinkClick}
                        className={`inline-flex items-center justify-center w-full py-2 px-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                          darkMode
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        } shadow-md hover:shadow-lg transform hover:scale-105`}
                      >
                        Explore Feature
                        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Farming Tips Section - Mobile Optimized */}
        <section className="py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div
              className={`rounded-2xl md:rounded-3xl p-6 md:p-12 ${
                darkMode
                  ? "bg-gradient-to-br from-green-200 via-emerald-300/40 to-lime-200"
                  : "bg-gradient-to-br from-white to-green-50"
              } shadow-2xl border ${
                darkMode ? "border-gray-700" : "border-green-200"
              }`}
            >
              <h2
                className={`text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Smart Farming Practices
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {farmingTips.map((tip, index) => (
                  <div
                    key={index}
                    className={`group text-center p-6 md:p-8 rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? "bg-gray-700/50 hover:bg-gray-600/50"
                        : "bg-green-100/50 hover:bg-green-200/50"
                    } backdrop-blur-sm border ${
                      darkMode ? "border-gray-600" : "border-green-300"
                    } hover:shadow-xl`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl md:text-2xl shadow-lg">
                      {index + 1}
                    </div>
                    <h3
                      className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {tip.title}
                    </h3>
                    <p
                      className={`text-sm md:text-base ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Visual Process Guide */}
              <div
                className={`mt-8 md:mt-16 p-6 md:p-8 rounded-xl md:rounded-2xl ${
                  darkMode ? "bg-gray-700/30" : "bg-green-100/30"
                } backdrop-blur-sm border ${
                  darkMode ? "border-gray-600" : "border-green-300"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div>
                    <img
                      src="/src/images/farming-process.jpg"
                      alt="Modern farming process"
                      className="rounded-xl md:rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80";
                      }}
                    />
                  </div>
                  <div
                    className={`space-y-4 md:space-y-6 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <h3
                      className={`text-2xl md:text-3xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Simple Steps to Success
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                            darkMode
                              ? "bg-green-600 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          1
                        </div>
                        <p className="text-sm md:text-base">
                          Set up your farm profile and preferences
                        </p>
                      </div>
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                            darkMode
                              ? "bg-green-600 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          2
                        </div>
                        <p className="text-sm md:text-base">
                          Use our tools for monitoring and predictions
                        </p>
                      </div>
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                            darkMode
                              ? "bg-green-600 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          3
                        </div>
                        <p className="text-sm md:text-base">
                          Implement data-driven decisions for better results
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto">
          <AgriConnectBenefits />
        </div>
        {/* Educational Purpose Section - Mobile Optimized */}
        <section className="py-12 bg-gradient-to-br from-green-200 via-emerald-300/40 to-lime-200 md:py-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`rounded-2xl md:rounded-3xl p-6 md:p-12 ${
                darkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900"
                  : "bg-gradient-to-br from-white to-green-50"
              } shadow-2xl border ${
                darkMode ? "border-gray-700" : "border-green-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-6 md:space-y-8">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                  <span className="text-2xl md:text-3xl text-white">🎓</span>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3
                    className={`text-2xl md:text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Educational Demonstration
                  </h3>
                  <p
                    className={`text-lg md:text-xl leading-relaxed max-w-2xl ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    This platform showcases how modern technology can transform
                    traditional farming practices. Created to demonstrate the
                    potential of AI and data analytics in agriculture.
                  </p>
                </div>
                <div
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl ${
                    darkMode
                      ? "bg-gray-700/50 text-green-400"
                      : "bg-green-100/80 text-green-700"
                  } backdrop-blur-sm border ${
                    darkMode ? "border-gray-600" : "border-green-300"
                  }`}
                >
                  <span className="font-semibold text-sm md:text-base">
                    For Educational Purposes Only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Tooltips */}
      <Tooltip
        id="sidebar-tooltip"
        place="right"
        className="z-50 max-w-xs text-sm"
        opacity={1}
      />
      <Tooltip
        id="feature-tooltip"
        place="top"
        className="z-50 max-w-sm text-sm"
        opacity={1}
      />
    </div>
  );
};

export default AgriConnectHome;
