import { motion } from "framer-motion";
import bgImage from "/src/assets/images/cont2.png";
import sunGif from "/src/assets/images/hot.gif";
import cloudGif from "/src/assets/images/cloudy.gif";
import windGif from "/src/assets/images/forest.gif";
import cropGif from "/src/assets/images/environment.gif"; // optional new GIF

const WelcomeBanner = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative w-full h-full min-h-[90vh] mb-10 rounded-3xl overflow-hidden shadow-2xl"
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
      <div className="relative z-10 p-6 sm:p-12 text-white flex flex-col justify-between h-full">
        {/* Top Greeting */}
        <div className="max-w-8xl space-y-3">
          <motion.h2
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl text-center sm:text-5xl font-extrabold drop-shadow-lg"
          >
            Welcome To Crop Disease Detection by{" "}
            <span className="text-yellow-300">🌾AgriConnect</span>
          </motion.h2>
          </div>
        <div className="max-w-2xl space-y-2">
          <motion.h2
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl right:10 font-extrabold leading-snug drop-shadow-lg"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-gray-100 text-sm italic mt-2 opacity-90"
          >
            Empowering you with smart insights for crop disease detection across
            multiple crops.
          </motion.p>
        </div>

        {/* Models Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
        >
          {[
            {
              title: "General Model",
              desc: "Detects diseases across multiple crops quickly and accurately.",
              gif: cropGif,
            },
            {
              title: "Cotton Model",
              desc: "Specialized model for cotton crop diseases and health tracking.",
              gif: cropGif,
            },
            {
              title: "Potato Model",
              desc: "Optimized for early detection and yield prediction in potato fields.",
              gif: cropGif,
            },
          ].map((model, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-md hover:shadow-xl transition"
            >
              <img
                src={model.gif}
                alt={model.title}
                className="w-16 h-16 mx-auto mb-2 object-contain"
              />
              <h3 className="text-yellow-300 font-semibold text-lg mb-1">
                {model.title}
              </h3>
              <p className="text-gray-200 text-sm">{model.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Animated GIFs */}
        <div className="absolute bottom-5 right-5 flex gap-3 opacity-90">
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
      </div>
    </motion.div>
  );
};

export default WelcomeBanner;
