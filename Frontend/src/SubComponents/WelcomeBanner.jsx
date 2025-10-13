import { motion } from "framer-motion";
import bgImage from "/src/assets/images/cont2.png";
import sunGif from "/src/assets/images/hot.gif";
import cloudGif from "/src/assets/images/cloudy.gif";
import windGif from "/src/assets/images/forest.gif";
import StyledCard from "../Components/StyleCard";
import WeatherWidget from "../components/WeatherWidget";

const WelcomeBanner = ({ user, selectedFarm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mb-10 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Farm background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-emerald-800/70 to-sky-800/60"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        {/* Left Side – Greeting and Info */}
        <div className="max-w-xl space-y-3">
          <motion.h2
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold leading-snug drop-shadow-lg"
          >
            Welcome back,{" "}
            <span className="text-yellow-300">{user || "Farmer"}</span>!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="text-blue-100 text-sm sm:text-base tracking-wide"
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sky-100 text-base sm:text-lg"
          >
            Currently viewing:{" "}
            <span className="font-semibold text-yellow-300">
              {selectedFarm?.farm_name || "—"}
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-gray-100 text-sm italic mt-2 opacity-90"
          >
            “Empowering you with smart insights for better farm decisions.”
          </motion.p>
        </div>

        {/* Right Side – Weather Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="flex-shrink-0"
        >
          <StyledCard className="bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-violet-100 p-5 border border-white/20 rounded-2xl backdrop-blur-md shadow-lg">
            <WeatherWidget
              latitude={selectedFarm?.latitude}
              longitude={selectedFarm?.longitude}
            />
          </StyledCard>
        </motion.div>
      </div>

      {/* Animated GIF Decor */}
      <div className="absolute bottom-3 right-4 flex gap-3 opacity-90">
        <motion.img
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          src={sunGif}
          alt="Sun"
          className="w-12 h-12 object-contain rounded-full"
        />
        <motion.img
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
          src={cloudGif}
          alt="Cloud"
          className="w-12 h-12 object-contain rounded-full"
        />
        <motion.img
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 1 }}
          src={windGif}
          alt="Wind"
          className="w-12 h-12 object-contain rounded-full"
        />
      </div>

      {/* Bottom Gradient Accent */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-300 via-green-400 to-sky-500"></div>
    </motion.div>
  );
};

export default WelcomeBanner;
