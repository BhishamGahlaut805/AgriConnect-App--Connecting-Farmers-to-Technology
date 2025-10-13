import React, { useState, useEffect, useRef } from "react";
import {
  FiVolume2,
  FiPause,
  FiDownload,
  FiPrinter,
  FiBarChart2,
  FiInfo,
  FiPlay,
  FiPause as FiStop,
} from "react-icons/fi";
import DiseaseResultCard from "./DiseaseResultCard";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const CropDiseaseResults = ({
  results,
  fetchCropReport,
  downloadReport,
  printReport,
  generateComprehensiveReport,
  setActiveTab,
}) => {
  const [ttsContent, setTtsContent] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("hi-IN");
  const [activeView, setActiveView] = useState("cards");
  const speechRef = useRef(null);

  // Background images and GIFs
  const backgroundImages = {
    main: "/src/assets/images/bg1.png",
    gradient: "/src/assets/images/cardcontainerimage2.jpg",
    pattern: "/src/assets/images/image15.png",
    voiceAssistant: "/src/assets/images/chat-bot.gif",
    farmer: "/src/assets/images/environment.gif",
    plants: "/src/assets/images/sea-level.gif",
    warning: "/src/assets/images/storm.gif",
  };

  // Convert confidence to textual risk levels with Hindi translations
  const getRiskLevel = (confidence) => {
    // console.log("Calculating risk level for confidence:", confidence);
    // if(confidence<1 && confidence>0){
    //   confidence*=100;
    // }
    if (confidence >= 85)
      return {
        level: "Severe Risk",
        levelHindi: "गंभीर जोखिम",
        color: "#dc2626",
        emoji: "🔴",
        description: "Immediate action required",
        descriptionHindi: "तुरंत कार्रवाई आवश्यक",
      };
    if (confidence >= 65)
      return {
        level: "High Risk",
        levelHindi: "उच्च जोखिम",
        color: "#f97316",
        emoji: "🟠",
        description: "Urgent attention needed",
        descriptionHindi: "तत्काल ध्यान देने की आवश्यकता",
      };
    if (confidence >= 40)
      return {
        level: "Moderate Risk",
        levelHindi: "मध्यम जोखिम",
        color: "#facc15",
        emoji: "🟡",
        description: "Monitor closely",
        descriptionHindi: "करीब से निगरानी करें",
      };
    if (confidence > 0)
      return {
        level: "Low Risk",
        levelHindi: "कम जोखिम",
        color: "#22c55e",
        emoji: "🟢",
        description: "Normal monitoring",
        descriptionHindi: "सामान्य निगरानी",
      };
    return {
      level: "Unknown",
      levelHindi: "अज्ञात",
      color: "#9ca3af",
      emoji: "⚫",
      description: "No data available",
      descriptionHindi: "कोई डेटा उपलब्ध नहीं",
    };
  };

  // Prepare TTS summary content in both languages
  useEffect(() => {
    if (results && results.length > 0) {
      const englishContent = results
        .map((pred, index) => {
          let confidence =
            typeof pred.confidence === "number"
              ? pred.confidence
              : parseFloat(pred.confidence?.toString().replace("%", "")) || 0;
              console.log("Confidence value:", confidence);
              if(confidence<1 && confidence>0){
                confidence*=100;
              }
          const { level } = getRiskLevel(confidence);
          const cropName = pred.crop || "Unknown crop";
          const diseaseName = pred.disease
            ? pred.disease.replace(/_/g, " ")
            : "unknown disease";

          return `Image ${
            index + 1
          }: ${cropName} is showing ${level.toLowerCase()} due to ${diseaseName}. Confidence level is ${Math.round(
            confidence
          )} percent.`;
        })
        .join(" ");

      const hindiContent = results
        .map((pred, index) => {
          let confidence =
            typeof pred.confidence === "number"
              ? pred.confidence
              : parseFloat(pred.confidence?.toString().replace("%", "")) || 0;
              if(confidence<1 && confidence>0){
                confidence*=100;
              }
          const { levelHindi } = getRiskLevel(confidence);
          const cropName = pred.crop || "अज्ञात फसल";
          const diseaseName = pred.disease
            ? pred.disease
                .replace(/_/g, " ")
                .replace("Blight", "झुलसा")
                .replace("Wilt", "मुरझान")
                .replace("Rot", "सड़न")
            : "अज्ञात रोग";

          return `चित्र ${
            index + 1
          }: ${cropName} में ${levelHindi.toLowerCase()} दिख रहा है, कारण है ${diseaseName}. विश्वास स्तर ${Math.round(
            confidence
          )} प्रतिशत है।`;
        })
        .join(" ");

      setTtsContent({
        english: `Crop Disease Analysis Report. Total ${results.length} images analyzed. ${englishContent}`,
        hindi: `फसल रोग विश्लेषण रिपोर्ट। कुल ${results.length} चित्रों का विश्लेषण किया गया। ${hindiContent}`,
      });
    }
  }, [results]);

  // TTS handler with proper language support
  const handleSpeak = () => {
    if (!ttsContent || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const content =
      language === "hi-IN" ? ttsContent.hindi : ttsContent.english;
    const utterance = new SpeechSynthesisUtterance(content);

    // Configure voice settings
    utterance.lang = language;
    utterance.rate = 0.8; // Slower for better understanding
    utterance.pitch = 1;
    utterance.volume = 1;

    // Find appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang === language &&
        (language === "hi-IN"
          ? voice.name.includes("Hindi")
          : voice.name.includes("English"))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;
    setIsSpeaking(true);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Prepare data for different chart types
  const chartData = results?.map((pred, index) => {
    let confidence =
      typeof pred.confidence === "number"
        ? pred.confidence
        : parseFloat(pred.confidence?.toString().replace("%", "")) || 0;
    if (confidence < 1 && confidence > 0) {
      confidence *= 100;
        }
    const { level, levelHindi, color, emoji } = getRiskLevel(confidence);
    return {
      name:
        pred.disease?.replace(/_/g, " ").substring(0, 15) + "..." || "Unknown",
      nameHindi:
        (pred.disease
          ? pred.disease
              .replace(/_/g, " ")
              .replace("Blight", "झुलसा")
              .replace("Wilt", "मुरझान")
              .replace("Rot", "सड़न")
              .replace("Spot", "धब्बा")
          : "अज्ञात"
        ).substring(0, 12) + "...",
      confidence: Math.round(confidence),
      risk: level,
      riskHindi: levelHindi,
      color,
      emoji,
      crop: pred.crop || "Unknown",
    };
  });

  // Pie chart data for risk distribution
  const riskDistribution = chartData?.reduce((acc, item) => {
    const riskLevel = language === "hi-IN" ? item.riskHindi : item.risk;
    const existing = acc.find((a) => a.name === riskLevel);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: riskLevel, value: 1, color: item.color });
    }
    return acc;
  }, []);

  // Summary statistics
  const totalImages = results?.length || 0;
  const highRiskCount =
    chartData?.filter((item) => item.confidence >= 65).length || 0;
  const healthyCount =
    chartData?.filter(
      (item) =>
        item.name.toLowerCase().includes("healthy") || item.confidence === 0
    ).length || 0;

  if (!results || results.length === 0) {
    return (
      <div className="relative min-h-[400px] bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-center overflow-hidden border-2 border-green-200 dark:border-gray-700">
        {/* Animated background */}
        <img
          src={backgroundImages.pattern}
          alt="Agriculture Pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <img
          src={backgroundImages.farmer}
          alt="Farmer Animation"
          className="absolute right-10 bottom-0 w-48 h-48 opacity-20"
        />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-100 dark:bg-green-900 rounded-full p-6 inline-block mb-6 shadow-lg"
          >
            <FiInfo className="h-12 w-12 text-green-600 dark:text-green-300" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
          >
            🌾 कोई रोग परिणाम नहीं मिला
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto"
          >
            अपनी फसल की स्पष्ट तस्वीर अपलोड करें और AI-पावर्ड रोग पहचान शुरू
            करें।
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Upload a clear image of your crop to start AI-powered disease
            detection.
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen p-4 bg-cover bg-center bg-no-repeat rounded-3xl"
      style={{
        backgroundImage: `url('${backgroundImages.main}')`,
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/70 to-emerald-50/90 dark:from-gray-900/90 dark:via-gray-800/95 dark:to-gray-900/90 rounded-3xl"></div>

      <div className="relative z-10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/70 rounded-3xl p-6 lg:p-8 shadow-2xl border border-green-200/50 dark:border-gray-700/50 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center items-center gap-4">
            <img
              src={backgroundImages.plants}
              alt="Growing Plants"
              className="w-16 h-16"
            />
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              किसान सहायक - Kisan Sahayak
            </h1>
            <img
              src={backgroundImages.plants}
              alt="Growing Plants"
              className="w-16 h-16"
            />
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            AI-पावर्ड फसल रोग विश्लेषण  • तत्काल रिपोर्ट्स •
            मुफ्त सलाह
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI-Powered Crop Disease Analysis • Live Video Support • Instant
            Reports • Free Advisory
          </p>
        </motion.div>

        {/* Voice Assistant Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative p-6 rounded-2xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 dark:from-gray-700/80 dark:to-gray-600/80 shadow-xl border border-green-300/30 dark:border-gray-600/50 overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-200/20 via-transparent to-transparent"></div>
          {/* <img
            src={backgroundImages.voiceAssistant}
            alt="AI Voice Assistant"
            className="absolute right-6 top-6 w-24 h-24 opacity-40"
          /> */}

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 flex items-center gap-3 mb-2">
                  <FiVolume2 className="text-green-600" />
                  आवाज़ सहायक - Voice Assistant
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-base mb-2">
                  <span className="font-semibold">सुनिए रिपोर्ट:</span> हिंदी या
                  अंग्रेजी में विस्तृत विश्लेषण सुनें। बड़ी और स्पष्ट आवाज़ में।
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  <span className="font-semibold">Listen to Report:</span> Hear
                  detailed analysis in Hindi or English. Loud and clear voice.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="border-2 border-green-400 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:text-white shadow-md"
                >
                  <option value="hi-IN">हिंदी (Hindi)</option>
                  <option value="en-IN">English (India)</option>
                </select>

                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform hover:scale-105 ${
                    isSpeaking
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <FiStop className="text-lg" />
                      <span className="hidden sm:inline">रोकें / Stop</span>
                    </>
                  ) : (
                    <>
                      <FiVolume2 className="text-lg" />
                      <span className="hidden sm:inline">सुनें / Listen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/80 dark:bg-gray-700/80 p-6 rounded-2xl shadow-lg border border-green-200/50 text-center backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalImages}
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              कुल तस्वीरें
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Total Images
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-700/80 p-6 rounded-2xl shadow-lg border border-orange-200/50 text-center backdrop-blur-sm">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {highRiskCount}
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              उच्च जोखिम
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              High Risk Cases
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-700/80 p-6 rounded-2xl shadow-lg border border-green-200/50 text-center backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {healthyCount}
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              स्वस्थ फसल
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Healthy Crops
            </div>
          </div>
        </motion.div>

        {/* Visualization Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => setActiveView("cards")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeView === "cards"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            📋 कार्ड व्यू / Card View
          </button>
          <button
            onClick={() => setActiveView("charts")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeView === "charts"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            📊 ग्राफ व्यू / Graph View
          </button>
        </motion.div>

        {/* Charts Section */}
        {activeView === "charts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Bar Chart */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 shadow-xl border border-orange-200/50">
              <div className="flex items-center gap-3 mb-4">
                <FiBarChart2 className="text-orange-500 text-2xl" />
                <h4 className="font-bold text-xl text-orange-700 dark:text-orange-300">
                  रोग जोखिम विश्लेषण / Disease Risk Analysis
                </h4>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <XAxis
                      dataKey={language === "hi-IN" ? "nameHindi" : "name"}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#374151", fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value:
                          language === "hi-IN" ? "विश्वास %" : "Confidence %",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "#374151" },
                      }}
                      tick={{ fill: "#374151" }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        value + "%",
                        language === "hi-IN" ? "विश्वास" : "Confidence",
                      ]}
                      labelFormatter={(label) =>
                        `${language === "hi-IN" ? "रोग:" : "Disease:"} ${label}`
                      }
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "2px solid #ddd",
                        color: "#111",
                        fontSize: "14px",
                      }}
                    />
                    <Bar
                      dataKey="confidence"
                      barSize={35}
                      radius={[5, 5, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 shadow-xl border border-green-200/50">
              <div className="flex items-center gap-3 mb-4">
                <FiBarChart2 className="text-green-500 text-2xl" />
                <h4 className="font-bold text-xl text-green-700 dark:text-green-300">
                  जोखिम वितरण / Risk Distribution
                </h4>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        value,
                        language === "hi-IN" ? "मामले" : "Cases",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Disease Cards */}
        {activeView === "cards" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {results.map((prediction, index) => {
              const confidence =
                typeof prediction.confidence === "number"
                  ? prediction.confidence
                  : parseFloat(
                      prediction.confidence?.toString().replace("%", "")
                    ) || 0;
              const {
                level,
                levelHindi,
                color,
                emoji,
                description,
                descriptionHindi,
              } = getRiskLevel(confidence);

              return (
                <DiseaseResultCard
                  key={index}
                  prediction={{
                    ...prediction,
                    riskLevel: level,
                    riskLevelHindi: levelHindi,
                    riskColor: color,
                    riskEmoji: emoji,
                    description,
                    descriptionHindi,
                    image_url:
                      prediction.image_url ||
                      prediction.imageUrl ||
                      prediction.image_path ||
                      "/images/placeholder-crop.jpg",
                  }}
                  language={language}
                  onViewDetails={() => fetchCropReport(prediction)}
                  setActiveTab={setActiveTab}
                />
              );
            })}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-green-200/50 dark:border-gray-600/50"
        >
          <button
            onClick={() => downloadReport(generateComprehensiveReport())}
            className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-lg font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <FiDownload className="text-xl" />
            <span>रिपोर्ट डाउनलोड करें / Download Report</span>
          </button>

          <button
            onClick={printReport}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-lg font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <FiPrinter className="text-xl" />
            <span>प्रिंट करें / Print Summary</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-lg font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <FiPlay className="text-xl" />
            <span>नया विश्लेषण / New Analysis</span>
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4"
        >
          <p>
            🚜 यह रिपोर्ट AI तकनीक से तैयार की गई है। किसी विशेषज्ञ से सलाह लेना
            उचित रहेगा।
          </p>
          <p>
            This report is generated using AI technology. Consulting an expert
            is recommended.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CropDiseaseResults;
