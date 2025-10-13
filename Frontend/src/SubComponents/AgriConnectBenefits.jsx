import { motion } from "framer-motion";
import bgImage from "/src/assets/images/image15.png";
import leafGif from "/src/assets/images/camping.gif";
import tractorGif from "/src/assets/images/newi.gif";
import cloudGif from "/src/assets/images/cloudy.gif";
import aiGif from "/src/assets/images/chat-bot.gif";

const AgriConnectBenefits = () => {
  return (
    <section className="pt-24 pb-24 relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl my-10">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Farm Landscape"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-green-800/60 to-sky-900/70"></div>
      </div>

      {/* Floating Decorative GIFs */}
      <img
        src={leafGif}
        alt="Leaf animation"
        className="absolute top-10 left-10 w-14 h-14 sm:w-20 sm:h-20 opacity-90 animate-bounce"
      />
      <img
        src={tractorGif}
        alt="Tractor animation"
        className="absolute bottom-6 left-8 w-16 h-16 sm:w-24 sm:h-24 opacity-90 animate-pulse"
      />
      <img
        src={cloudGif}
        alt="Cloud animation"
        className="absolute top-8 right-10 w-16 h-16 sm:w-24 sm:h-24 opacity-90 animate-float"
      />
      <img
        src={aiGif}
        alt="AI animation"
        className="absolute bottom-8 right-10 w-16 h-16 sm:w-24 sm:h-24 opacity-90 animate-bounce"
      />

      {/* Foreground Content */}
      <div className="relative z-10 text-center max-w-4xl px-6 sm:px-12 text-white">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-extrabold mb-4 drop-shadow-md"
        >
          🌱 Empowering Farmers with{" "}
          <span className="text-yellow-300">AgriConnect</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg sm:text-xl text-emerald-100 leading-relaxed max-w-3xl mx-auto mb-6"
        >
          AgriConnect brings cutting-edge AI and real-time insights to your
          fingertips — helping you make smarter decisions, increase yield, and
          connect with the farming community like never before.
        </motion.p>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 text-left"
        >
          {[
            {
              title: "🌾 Smart Crop Monitoring",
              desc: "AI-powered disease detection and growth tracking using images and weather data.",
            },
            {
              title: "☁️ Real-Time Weather Forecast",
              desc: "Localized weather updates to help you plan irrigation and protect your crops.",
            },
            {
              title: "📈 Yield Prediction",
              desc: "Predict crop yield with high accuracy using advanced LSTM and Transformer models.",
            },
            {
              title: "💧 Fertilizer Planning",
              desc: "Get precise fertilizer recommendations with interactive what-if simulations.",
            },
            {
              title: "🧠 AI Chat Assistant",
              desc: "Ask questions, get instant advice, and access your farm insights in real-time.",
            },
            {
              title: "🛰️ Drone & GIS Mapping",
              desc: "Visualize pest and weed zones directly on your farm map using drone imagery.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm opacity-90">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AgriConnectBenefits;
