// src/components/MessageBubble.jsx
import React from 'react';
import { Bot, User, AlertCircle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";
  const isError = message.type === "error";
  const isWelcome = message.type === "welcome";

  const getIcon = () => {
    if (isUser) return <User className="h-5 w-5" />;
    if (isError) return <AlertCircle className="h-5 w-5" />;
    if (isWelcome) return <CheckCircle className="h-5 w-5" />;
    return <Bot className="h-5 w-5" />;
  };

  const getBubbleStyles = () => {
    if (isUser) {
      return "bg-blue-500 text-white rounded-2xl rounded-br-none";
    }
    if (isError) {
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-2xl rounded-tl-none border border-red-200 dark:border-red-700";
    }
    if (isWelcome) {
      return "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-gray-800 dark:text-white rounded-2xl rounded-tl-none border border-green-200 dark:border-green-700";
    }
    return "bg-green-100 dark:bg-green-900 text-gray-800 dark:text-white rounded-2xl rounded-tl-none";
  };

  const getIconStyles = () => {
    if (isUser) return "bg-blue-600 text-white";
    if (isError) return "bg-red-500 text-white";
    if (isWelcome)
      return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
    return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
  };

  return (
    <div
      className={`flex items-start space-x-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconStyles()} shadow-lg`}
        >
          {getIcon()}
        </div>
      )}

      <div className={`max-w-[80%] ${getBubbleStyles()} shadow-sm`}>
        <div className="px-4 py-3">
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          ) : (
            <div className="text-sm prose prose-green dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // src/components/MessageBubble.jsx (continued)
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mb-2 text-green-800 dark:text-green-300">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-md font-semibold mb-2 text-green-700 dark:text-green-400">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1 text-green-600 dark:text-green-500">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-green-700 dark:text-green-400">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700 dark:text-gray-300">
                      {children}
                    </em>
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconStyles()} shadow-lg`}
        >
          {getIcon()}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;