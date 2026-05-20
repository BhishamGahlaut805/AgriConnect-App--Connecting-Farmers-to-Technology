import { motion } from "framer-motion";

const cardcontainerimage1 =
  "https://plus.unsplash.com/premium_photo-1674624682288-085eff4f98da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFybSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D";
const cardcontainerimage2 =
  "https://images.unsplash.com/photo-1716830234226-9dc4088ba59b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhcm0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww";
const cardcontainerimage3 =
  "https://source.unsplash.com/600x400/?fieldhttps://images.unsplash.com/photo-1623190632241-20a391a7b2e0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhcm0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww";
const cardcontainerimage4 =
  "https://images.unsplash.com/photo-1716830234226-9dc4088ba59b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhcm0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww";
const image1 =
  "https://plus.unsplash.com/premium_photo-1674624682288-085eff4f98da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFybSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D";
const image2 =
  "https://images.unsplash.com/photo-1716830234226-9dc4088ba59b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhcm0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww";
const image3 =
  "https://images.unsplash.com/photo-1623190632241-20a391a7b2e0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhcm0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww";
const image4 =
  "https://images.unsplash.com/photo-1716830234226-9dc4088ba59b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhcm0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww";
const image5 =
  "https://plus.unsplash.com/premium_photo-1663945778994-11b3201882a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZmFybSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D";
const cropGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258549/fruit_mgfwwa.gif";
const yieldGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258548/environment_iwo4aa.gif";
const aiGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258546/chat-bot_phleij.gif";
const mapGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258550/newi_fojfll.gif";

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
