import React from "react";
import { motion } from "framer-motion";
import headerBg from "../assets/images/bg1.png"; // Background image
import cropGif from "/src/assets/images/fruit.gif";
import aiGif from "/src/assets/images/chat-bot.gif";
import liveGif from "/src/assets/images/environment.gif";
import videoGif from "/src/assets/images/newi.gif";

const ChatHeader = ({ setSidebarOpen }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className=" relative rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src={headerBg}
          alt="AgriWeed Background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-blue-900/70 to-sky-800/60"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center py-16 px-2 md:px-12 text-white">
        {/* Title */}
        <motion.h1
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg"
        >
          <span className="text-yellow-300">Agribot</span> - Powered by
          AGRIConnect
        </motion.h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-2xl text-yellow-100 max-w-3xl mx-auto font-medium">
          AI-powered Agri-Chatbot for{" "}
          <span className="font-semibold text-yellow-300">farmers</span> — get
          quick help on crops, weather, and fertilizers.
        </p>

        {/* Animated Feature GIFs */}
        <div className="flex justify-center mt-8 gap-6 flex-wrap">
          <div className="flex flex-col items-center">
            <img
              src={cropGif}
              alt="Crop Analysis"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <span className="mt-2 text-yellow-100 text-sm font-medium">
              Query Analysis
            </span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={videoGif}
              alt="Video Analysis"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <span className="mt-2 text-yellow-100 text-sm font-medium">
              Crop Analysis
            </span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={liveGif}
              alt="Live Monitoring"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <span className="mt-2 text-yellow-100 text-sm font-medium">
              Live Field Monitoring
            </span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={aiGif}
              alt="AI Prediction"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <span className="mt-2 text-yellow-100 text-sm font-medium">
              AI Prediction
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-x-12 gap-y-6 pt-10 border-t border-white/30 mt-10"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-300 drop-shadow-md">
              120+
            </div>
            <div className="text-yellow-100 text-sm uppercase tracking-wide">
              Fields Monitored
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-300 drop-shadow-md">
              30+
            </div>
            <div className="text-yellow-100 text-sm uppercase tracking-wide">
              Weeds Detected
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-300 drop-shadow-md">
              95%
            </div>
            <div className="text-yellow-100 text-sm uppercase tracking-wide">
              Accuracy Rate
            </div>
          </div>
        </motion.div>

        {/* Tagline */}
        <p className="mt-8 text-lg text-gray-100 italic max-w-2xl mx-auto">
          “Empowering farmers with real-time insights, advanced AI
          predictions, and data-driven weed management for higher yield and
          sustainable farming.”
        </p>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
