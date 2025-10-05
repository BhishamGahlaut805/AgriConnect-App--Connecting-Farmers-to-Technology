// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Bot, User, Loader } from "lucide-react";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "./LoadingSpinner";

const ChatInterface = ({ messages, isLoading, onSendMessage, onClearChat }) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const suggestedQuestions = [
    "What is late blight of potato?",
    "Current weather for farming?",
    "Latest agricultural news",
    "Wheat rust treatment options",
    "Rice cultivation best practices",
  ];

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 overflow-hidden transition-all duration-300">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AgriConnect Assistant</h2>
              <p className="text-green-100 text-sm">Your 24/7 Farming Expert</p>
            </div>
          </div>
          <button
            onClick={onClearChat}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            title="Clear chat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-green-100 dark:bg-green-900 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing your farming query...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-green-100 dark:border-green-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(question)}
                className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 border border-green-200 dark:border-green-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white dark:bg-gray-800 border-t border-green-100 dark:border-green-900"
      >
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about crops, weather, diseases, or farming techniques..."
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
