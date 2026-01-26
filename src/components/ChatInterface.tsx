import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { AlertCircle, Loader2, Send, Trash2, MessageSquare } from "lucide-react";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  onClearError: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearHistory,
  onClearError,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-book-600 via-book-700 to-book-800 text-white px-4 py-3 sm:p-4 border-b border-book-700">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare size={20} className="flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-bold truncate">ReBooked Assistant</h2>
          </div>
          <button
            onClick={onClearHistory}
            className="p-2 hover:bg-book-500 rounded-lg transition-colors flex-shrink-0 hover:shadow-md"
            title="Clear chat history"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <p className="text-xs sm:text-xs text-book-100 mt-1.5 font-medium opacity-90">
          Your smart guide to buying and selling textbooks
        </p>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-book-100 flex items-center justify-center mb-3 sm:mb-4">
              <MessageSquare size={24} className="sm:w-8 sm:h-8 text-book-600" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">No messages yet</p>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xs">
              Ask me anything about buying textbooks, selling your books, delivery, pricing, or anything ReBooked!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] sm:max-w-sm px-4 py-2.5 rounded-2xl ${
                  message.role === "user"
                    ? "bg-book-600 text-white rounded-br-sm shadow-md"
                    : "bg-white text-gray-900 rounded-bl-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                }`}
              >
                <div className="break-words">
                  {message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p className="text-sm sm:text-sm leading-relaxed break-words">{message.content}</p>
                  )}
                </div>
                <p
                  className={`text-xs mt-1.5 ${
                    message.role === "user" ? "text-book-100/80" : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white text-gray-900 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-book-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2 h-2 bg-book-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-book-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span className="text-xs text-gray-600 ml-1">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] sm:max-w-sm shadow-sm">
              <div className="flex gap-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold mb-1">Something went wrong</p>
                  <p className="text-xs text-red-800 break-words mb-2">{error}</p>
                  <button
                    onClick={onClearError}
                    className="text-xs font-medium text-red-700 hover:text-red-900 underline underline-offset-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm h-10 sm:h-11 rounded-full border-gray-300 placeholder:text-gray-500 focus:border-book-500 focus:ring-book-500"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-book-600 hover:bg-book-700 disabled:bg-gray-300 text-white px-4 h-10 sm:h-11 rounded-full transition-all active:scale-95 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Send size={16} />
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">Messages saved locally for 30 days</p>
      </div>
    </div>
  );
};
