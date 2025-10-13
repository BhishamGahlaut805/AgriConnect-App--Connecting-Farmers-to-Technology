// src/pages/ChatPage.jsx
import React from "react";
import ChatInterface from "../../NewComponents/chatInterface";
import { useChat } from "../../hooks/usechat";
import farmBg from "../../assets/images/bg1.png";
import farmerGif from "../../assets/images/farmer.gif";
import cropGif from "../../assets/images/camping.gif";
import cloudGif from "../../assets/images/cloudy.gif";
import ChatHeader from "../../NewComponents/ChatHeader";
import CropHeader2 from "./ChaHeader2";

const ChatPage = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  return (
    <div className="min-h-screen mt-20 flex flex-col md:flex-row bg-gradient-to-r from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* LEFT SECTION */}
      <div
        className="w-full md:w-1/2 relative flex flex-col justify-center items-center text-center p-6 md:p-10
        bg-cover bg-center"
        // style={{ backgroundImage: `url(${farmBg})` }}
      >
        <CropHeader2 />
        {/* <div className="absolute inset-0 bg-white/70 dark:bg-black/50"></div> */}

        {/* <div className="relative z-10 flex flex-col items-center space-y-6 max-w-md mx-auto"> */}
        <ChatHeader />
        {/* </div> */}
      </div>

      {/* RIGHT SECTION */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-center
  bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl
  px-4 sm:px-6 md:px-10 py-6 md:py-8 overflow-hidden h-full"
      >
        <div className="w-full max-w-3xl flex flex-col h-full">
          {/* Header */}
          <div className="text-center mb-4 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Chat with{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                AgriConnect
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
              Ask about crops, weather, diseases, fertilizers, and more
            </p>
          </div>

          {/* Chat Container */}
          <div
            className="flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner
            bg-white/80 dark:bg-gray-800/70 p-4 sm:p-6 mb-4 md:mb-6"
          >
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onClearChat={clearChat}
            />
          </div>
          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-center text-sm sm:text-base">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
