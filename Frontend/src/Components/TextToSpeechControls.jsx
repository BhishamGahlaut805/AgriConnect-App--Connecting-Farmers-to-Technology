import React, { useState, useEffect, useRef } from "react";
import {
  FiVolume2,
  FiVolume,
  FiVolumeX,
  FiPause,
  FiPlay,
  FiPause as FiStop,
  FiGlobe,
  FiAlignJustify as FiGauge,

} from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { translateText } from "../API/TranslateService";

const TextToSpeechControls = ({
  content,
  className = "",
  buttonClassName = "p-3 rounded-full text-white transition-all text-xl",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [translationError, setTranslationError] = useState(null);

  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const defaultVoice =
        availableVoices.find(
          (v) => v.lang === "hi-IN" && v.name.includes("Swara")
        ) || availableVoices.find((v) => v.lang === "en-US");

      if (defaultVoice) utteranceRef.current = defaultVoice;
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);


const speak = async () => {
  if (!content) return;

  window.speechSynthesis.cancel();

  let textToSpeak = content;

  if (selectedLanguage === "hi-IN") {
    try {
      setIsTranslating(true);
      setTranslationError(null);

      if (!translatedContent) {
        const translated = await translateText(content, "hi");
        setTranslatedContent(translated);
        textToSpeak = translated;
      } else {
        textToSpeak = translatedContent;
      }
    } catch (err) {
      console.error("Translation failed:", err.message);
      setTranslationError("Translation failed. Speaking original text.");
    } finally {
      setIsTranslating(false);
    }
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.volume = volume;
  utterance.rate = rate;
  utterance.pitch = 1;

  if (utteranceRef.current) {
    utterance.voice = utteranceRef.current;
    utterance.lang = utteranceRef.current.lang;
  }

  utterance.onstart = () => {
    setIsSpeaking(true);
    setIsPaused(false);
  };

  utterance.onend = () => {
    setIsSpeaking(false);
    setIsPaused(false);
  };

  utterance.onerror = (event) => {
    console.error("Speech error:", event);
    setIsSpeaking(false);
    setIsPaused(false);
  };

  window.speechSynthesis.speak(utterance);
};


  const togglePlayPause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speak();
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const toggleLanguage = async () => {
    const newLang = selectedLanguage === "en-US" ? "hi-IN" : "en-US";
    setSelectedLanguage(newLang);

    if (newLang === "en-US") {
      setTranslatedContent("");
    }

    if (isSpeaking || isPaused) {
      stop();
      await speak();
    }
  };

  if (!("speechSynthesis" in window)) {
    return (
      <div className="text-red-500 text-sm p-3 rounded-md bg-red-100 dark:bg-red-900/50">
        Text-to-speech is not supported in your browser.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiVolume2 className="text-blue-500" />
            <span>Voice Assistant</span>
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                selectedLanguage === "hi-IN"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {selectedLanguage === "hi-IN" ? "Hindi" : "English"}
            </span>
          </div>
        </div>

        {translationError && (
          <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm">
            {translationError}
          </div>
        )}

        {/* Main Controls */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            {/* Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayPause}
              disabled={isTranslating}
              className={`${buttonClassName} ${
                isSpeaking && !isPaused
                  ? "bg-red-500 hover:bg-red-600"
                  : isPaused
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-500 hover:bg-green-600"
              } shadow-md ${
                isTranslating ? "opacity-70 cursor-not-allowed" : ""
              }`}
              data-tip={isSpeaking && !isPaused ? "Pause" : "Play"}
            >
              {isTranslating ? (
                <span className="animate-pulse">...</span>
              ) : isSpeaking && !isPaused ? (
                <FiPause />
              ) : (
                <FiPlay />
              )}
            </motion.button>

            {/* Stop Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stop}
              disabled={!isSpeaking && !isPaused}
              className={`${buttonClassName} bg-gray-500 hover:bg-gray-600 shadow-md ${
                !isSpeaking && !isPaused ? "opacity-50 cursor-not-allowed" : ""
              }`}
              data-tip="Stop"
            >
              <FiStop />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Volume
              </span>
              <div className="flex items-center gap-2">
                <FiVolumeX className="text-gray-500" />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(volume * 100)}%
                </span>
                <FiVolume2 className="text-gray-500" />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={isTranslating}
            />
          </div>

          {/* Speed Control */}
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Speed
              </span>
              <div className="flex items-center gap-2">
                <FiGauge className="text-gray-500" />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {rate.toFixed(1)}x
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRate(Math.max(0.5, rate - 0.1))}
                disabled={rate <= 0.5 || isTranslating}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full disabled:opacity-50"
                data-tip="Decrease speed"
              >
                -
              </button>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${((rate - 0.5) / 1.5) * 100}%` }}
                ></div>
              </div>
              <button
                onClick={() => setRate(Math.min(2, rate + 0.1))}
                disabled={rate >= 2 || isTranslating}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full disabled:opacity-50"
                data-tip="Increase speed"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleLanguage}
            disabled={isTranslating}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
              selectedLanguage === "hi-IN"
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } ${isTranslating ? "opacity-70 cursor-not-allowed" : ""}`}
            data-tip="Toggle between English and Hindi"
          >
            <FiGlobe />
            {isTranslating ? (
              <span>Translating...</span>
            ) : selectedLanguage === "hi-IN" ? (
              <span>Switch to English</span>
            ) : (
              <span>Switch to Hindi</span>
            )}
          </motion.button>
        </div>

        {/* Status Indicator */}
        {(isSpeaking || isPaused) && (
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <div
                className={`w-3 h-3 rounded-full ${
                  isSpeaking && !isPaused
                    ? "bg-green-500 animate-pulse"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isSpeaking && !isPaused ? "Speaking" : "Paused"}
              </span>
            </div>
          </div>
        )}
      </div>

      <Tooltip
        effect="solid"
        place="top"
        className="!bg-gray-800 !text-xs !py-1 !px-2"
      />
    </motion.div>
  );
};

export default TextToSpeechControls;
