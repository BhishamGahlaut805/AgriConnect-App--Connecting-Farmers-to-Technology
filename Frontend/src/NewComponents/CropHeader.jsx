import { motion } from "framer-motion";
import image11 from "../assets/images/bg11.png";
import tempRainImg from "/src/assets/images/rain.gif";
import analysisImg from "/src/assets/images/fruit.gif";

const CropHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative mb-8 w-full rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Background Image + Gradient Overlay */}
      <img
        src={image11}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-emerald-800/70 to-sky-800/60"></div>

      {/* Header Content */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-10 gap-4">
        <div className="max-w-xl space-y-2">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg"
          >
            Crop Disease Detection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="text-gray-100 text-sm md:text-base tracking-wide"
          >
            Upload images of your crops to detect potential diseases
          </motion.p>
        </div>

        {/* GIF Decorations */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <motion.img
            src={tempRainImg}
            alt="Weather Icon"
            className="w-12 h-12 object-contain rounded-full shadow-md"
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          <motion.img
            src={analysisImg}
            alt="Analysis Icon"
            className="w-12 h-12 object-contain rounded-full shadow-md"
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-300 via-green-400 to-sky-500"></div>
    </motion.div>
  );
};

export default CropHeader;
