import React, { useState, useEffect, useRef } from "react";

const SpeechToText = ({
  onResult,
  language = "en-US",
  onError,
  onStart,
  onStop,
  className = "",
  buttonClassName = "",
  activeButtonClassName = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      onError?.(
        "Your browser does not support speech recognition. Try Chrome."
      );
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      onStart?.();
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setTranscript(transcript);
      onResult?.(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      onError?.(`Speech recognition failed: ${event.error}`);
      stopListening();
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      onStop?.();
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onError, onResult, onStart, onStop]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-full focus:outline-none transition-all ${
          isListening
            ? `bg-red-500 text-white ${activeButtonClassName}`
            : `bg-blue-500 text-white ${buttonClassName}`
        }`}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isListening ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>
      {transcript && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {transcript}
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
