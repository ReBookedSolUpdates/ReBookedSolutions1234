import React, { useEffect } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { ChatInterface } from "./ChatInterface";
import { MessageCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const ChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const chatbot = useChatbot(user?.id);

  // Handle ESC key to close widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && chatbot.isOpen) {
        chatbot.close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatbot.isOpen, chatbot.close]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={chatbot.toggleOpen}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-book-600 hover:bg-book-700 text-white shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center z-40 ${
          chatbot.isOpen ? "scale-75 opacity-60" : "scale-100 opacity-100 hover:scale-125 active:scale-95"
        }`}
        title="Open ReBooked Assistant"
        aria-label="Open ReBooked Assistant"
      >
        {chatbot.isOpen ? (
          <X size={20} className="sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle size={20} className="sm:w-6 sm:h-6" />
        )}
      </button>

      {/* Chat Modal */}
      {chatbot.isOpen && (
        <div className="fixed bottom-20 right-4 left-4 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 h-[70vh] sm:h-[600px] max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-200px)] bg-white rounded-xl sm:rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-2 duration-300">
          <ChatInterface
            messages={chatbot.messages}
            isLoading={chatbot.isLoading}
            error={chatbot.error}
            onSendMessage={chatbot.sendMessage}
            onClearHistory={chatbot.clearHistory}
            onClearError={chatbot.clearError}
          />
        </div>
      )}

      {/* Background overlay for mobile */}
      {chatbot.isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 sm:hidden"
          onClick={chatbot.close}
          aria-hidden="true"
        />
      )}
    </>
  );
};
