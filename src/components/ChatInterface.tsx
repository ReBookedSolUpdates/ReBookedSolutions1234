import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Send, Trash2 } from "lucide-react";

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-book-600 to-book-700 text-white p-2 sm:p-4 rounded-t-xl sm:rounded-t-lg">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-lg font-semibold truncate">ReBooked Assistant</h2>
          <button
            onClick={onClearHistory}
            className="p-1 hover:bg-book-500 rounded transition-colors flex-shrink-0"
            title="Clear chat history"
          >
            <Trash2 size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <p className="text-xs text-book-100 mt-1 leading-tight">Ask anything about buying, selling, or ReBooked</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-6 sm:mt-8">
            <p className="text-sm font-medium">Hello! I'm here to help.</p>
            <p className="text-xs mt-2 text-gray-600">Ask me anything about buying, selling, or ReBooked.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-book-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200"
                }`}
              >
                <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-book-100" : "text-gray-500"
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
          <div className="flex justify-start">
            <div className="bg-book-50 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none border border-book-200">
              <div className="flex items-center gap-1">
                <Loader2 size={16} className="animate-spin text-book-600" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg rounded-bl-none max-w-xs lg:max-w-md">
              <div className="flex gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-xs mt-1">{error}</p>
                  <button
                    onClick={onClearError}
                    className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
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
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 rounded-b-xl sm:rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-book-600 hover:bg-book-700 text-white px-3 sm:px-4 py-2 transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send size={16} className="sm:w-5 sm:h-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Saved locally for 30 days</p>
      </div>
    </div>
  );
};
