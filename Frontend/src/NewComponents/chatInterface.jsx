// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Trash2,
  Bot,
  Loader,
  Mic,
  Volume2,
  Languages,
  Play,
  Pause,
  ChevronDown,
  User,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
const bgGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258545/camping_qicd3r.gif";

// Import animated icons with fallbacks
const speakingGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258552/play_akkaf8.gif";
const listeningGif = "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258552/play_akkaf8.gif";

// Error boundary component
class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ChatInterface Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-600 mb-4">
              Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ChatInterface = ({
  messages = [],
  isLoading = false,
  onSendMessage,
  onClearChat,
}) => {
  // State management with validation
  const [inputMessage, setInputMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Initialize from localStorage or default to 'en'
    try {
      return localStorage.getItem("agri-chat-language") || "en";
    } catch {
      return "en";
    }
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [speechSupport, setSpeechSupport] = useState({
    synthesis: typeof window !== "undefined" && "speechSynthesis" in window,
    recognition:
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window),
  });

  // Refs with null checks
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechRef = useRef(null);
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  // Robust language options with fallbacks
  const languageOptions = React.useMemo(
    () => ({
      en: {
        name: "English",
        nativeName: "English",
        flag: "🇺🇸",
        voice: "en-US",
      },
      hi: { name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", voice: "hi-IN" },
      te: { name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", voice: "te-IN" },
      ta: { name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", voice: "ta-IN" },
      mr: { name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", voice: "mr-IN" },
      bn: { name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", voice: "bn-IN" },
      gu: {
        name: "Gujarati",
        nativeName: "ગુજરાતી",
        flag: "🇮🇳",
        voice: "gu-IN",
      },
      kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", voice: "kn-IN" },
      ml: {
        name: "Malayalam",
        nativeName: "മലയാളം",
        flag: "🇮🇳",
        voice: "ml-IN",
      },
      pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", voice: "pa-IN" },
      or: { name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳", voice: "or-IN" },
      as: {
        name: "Assamese",
        nativeName: "অসমীয়া",
        flag: "🇮🇳",
        voice: "as-IN",
      },
    }),
    [],
  );

  // Safe language getter
  const getLanguageOption = useCallback(
    (code) => {
      return languageOptions[code] || languageOptions.en;
    },
    [languageOptions],
  );

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Persist language selection
  useEffect(() => {
    try {
      localStorage.setItem("agri-chat-language", selectedLanguage);
    } catch (error) {
      console.warn("Could not save language preference:", error);
    }
  }, [selectedLanguage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    } catch (error) {
      console.warn("Scroll error:", error);
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up speech synthesis
      if (speechRef.current) {
        window.speechSynthesis?.cancel();
      }

      // Clean up speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  // Robust language detection
  const detectLanguage = useCallback((text) => {
    if (!text || typeof text !== "string") return "en";

    const languagePatterns = {
      hi: /[\u0900-\u097F]/, // Hindi
      te: /[\u0C80-\u0CFF]/, // Telugu
      ta: /[\u0B80-\u0BFF]/, // Tamil
      bn: /[\u0980-\u09FF]/, // Bengali
      pa: /[\u0A80-\u0AFF]/, // Punjabi
      ml: /[\u0D00-\u0D7F]/, // Malayalam
      kn: /[\u0C80-\u0CFF]/, // Kannada
      gu: /[\u0A80-\u0AFF]/, // Gujarati
      as: /[\u0980-\u09FF]/, // Assamese
      or: /[\u0B00-\u0B7F]/, // Odia
      mr: /[\u0900-\u097F]/, // Marathi
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return "en";
  }, []);

  // Safe text conversion with error handling
  const convertToEnglish = useCallback(async (text, sourceLang) => {
    if (!text || sourceLang === "en") return text;

    setProcessing(true);
    setError(null);

    try {
      // Enhanced mock translations with more comprehensive data
      const mockTranslations = {
        hi: {
          नमस्ते: "Hello",
          मौसम: "weather",
          फसल: "crop",
          खेती: "farming",
          कीट: "insect",
          बीमारी: "disease",
          आलू: "potato",
          गेहूं: "wheat",
          चावल: "rice",
          सिंचाई: "irrigation",
          खाद: "fertilizer",
          कीटनाशक: "pesticide",
          क्या: "what",
          कैसे: "how",
          कब: "when",
          कहाँ: "where",
        },
        te: {
          హలో: "Hello",
          వాతావరణం: "weather",
          పంట: "crop",
          వ్యవసాయం: "farming",
          కీటకం: "insect",
          రోగం: "disease",
          ఆలుగడ్డ: "potato",
          గోధుమ: "wheat",
        },
        ta: {
          வணக்கம்: "Hello",
          வானிலை: "weather",
          பயிர்: "crop",
          விவசாயம்: "farming",
        },
        bn: {
          নমস্কার: "Hello",
          আবহাওয়া: "weather",
          ফসল: "crop",
          চাষ: "farming",
        },
      };

      let translatedText = text;
      const translations = mockTranslations[sourceLang];

      if (translations) {
        Object.keys(translations).forEach((word) => {
          try {
            const regex = new RegExp(word, "gi");
            translatedText = translatedText.replace(regex, translations[word]);
          } catch (e) {
            console.warn(`Translation regex failed for word: ${word}`, e);
          }
        });
      }

      // Simulate API delay with timeout
      await new Promise((resolve) => setTimeout(resolve, 800));

      return translatedText !== text ? translatedText : text;
    } catch (error) {
      console.error("Conversion failed:", error);
      setError(
        "Translation service temporarily unavailable. Using original text.",
      );
      return text;
    } finally {
      setProcessing(false);
    }
  }, []);

  // Safe message submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading || processing) return;
    if (!isOnline) {
      setError(
        "No internet connection. Please check your network and try again.",
      );
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setError(null);

    try {
      // Detect input language
      const detectedLang = detectLanguage(userMessage);

      // Convert to English for server
      const englishMessage = await convertToEnglish(userMessage, detectedLang);

      // Validate callback before calling
      if (typeof onSendMessage === "function") {
        onSendMessage(englishMessage, "user");
      } else {
        throw new Error("Send message function not available");
      }

      // Simulate server response
      setTimeout(async () => {
        try {
          const serverResponse = `I understand your query about agriculture. For "${englishMessage}", here's my advice: Focus on proper irrigation and organic fertilizers for better yield.`;
          const userLanguageResponse =
            selectedLanguage !== "en"
              ? `${serverResponse} [Response in ${getLanguageOption(selectedLanguage).nativeName}]`
              : serverResponse;

          if (typeof onSendMessage === "function") {
            onSendMessage(userLanguageResponse, "bot");
          }
        } catch (error) {
          console.error("Server response simulation failed:", error);
          setError("Failed to get response from server. Please try again.");
        }
      }, 2000);
    } catch (error) {
      console.error("Message submission failed:", error);
      setError("Failed to send message. Please try again.");
      // Restore input message on error
      setInputMessage(userMessage);
    }
  };

  // Robust text-to-speech with comprehensive error handling
  const handleSpeak = useCallback(
    (text, lang = "en-US") => {
      if (!speechSupport.synthesis) {
        setError("Text-to-speech not supported in your browser");
        return;
      }

      try {
        // Stop any current speech
        if (speechRef.current) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
        }

        const utterance = new SpeechSynthesisUtterance(text.substring(0, 300)); // Limit length
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        utterance.onstart = () => {
          setIsPlaying(true);
          setCurrentSpeech(text);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsPlaying(false);
          setCurrentSpeech(null);
          setError("Speech synthesis failed. Please try again.");
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Speech synthesis setup failed:", error);
        setError("Text-to-speech initialization failed");
      }
    },
    [speechSupport.synthesis],
  );

  const handlePauseSpeech = useCallback(() => {
    if (window.speechSynthesis?.speaking) {
      try {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error("Pause speech failed:", error);
      }
    }
  }, []);

  const handleResumeSpeech = useCallback(() => {
    if (window.speechSynthesis?.paused) {
      try {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } catch (error) {
        console.error("Resume speech failed:", error);
      }
    }
  }, []);

  // Robust voice input handling
  const handleVoiceInput = useCallback(() => {
    if (!speechSupport.recognition) {
      setError(
        "Voice input not supported in your browser. Please use Chrome or Edge.",
      );
      return;
    }

    try {
      if (!recognitionRef.current) {
        const SpeechRecognition =
          window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error("Speech recognition API not available");
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          try {
            const transcript = event.results[0][0].transcript;
            setInputMessage((prev) => prev + (prev ? " " : "") + transcript);
          } catch (error) {
            console.error(
              "Speech recognition result processing failed:",
              error,
            );
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setListening(false);
          if (event.error === "not-allowed") {
            setError(
              "Microphone access denied. Please allow microphone permissions.",
            );
          } else {
            setError("Voice recognition failed. Please try again.");
          }
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
      }

      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        recognitionRef.current.lang =
          getLanguageOption(selectedLanguage)?.voice || "en-US";
        recognitionRef.current.start();
        setListening(true);
        setError(null);
      }
    } catch (error) {
      console.error("Voice input setup failed:", error);
      setError("Voice input initialization failed");
      setListening(false);
    }
  }, [
    listening,
    selectedLanguage,
    speechSupport.recognition,
    getLanguageOption,
  ]);

  // Safe language change handler
  const handleLanguageChange = useCallback(
    (code) => {
      if (languageOptions[code]) {
        setSelectedLanguage(code);
        setIsLanguageDropdownOpen(false);
        setError(null);
      }
    },
    [languageOptions],
  );

  // Enhanced suggested questions with fallbacks
  const suggestedQuestions = React.useMemo(
    () => ({
      en: [
        "What is late blight of potato?",
        "Current weather for farming?",
        "Wheat rust treatment options",
        "Rice cultivation best practices",
        "Organic farming techniques",
      ],
      hi: [
        "आलू का लेट ब्लाइट क्या है?",
        "खेती के लिए मौसम का हाल",
        "गेहूं की जंग उपचार विकल्प",
        "चावल की खेती के सर्वोत्तम तरीके",
        "जैविक खेती तकनीक",
      ],
      te: [
        "బంగాళాదుంప లేట్ బ్లైట్ అంటే ఏమిటి?",
        "వ్యవసాయానికి ప్రస్తుత వాతావరణం",
        "గోధుమ తుప్పు చికిత్స ఎంపికలు",
        "వరి సాగు ఉత్తమ పద్ధతులు",
        "సేంద్రీయ వ్యవసాయ పద్ధతులు",
      ],
      ta: [
        "உருளைக்கிழங்கு லேட் பிளைட் என்றால் என்ன?",
        "விவசாயத்திற்கான தற்போதைய வானிலை",
        "கோதுமை துரு சிகிச்சை விருப்பங்கள்",
        "நெல் சாகுபடி சிறந்த முறைகள்",
        "கரிம விவசாய முறைகள்",
      ],
      bn: [
        "আলুর লেট ব্লাইট কি?",
        "চাষের জন্য বর্তমান আবহাওয়া",
        "গমের মরিচা চিকিৎসার বিকল্প",
        "ধান চাষের সেরা পদ্ধতি",
        "জৈব চাষ কৌশল",
      ],
    }),
    [],
  );

  // Get safe suggested questions for current language
  const currentSuggestedQuestions =
    suggestedQuestions[selectedLanguage] || suggestedQuestions.en;

  // Safe clear chat handler
  const handleClearChat = useCallback(() => {
    if (typeof onClearChat === "function") {
      onClearChat();
    }
    setError(null);
  }, [onClearChat]);

  // Safe input change handler
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      // Prevent extremely long messages
      setInputMessage(value);
      setError(null);
    }
  }, []);

  // Render fallback for missing images
  const renderAnimatedIcon = (src, alt, fallbackIcon) => {
    return (
      <img
        src={src}
        alt={alt}
        className="w-5 h-5 sm:w-6 sm:h-6"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling?.style?.removeProperty("display");
        }}
      />
    );
  };

  return (
    <ChatErrorBoundary>
      <div className="flex flex-col h-screen max-h-[800px] w-full max-w-6xl mx-auto rounded-2xl shadow-2xl border border-green-200 overflow-hidden relative bg-cover bg-center">
        {/* Background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          // style={{ backgroundImage: `url(${bgGif})` }}
        >
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="relative z-20 bg-red-50 border-b border-red-200 p-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="relative z-20 bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="flex items-center justify-center space-x-2 text-yellow-800 text-sm">
              <WifiOff size={16} />
              <span>
                You are currently offline. Some features may be limited.
              </span>
            </div>
          </div>
        )}

        {/* Chat Header */}
        <div className="relative  bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-2xl shadow-lg">
                <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  कृषि सहायक | AgriConnect
                </h2>
                <p className="text-green-100 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  Multi-Language Agricultural Assistant
                  {isOnline && (
                    <Wifi size={12} className="text-green-300 ml-1" />
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Language Selector */}
              <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                  }
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 w-full sm:w-auto justify-between"
                  disabled={processing}
                >
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {getLanguageOption(selectedLanguage).flag}{" "}
                      {getLanguageOption(selectedLanguage).nativeName}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-green-200 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                    {Object.entries(languageOptions).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${
                          selectedLanguage === code
                            ? "bg-green-100 text-green-800"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {lang.nativeName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {lang.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleClearChat}
                disabled={processing || messages.length === 0}
                className="p-2 sm:p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl group flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md shadow-lg border border-green-200">
                <Bot className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Welcome to AgriConnect! 🌱
                </h3>
                <p className="text-gray-600 mb-4">
                  Ask me anything about agriculture in your preferred language.
                  I'll understand and respond in{" "}
                  {getLanguageOption(selectedLanguage).nativeName}.
                </p>
                <div className="text-sm text-green-600 font-medium">
                  Currently selected: {getLanguageOption(selectedLanguage).flag}{" "}
                  {getLanguageOption(selectedLanguage).nativeName}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id || Math.random()}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[80%] group ${message.sender === "user" ? "ml-auto" : ""}`}
                >
                  <MessageBubble
                    message={message}
                    language={selectedLanguage}
                    isUser={message.sender === "user"}
                  />

                  {/* Message Actions for Bot Messages */}
                  {message.sender === "bot" && speechSupport.synthesis && (
                    <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1 bg-white/90 rounded-lg p-1 shadow-lg border">
                      {currentSpeech === message.text ? (
                        <>
                          <button
                            onClick={
                              isPlaying ? handlePauseSpeech : handleResumeSpeech
                            }
                            className="p-1.5 text-green-600 hover:text-green-800 transition-colors rounded hover:bg-green-50"
                            title={isPlaying ? "Pause" : "Resume"}
                          >
                            {isPlaying ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                          </button>
                          <div className="w-6 h-6 flex items-center justify-center">
                            {renderAnimatedIcon(
                              speakingGif,
                              "Speaking",
                              <Volume2 size={14} />,
                            )}
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleSpeak(
                              message.text,
                              getLanguageOption(selectedLanguage)?.voice,
                            )
                          }
                          className="p-1.5 text-green-600 hover:text-green-800 transition-colors rounded hover:bg-green-50"
                          title="Read aloud"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {(isLoading || processing) && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl rounded-tl-none px-4 sm:px-6 py-3 sm:py-4 max-w-[80%] shadow-lg border border-green-200">
                <div className="flex items-center space-x-3 text-green-700">
                  <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {processing
                        ? `Processing in ${getLanguageOption(selectedLanguage).nativeName}...`
                        : "Analyzing your query..."}
                    </span>
                    <span className="text-xs text-green-600">
                      {selectedLanguage !== "en"
                        ? "Communicating with agricultural database..."
                        : "Accessing farming knowledge base..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && currentSuggestedQuestions.length > 0 && (
          <div className="relative z-10 px-4 sm:px-6 py-3 bg-gradient-to-t from-white/95 via-white/90 to-transparent border-t border-green-200/50">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs mr-2">
                Try asking
              </span>
              in {getLanguageOption(selectedLanguage).nativeName}:
            </p>
            <div className="flex flex-wrap gap-2">
              {currentSuggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(q)}
                  disabled={processing}
                  className="text-xs sm:text-sm bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 sm:px-4 py-2 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-200/50 shadow-sm hover:shadow-md hover:scale-105 transform cursor-pointer flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    fontFamily:
                      selectedLanguage !== "en"
                        ? "'Noto Sans', sans-serif"
                        : "inherit",
                  }}
                >
                  <User size={12} />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-white via-white to-white/95 border-t border-green-200/50 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-end">
            {/* Voice input button */}
            {speechSupport.recognition && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={processing || !isOnline}
                className={`p-3 sm:p-4 rounded-2xl border-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  listening
                    ? "bg-red-50 border-red-400 text-red-600 animate-pulse shadow-red-200"
                    : "bg-white border-green-300 text-green-600 hover:shadow-xl hover:border-green-400"
                }`}
                title={`Speak in ${getLanguageOption(selectedLanguage).nativeName}`}
              >
                <div className="flex flex-col items-center">
                  {listening ? (
                    renderAnimatedIcon(
                      listeningGif,
                      "Listening",
                      <Mic className="h-5 w-5 sm:h-6 sm:w-6" />,
                    )
                  ) : (
                    <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                  <span className="text-xs mt-1">
                    {getLanguageOption(selectedLanguage).flag}
                  </span>
                </div>
              </button>
            )}

            <div className="flex-1 relative min-h-[60px]">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={`Ask anything about agriculture in ${getLanguageOption(selectedLanguage).nativeName}...`}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-500 resize-none min-h-[60px] max-h-[120px] custom-scrollbar text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || processing || !isOnline}
                rows="1"
                style={{
                  fontFamily:
                    selectedLanguage !== "en"
                      ? "'Noto Sans', sans-serif"
                      : "inherit",
                }}
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400 flex items-center space-x-1">
                <span>
                  {getLanguageOption(selectedLanguage).flag}{" "}
                  {getLanguageOption(selectedLanguage).nativeName}
                </span>
                {inputMessage.length > 0 && (
                  <span className="text-gray-300">
                    {inputMessage.length}/1000
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                !inputMessage.trim() || isLoading || processing || !isOnline
              }
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading || processing ? (
                <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="text-sm sm:text-base">Send</span>
            </button>
          </div>

          {/* Language indicator */}
          <div className="flex justify-center mt-3">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2">
              <Languages size={12} />
              <span>
                Communicating in{" "}
                {getLanguageOption(selectedLanguage).nativeName}
                {!speechSupport.recognition && " (Voice input unavailable)"}
                {!speechSupport.synthesis && " (Voice output unavailable)"}
              </span>
            </div>
          </div>
        </form>

        {/* Custom Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(34, 197, 94, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(34, 197, 94, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 197, 94, 0.5);
          }
        `}</style>
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatInterface;
