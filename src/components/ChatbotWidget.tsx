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
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 ${
          chatbot.isOpen ? "scale-90 opacity-75" : "scale-100 opacity-100 hover:scale-110"
        }`}
        title="Open chat assistant"
        aria-label="Open chat assistant"
      >
        {chatbot.isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Modal */}
      {chatbot.isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-200px)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4">
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
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={chatbot.close}
          aria-hidden="true"
        />
      )}
    </>
  );
};
