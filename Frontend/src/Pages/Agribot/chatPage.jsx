// src/pages/ChatPage.jsx
import React from "react";
import ChatInterface from "../../NewComponents/chatInterface";
import { useChat } from "../../hooks/usechat";

const ChatPage = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  return (
    <div className="mt-20 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          AgriConnect{" "}
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Chat Assistant
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Ask me anything about farming, crops, weather, or agricultural
          practices
        </p>
      </div>

      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
