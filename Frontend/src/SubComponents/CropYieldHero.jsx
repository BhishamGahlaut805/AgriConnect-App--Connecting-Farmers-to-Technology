import { motion } from "framer-motion";
import image1 from "../assets/images/bg1.png";
import cardcontainerimage1 from "../assets/images/cont1.png";
import cardcontainerimage2 from "../assets/images/cont2.png";
import cardcontainerimage3 from "../assets/images/cont3.png";
import cardcontainerimage4 from "../assets/images/cont4.png";
import image2 from "../assets/images/image15.png";
import image3 from "../assets/images/bg3.png";
import image4 from "../assets/images/bg4.png";
import cropGif from "/src/assets/images/fruit.gif";
import yieldGif from "/src/assets/images/environment.gif";
import aiGif from "/src/assets/images/chat-bot.gif";
import mapGif from "/src/assets/images/newi.gif";

const CropYieldHero = ({ yieldState, totalCrops, availableStates }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src={image2}
          alt="Farming background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-blue-900/70 to-sky-800/60"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center py-16 px-6 md:px-12 text-white">
        <motion.h1
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg"
        >
          🌾 Advanced{" "}
          <span className="text-yellow-300">Crop Yield Forecast System</span>
        </motion.h1>

        <p className="mt-4 text-lg md:text-2xl text-yellow-100 max-w-3xl mx-auto font-medium">
          Currently viewing:{" "}
          <span className="font-semibold text-yellow-300">
            {yieldState || "Select a State"}
          </span>
          <br className="hidden md:block" />
          AI-powered yield insights using{" "}
          <span className="text-yellow-300 font-semibold">
            weather, satellite, and soil data.
          </span>
        </p>

        {/* Animated GIFs */}
        <div className="flex justify-center mt-8 gap-4 flex-wrap">
          <img
            src={cropGif}
            alt="Crop Growth"
            className="w-20 h-20 object-contain rounded-full shadow-lg"
          />
          <img
            src={yieldGif}
            alt="Yield Prediction"
            className="w-20 h-20 object-contain rounded-full shadow-lg"
          />
          <img
            src={aiGif}
            alt="AI"
            className="w-20 h-20 object-contain rounded-full shadow-lg"
          />
          <img
            src={mapGif}
            alt="Mapping"
            className="w-20 h-20 object-contain rounded-full shadow-lg"
          />
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
              {totalCrops || "—"}
            </div>
            <div className="text-yellow-100 text-sm uppercase tracking-wide">
              Crops Analyzed
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-300 drop-shadow-md">
              {availableStates || "—"}
            </div>
            <div className="text-yellow-100 text-sm uppercase tracking-wide">
              States Covered
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
        <p className="mt-8 text-lg text-gray-100 italic">
          “Empowering Indian farmers with data-driven yield predictions for a
          sustainable tomorrow.”
        </p>
      </div>
    </motion.div>
  );
};

export default CropYieldHero;
