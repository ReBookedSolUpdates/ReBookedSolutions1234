import React, { useEffect } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { ChatInterface } from "./ChatInterface";
import { MessageCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

export const ChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const chatbot = useChatbot(user?.id);

  // Hide chat widget on checkout and success pages
  const isCheckoutPage = pathname.includes("/checkout") || pathname.includes("/checkout-cart") || pathname.includes("/payment-confirmation") || pathname.includes("/order-success");

  // Handle ESC key to close widget
  useEffect(() => {
    // Only set up listener if widget is visible
    if (isCheckoutPage) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && chatbot.isOpen) {
        chatbot.close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatbot.isOpen, chatbot.close, isCheckoutPage]);

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
        <div className="fixed bottom-16 right-2 left-2 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 h-[50vh] sm:h-[630px] max-w-xs sm:max-w-none max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)] mx-auto sm:mx-0 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
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
