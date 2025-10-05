// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Cloud,
  Shield,
  Users,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI Chat Assistant",
      description:
        "Get instant answers to your farming questions with our intelligent agricultural assistant",
      color: "green",
    },
    {
      icon: Cloud,
      title: "Live Weather Data",
      description:
        "Real-time weather forecasts and agricultural advisories for your region",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Disease Detection",
      description:
        "Identify crop diseases and get treatment recommendations instantly",
      color: "red",
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description:
        "Stay updated with latest agricultural news and market trends",
      color: "purple",
    },
    {
      icon: Users,
      title: "Expert Knowledge",
      description:
        "Access comprehensive farming knowledge from trusted agricultural sources",
      color: "orange",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your farming needs",
      color: "emerald",
    },
  ];

  const stats = [
    { number: "50K+", label: "Farmers Helped" },
    { number: "100+", label: "Crop Varieties" },
    { number: "24/7", label: "Availability" },
    { number: "95%", label: "Accuracy Rate" },
  ];

  return (
    <div className="mt-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl">
            <Sprout className="h-16 w-16 text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            AgriConnect
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Your intelligent farming companion. Get expert agricultural advice,
          weather updates, disease solutions, and market insights - all in one
          place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/chat"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="h-6 w-6" />
            <span>Start Chatting</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-2xl font-semibold text-lg border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Shield className="h-6 w-6" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-green-200 dark:border-green-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Modern Farming
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to make informed farming decisions and maximize
            your yield
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div
                  className={`bg-${feature.color}-100 dark:bg-${feature.color}-900 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon
                    className={`h-8 w-8 text-${feature.color}-600 dark:text-${feature.color}-400`}
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-center text-white shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Farming?
        </h2>
        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
          Join thousands of farmers who are already using AgriConnect to make
          better decisions and grow smarter.
        </p>
        <Link
          to="/chat"
          className="inline-flex items-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="h-6 w-6" />
          <span>Get Started Now</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
