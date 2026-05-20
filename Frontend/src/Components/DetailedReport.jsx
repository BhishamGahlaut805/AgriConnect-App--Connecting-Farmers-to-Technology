import React, { useEffect, useState, useRef } from "react";
import {
  FiXCircle,
  FiDownload,
  FiPrinter,
  FiImage,
  FiAlertTriangle,
  FiInfo,
  FiGlobe,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause,
  FiHeart,
  FiShield,
  FiDroplet,
  FiSun,
  FiClock,
  FiExternalLink,
  FiGrid,
  FiArrowRight,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import CropMonitorService from "../API/CropMonitorService.js";

const DetailedReportCard = ({
  report,
  onClose,
  downloadReport,
  printReport,
  generateComprehensiveReport,
}) => {
  const [language, setLanguage] = useState("hi-IN");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [isPlayingWelcome, setIsPlayingWelcome] = useState(false);
  const [scrapedImages, setScrapedImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const speechRef = useRef(null);
  const reportRef = useRef(null);
  const reportRefs = useRef({});

  // Background images and icons
  const backgroundAssets = {
    pattern:
      "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1778833550/bg1_x4idx8.png",
    // farmer: "/src/assets/images/environment.gif",
    // plants: "/src/assets/images/sea-level.gif",
    // warning: "/src/assets/images/storm.gif",
    voice:
      "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258545/camping_qicd3r.gif",
  };

  const confidence = report?.confidence || 0;

  // Get severity with Hindi translations
  const getSeverityInfo = (conf) => {
    if (conf > 0.8)
      return {
        level: "High",
        levelHindi: "गंभीर",
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-800",
        icon: "🔴",
        description: "Immediate action required",
        descriptionHindi: "तुरंत कार्रवाई आवश्यक",
      };
    if (conf > 0.5)
      return {
        level: "Medium",
        levelHindi: "मध्यम",
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-800",
        icon: "🟠",
        description: "Urgent attention needed",
        descriptionHindi: "तत्काल ध्यान देने की आवश्यकता",
      };
    if (conf > 0)
      return {
        level: "Low",
        levelHindi: "कम",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        icon: "🟢",
        description: "Normal monitoring required",
        descriptionHindi: "सामान्य निगरानी आवश्यक",
      };
    return {
      level: "Unknown",
      levelHindi: "अज्ञात",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      icon: "⚫",
      description: "No data available",
      descriptionHindi: "कोई डेटा उपलब्ध नहीं",
    };
  };

  const severityInfo = getSeverityInfo(confidence);

  // Format text with proper bullet points and structure
  // Format text with proper bullet points and structure
  const formatText = (text) => {
    if (text === null || text === undefined) return "";

    let formatted = "";

    // Handle arrays
    if (Array.isArray(text)) {
      formatted = text.join(" ; ");
    }
    // Handle objects
    else if (typeof text === "object") {
      formatted = Object.values(text).join(" ; ");
    }
    // Handle normal strings/numbers
    else {
      formatted = String(text);
    }

    // Split by *, •, semicolon, or newline
    const lines = formatted.split(/[\*\•;\n]/).filter((line) => line.trim());

    return lines.map((line, index) => {
      const cleanLine = line.trim().replace(/\*\*/g, "");

      return (
        <div key={index} className="flex items-start gap-3 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>

          <span className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {cleanLine}
          </span>
        </div>
      );
    });
  };

  // Format text for speech (remove markdown)
  // Format text for speech (safe version)
  const formatTextForSpeech = (text) => {
    // Handle null/undefined
    if (text === null || text === undefined) return "";

    let formatted = "";

    // Convert arrays to string
    if (Array.isArray(text)) {
      formatted = text.join(". ");
    }
    // Convert objects to readable string
    else if (typeof text === "object") {
      formatted = Object.values(text).join(". ");
    }
    // Convert everything else to string
    else {
      formatted = String(text);
    }

    // Remove markdown formatting
    formatted = formatted.replace(/\*\*/g, "").replace(/\*/g, "");

    // Replace bullet symbols with periods
    formatted = formatted.replace(/•/g, ".");

    // Replace multiple spaces/newlines
    formatted = formatted.replace(/\s+/g, " ").trim();

    // Better speech formatting
    formatted = formatted.replace(/\(([^)]+)\)/g, " — $1 —");

    // Ensure spacing after periods
    formatted = formatted.replace(/\.([^\s])/g, ". $1");

    // Semicolons -> periods
    formatted = formatted.replace(/;/g, ".");

    // Line breaks -> pauses
    formatted = formatted.replace(/\n/g, ". ");

    // Add pause spacing
    formatted = formatted.replace(/([.;])/g, "$1 ");

    return formatted;
  };

  // Comprehensive TTS content with welcome and closing scripts
  const ttsContent = {
    welcome: {
      en: `Welcome to your crop disease analysis report. I am your AI Kisan Mitra. We have analyzed your ${
        report?.crop || "crop"
      } and found ${
        report?.disease?.replace(/_/g, " ") || "a disease"
      } with ${Math.round(
        confidence * 100,
      )} percent confidence. Let me guide you through the detailed report.`,
      hi: `आपके फसल रोग विश्लेषण रिपोर्ट में स्वागत है। मैं हूं आपकी AI किसान मित्र। हमने आपकी ${
        report?.crop || "फसल"
      } का विश्लेषण किया है और ${
        report?.disease?.replace(/_/g, " ") || "एक रोग"
      } पाया है, ${Math.round(
        confidence * 100,
      )} प्रतिशत विश्वास के साथ। मैं आपको विस्तृत रिपोर्ट के माध्यम से मार्गदर्शन करूंगा।`,
    },
    overview: {
      en: `Crop: ${report?.crop || "Unknown"}. Disease: ${
        report?.disease?.replace(/_/g, " ") || "Unknown"
      }. Confidence Level: ${Math.round(confidence * 100)} percent. Severity: ${
        severityInfo.level
      }. ${severityInfo.description}.`,
      hi: `फसल: ${report?.crop || "अज्ञात"}. रोग: ${
        report?.disease?.replace(/_/g, " ") || "अज्ञात"
      }. विश्वास स्तर: ${Math.round(confidence * 100)} प्रतिशत. गंभीरता: ${
        severityInfo.levelHindi
      }. ${severityInfo.descriptionHindi}.`,
    },
    symptoms: {
      en: `Symptoms identified: ${
        report?.symptoms
          ? formatTextForSpeech(report.symptoms)
          : "No specific symptoms information available."
      }`,
      hi: `पहचाने गए लक्षण: ${
        report?.symptoms
          ? formatTextForSpeech(report.symptoms)
          : "कोई विशिष्ट लक्षण जानकारी उपलब्ध नहीं है."
      }`,
    },
    treatment: {
      en: `Recommended treatment: ${
        report?.treatment
          ? formatTextForSpeech(report.treatment)
          : "No specific treatment information available. Please consult an agricultural expert."
      }`,
      hi: `सुझाया गया उपचार: ${
        report?.treatment
          ? formatTextForSpeech(report.treatment)
          : "कोई विशिष्ट उपचार जानकारी उपलब्ध नहीं है. कृपया कृषि विशेषज्ञ से सलाह लें."
      }`,
    },
    recommendations: {
      en: `Expert recommendations: ${
        report?.recommendations
          ? formatTextForSpeech(report.recommendations)
          : "Monitor your crop regularly and maintain proper farming practices."
      }`,
      hi: `विशेषज्ञ सिफारिशें: ${
        report?.recommendations
          ? formatTextForSpeech(report.recommendations)
          : "अपनी फसल की नियमित निगरानी करें और उचित खेती प्रथाओं को बनाए रखें."
      }`,
    },
    prevention: {
      en: `Prevention measures: ${
        report?.prevention
          ? formatTextForSpeech(report.prevention)
          : "Follow good agricultural practices and regular monitoring to prevent disease spread."
      }`,
      hi: `रोकथाम उपाय: ${
        report?.prevention
          ? formatTextForSpeech(report.prevention)
          : "रोग के प्रसार को रोकने के लिए अच्छी कृषि पद्धतियों का पालन करें और नियमित निगरानी करें."
      }`,
    },
    closing: {
      en: "This concludes your crop disease analysis report. For more detailed information and personalized advice, click on the chat option to speak with our agricultural experts. Remember to consult local agricultural experts for personalized advice. Thank you for using AI Kisan Mitra. Jai Kisan, Jai Jawan!",
      hi: "यह आपकी फसल रोग विश्लेषण रिपोर्ट का समापन है। अधिक विस्तृत जानकारी और व्यक्तिगत सलाह के लिए, चैट विकल्प पर क्लिक करके हमारे कृषि विशेषज्ञों से बात करें। व्यक्तिगत सलाह के लिए स्थानीय कृषि विशेषज्ञों से परामर्श करना याद रखें। AI किसान मित्र का उपयोग करने के लिए धन्यवाद। जय किसान, जय जवान!",
    },
  };

  // Enhanced TTS handler with proper voice selection
  const speakText = (text, lang) => {
    if (!text || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // Slower for better understanding
    utterance.pitch = 1;
    utterance.volume = 1;

    // Find appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => {
      if (lang === "hi-IN") {
        return voice.lang === "hi-IN" || voice.name.includes("Hindi");
      } else {
        return voice.lang.startsWith("en") && voice.name.includes("Female");
      }
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSection("");
      setIsPlayingWelcome(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSection("");
      setIsPlayingWelcome(false);
    };

    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;
    setIsSpeaking(true);
  };

  // Play welcome message
  const playWelcomeMessage = () => {
    setIsPlayingWelcome(true);
    speakText(ttsContent.welcome[language === "hi-IN" ? "hi" : "en"], language);
  };

  // Play section-specific content
  const playSection = (section) => {
    setCurrentSection(section);

    const el = reportRefs.current[section];
    if (!el) return;

    // Grab visible text
    const textToSpeak = el.innerText || el.textContent || "";
    speakText(textToSpeak, language);
  };

  // Play full report
  const playFullReport = () => {
    const fullReport = Object.keys(ttsContent)
      .map((key) => ttsContent[key][language === "hi-IN" ? "hi" : "en"])
      .join(" ");
    speakText(fullReport, language);
  };

  // Stop speech
  const stopSpeech = () => {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentSection("");
    setIsPlayingWelcome(false);
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === "hi-IN" ? "en-US" : "hi-IN";
    setLanguage(newLang);
    if (isSpeaking) {
      stopSpeech();
    }
  };

  // Fetch web-scraped images
  const fetchScrapedImages = async () => {
    if (!report?.crop || !report?.disease) return;

    try {
      setIsLoadingImages(true);
      const images = await CropMonitorService.webScrapeUpload(
        report.crop,
        report.disease,
      );
      // console.log("Fetched scraped images:", images);
      setScrapedImages(images.imageUrls || []);
    } catch (error) {
      console.error("Error fetching scraped images:", error);
      setScrapedImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Auto-play welcome message and fetch images on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playWelcomeMessage();
    }, 1000);

    fetchScrapedImages();

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, []);

  // TTS Player Component for each section
  const TTSSectionPlayer = ({ section, size = "default" }) => {
    const isActive = isSpeaking && currentSection === section;
    const buttonSize = size === "large" ? "p-3" : "p-2";
    const iconSize = size === "large" ? 20 : 16;

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (isActive ? stopSpeech() : playSection(section))}
        className={`rounded-full transition-all ${
          isActive
            ? "bg-red-500 text-white shadow-lg"
            : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50"
        } ${buttonSize}`}
        data-tooltip-id="tts-tooltip"
        data-tooltip-content={
          isActive ? "Stop listening" : "Listen to this section"
        }
      >
        {isActive ? <FiPause size={iconSize} /> : <FiVolume2 size={iconSize} />}
      </motion.button>
    );
  };

  // Navigate to chat
  const navigateToChat = () => {
    window.location.href = "/chat";
  };

  if (
    !report ||
    typeof report !== "object" ||
    !report.crop ||
    !report.disease
  ) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 text-center"
        >
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 inline-block mb-4">
            <FiAlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            रिपोर्ट उपलब्ध नहीं
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Report not available. Please try again with valid data.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-medium transition-colors duration-200 shadow-lg"
          >
            वापस जाएं / Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-green-200 dark:border-gray-700 max-w-7xl w-full overflow-hidden my-8"
        ref={reportRef}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url('${backgroundAssets.pattern}')`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Header */}
        <div
          className={`relative bg-gradient-to-r ${severityInfo.color} px-8 py-6 flex justify-between items-center rounded-t-3xl shadow-xl`}
        >
          <div className="flex items-center gap-4">
            {/* Icon with subtle GIF background */}
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258545/camping_qicd3r.gif"
                alt="Shield Animation"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <FiShield className="text-white text-2xl relative z-10" />
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                🌾 फसल रोग रिपोर्ट / Crop Disease Report
                <img
                  src="https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258548/farmer_jxnfx2.gif"
                  className="w-8 h-8"
                  alt="Farm GIF"
                />
              </h2>
              <p className="text-white/90 text-sm mt-1">
                AI-पावर्ड विस्तृत विश्लेषण • AI-Powered Detailed Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-all px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm shadow-md"
            >
              <FiGlobe size={18} />
              <span className="font-medium">
                {language === "hi-IN" ? "English" : "हिंदी"}
              </span>
            </motion.button>

            {/* TTS Controls */}
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopSpeech}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg"
                >
                  <FiPause size={18} />
                  <span>रोकें / Stop</span>
                  <img
                    src="/animations/pause-gif.gif"
                    className="w-5 h-5"
                    alt="Pause GIF"
                  />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playFullReport}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg"
                >
                  <FiVolume2 size={18} />
                  <span>पूरी रिपोर्ट सुनें / Full Report</span>
                  <img
                    src="https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258554/volume_fmuupi.gif"
                    className="w-5 h-5"
                    alt="Sound Wave GIF"
                  />
                </motion.button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <FiXCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6 relative">
          {/* Left Column - Image and Overview */}
          <div className="xl:col-span-1 space-y-6">
            {/* Image Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <FiImage /> फसल चित्र / Crop Image
                </h3>
                <TTSSectionPlayer section="overview" />
              </div>

              {report.image_url || report.imageUrl || report.image_path ? (
                <div className="relative group h-64 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-blue-300 dark:border-blue-700">
                  <img
                    src={
                      report.image_url || report.imageUrl || report.image_path
                    }
                    alt={report.crop}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      className="bg-white/90 text-gray-800 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg"
                      onClick={() =>
                        window.open(
                          report.image_url ||
                            report.imageUrl ||
                            report.image_path,
                          "_blank",
                        )
                      }
                    >
                      <FiImage size={16} /> पूरा चित्र देखें / View Full
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col justify-center items-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700">
                  <FiImage className="text-4xl mb-2" />
                  <p>कोई चित्र उपलब्ध नहीं / No image available</p>
                </div>
              )}
            </motion.div>

            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`${severityInfo.bgColor} border-2 ${severityInfo.borderColor} rounded-2xl p-6 shadow-lg`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  {severityInfo.icon} रिपोर्ट सारांश / Report Summary
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    फसल / Crop
                  </span>
                  <span className="text-gray-800 dark:text-white font-bold text-lg">
                    {report.crop}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    रोग / Disease
                  </span>
                  <span className="text-gray-800 dark:text-white font-bold text-lg">
                    {report.disease.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    विश्वास / Confidence
                  </span>
                  <span className="text-gray-800 dark:text-white font-bold text-lg">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    गंभीरता स्तर / Severity Level
                  </div>
                  <div className="text-xl font-bold text-gray-800 dark:text-white">
                    {language === "hi-IN"
                      ? severityInfo.levelHindi
                      : severityInfo.level}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {language === "hi-IN"
                      ? severityInfo.descriptionHindi
                      : severityInfo.description}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat Navigation Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white"
            >
              <div className="text-center">
                <FiExternalLink className="text-3xl mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">अधिक जानकारी चाहिए?</h3>
                <h3 className="font-bold text-lg mb-3">Need More Details?</h3>
                <p className="text-white/90 text-sm mb-4">
                  हमारे कृषि विशेषज्ञों से सीधे बात करें और व्यक्तिगत सलाह पाएं
                </p>
                <p className="text-white/90 text-sm mb-4">
                  Talk directly to our agricultural experts and get personalized
                  advice
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={navigateToChat}
                  className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>चैट पर जाएं / Go to Chat</span>
                  <FiArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Symptoms Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6 shadow-lg"
              ref={(el) => (reportRefs.current["symptoms"] = el)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-orange-800 dark:text-orange-300 flex items-center gap-2">
                  <FiAlertTriangle /> लक्षण / Symptoms
                </h3>
                <TTSSectionPlayer section="symptoms" />
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-orange-100 dark:border-orange-900">
                {report.symptoms ? (
                  <div className="space-y-2">{formatText(report.symptoms)}</div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    कोई लक्षण जानकारी उपलब्ध नहीं है। / No symptoms information
                    available.
                  </p>
                )}
              </div>
            </motion.div>
            {/* Treatment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-green-800 dark:text-green-300 flex items-center gap-2">
                  <FiDroplet /> उपचार / Treatment
                </h3>
                <TTSSectionPlayer section="treatment" />
              </div>
              <div
                className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-green-100 dark:border-green-900"
                ref={(el) => (reportRefs.current["treatment"] = el)}
              >
                {report.treatment ? (
                  <div className="space-y-2">
                    {formatText(report.treatment)}
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    कोई उपचार जानकारी उपलब्ध नहीं है। कृपया कृषि विशेषज्ञ से
                    सलाह लें। / No treatment information available. Please
                    consult an agricultural expert.
                  </p>
                )}
              </div>
            </motion.div>
            {/* Recommendations Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-lg
              "
              ref={(el) => (reportRefs.current["recommendations"] = el)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <FiSun /> सिफारिशें / Recommendations
                </h3>
                <TTSSectionPlayer section="recommendations" />
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-purple-100 dark:border-purple-900">
                {report.recommendations ? (
                  <div className="space-y-2">
                    {formatText(report.recommendations)}
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    अपनी फसल की नियमित निगरानी करें और उचित खेती प्रथाओं को बनाए
                    रखें। / Monitor your crop regularly and maintain proper
                    farming practices.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Scraped Images Grid */}
            {(scrapedImages.length > 0 || isLoadingImages) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border-2 border-cyan-200 dark:border-cyan-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
                    <FiGrid /> संबंधित चित्र / Related Images
                  </h3>
                </div>

                {isLoadingImages ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 h-32 animate-pulse"
                      >
                        <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {scrapedImages.slice(0, 9).map((imageUrl, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-2 border border-cyan-100 dark:border-cyan-900 cursor-pointer"
                        onClick={() => window.open(imageUrl, "_blank")}
                      >
                        <img
                          src={encodeURI(imageUrl)}
                          alt={`Example ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-b-3xl">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <FiClock className="text-green-500" />
              <span className="text-sm">
                रिपोर्ट समय: {new Date().toLocaleString("hi-IN")} / Report Time:{" "}
                {new Date().toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  downloadReport(generateComprehensiveReport(report))
                }
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
              >
                <FiDownload size={18} />
                <span>डाउनलोड / Download</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={printReport}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
              >
                <FiPrinter size={18} />
                <span>प्रिंट / Print</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={playFullReport}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
              >
                <FiVolume2 size={18} />
                <span>फिर सुनें / Listen Again</span>
              </motion.button>
            </div>
          </div>

          {/* Closing Note */}
          <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🚜 यह रिपोर्ट AI तकनीक से तैयार की गई है। किसी विशेषज्ञ से सलाह
              लेना उचित रहेगा।
              <br />
              This report is AI-generated. Consulting an agricultural expert is
              recommended.
            </p>
          </div>
        </div>

        {/* Tooltips */}
        <Tooltip
          id="tts-tooltip"
          place="top"
          effect="solid"
          className="!bg-gray-800 !text-white !text-sm !py-2 !px-3 !rounded-xl"
        />
      </motion.div>
    </div>
  );
};

export default DetailedReportCard;
