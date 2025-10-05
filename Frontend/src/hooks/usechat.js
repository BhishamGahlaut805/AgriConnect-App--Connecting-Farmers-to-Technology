// src/hooks/useChat.js
import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../API/chatService";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "🌾 Welcome to AgriConnect! I'm your agricultural assistant. How can I help with your farming questions today?",
        sender: "bot",
        timestamp: new Date().toISOString(),
        type: "welcome",
      },
    ]);
  }, []);

  const sendMessageToBot = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(messageText);

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data,
          sender: "bot",
          timestamp: response.timestamp,
          type: "response",
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setError(response.error);
        const errorMessage = {
          id: Date.now() + 1,
          text: `⚠️ ${response.error}`,
          sender: "bot",
          timestamp: new Date().toISOString(),
          type: "error",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMsg =
        "Sorry, I'm having trouble connecting. Please check your internet and try again.";
      setError(errorMsg);
      const errorMessage = {
        id: Date.now() + 1,
        text: `⚠️ ${errorMsg}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
        type: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "🌾 Chat cleared! How can I help with your farming questions?",
        sender: "bot",
        timestamp: new Date().toISOString(),
        type: "welcome",
      },
    ]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageToBot,
    clearChat,
  };
};
