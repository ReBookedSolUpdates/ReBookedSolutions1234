import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ChatContextMessage, ChatSubmitRequest, ChatSubmitResponse } from "@/types/chatbot";
import { chatStorage } from "@/utils/chatStorage";
import { callEdgeFunction } from "@/utils/edgeFunctionClient";

export const useChatbot = (userId: string | null | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dataRef = useRef(chatStorage.getOrCreateData());

  // Initialize messages from storage on mount
  useEffect(() => {
    const storedMessages = chatStorage.getMessages(dataRef.current);
    setMessages(storedMessages);
  }, []);

  // Send message to chatbot
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setError(null);

      // Add user message to UI immediately
      const userMsgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userChatMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
        storedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userChatMessage]);
      chatStorage.addMessage(userChatMessage, dataRef.current);

      // Update current conversation with user message
      const currentConversation = chatStorage.getCurrentConversation(dataRef.current);
      currentConversation.push({ role: "user", content: userMessage });
      chatStorage.setCurrentConversation(currentConversation, dataRef.current);

      setIsLoading(true);

      try {
        // Prepare request
        const contextMessages = chatStorage.getConversationContext(dataRef.current, 10);
        const currentPageUrl = window.location.pathname || "/";
        const isLoggedIn = !!userId;

        const request: ChatSubmitRequest = {
          message: userMessage,
          conversation_history: contextMessages,
          session_id: chatStorage.getSessionId(dataRef.current),
          page_url: currentPageUrl,
          is_logged_in: isLoggedIn,
          user_id: userId || null,
        };

        // Call Edge Function
        const response = await callEdgeFunction("chat-submit", {
          method: "POST",
          body: request,
        });

        const data = response as ChatSubmitResponse;

        if (!data.success) {
          throw new Error(data.flag_reason || "Failed to get response from chatbot");
        }

        // If response was flagged, notify user
        if (data.is_flagged) {
          setError(`This message was flagged for safety reasons: ${data.flag_reason || "Content policy violation"}`);
        }

        // Add bot message to UI
        const botMsgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const botChatMessage: ChatMessage = {
          id: botMsgId || data.message_id,
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
          storedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botChatMessage]);
        chatStorage.addMessage(botChatMessage, dataRef.current);

        // Update current conversation with bot response
        const updatedConversation = chatStorage.getCurrentConversation(dataRef.current);
        updatedConversation.push({ role: "assistant", content: data.response });
        chatStorage.setCurrentConversation(updatedConversation, dataRef.current);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send message. Please try again.";
        setError(errorMessage);
        console.error("Chatbot error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  // Toggle widget visibility
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      // Clear current conversation when closing the widget
      if (!newState) {
        chatStorage.clearCurrentConversation(dataRef.current);
      }
      return newState;
    });
  }, []);

  // Close widget
  const close = useCallback(() => {
    setIsOpen(false);
    chatStorage.clearCurrentConversation(dataRef.current);
  }, []);

  // Open widget
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Clear chat history
  const clearHistory = useCallback(() => {
    chatStorage.clearMessages(dataRef.current);
    setMessages([]);
    chatStorage.clearCurrentConversation(dataRef.current);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isOpen,
    sendMessage,
    toggleOpen,
    close,
    open,
    clearHistory,
    clearError,
  };
};
