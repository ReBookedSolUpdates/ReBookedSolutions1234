import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ChatContextMessage, ChatSubmitRequest, ChatSubmitResponse, ChatHistoryResponse } from "@/types/chatbot";
import { chatStorage } from "@/utils/chatStorage";
import { callEdgeFunction } from "@/utils/edgeFunctionClient";
import debugLogger from "@/utils/debugLogger";
import { supabase } from "@/lib/supabase";

export const useChatbot = (userId: string | null | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dataRef = useRef(chatStorage.getOrCreateData());

  // Fetch chat history from database for logged-in users
  const loadChatHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) return;

      const response = await callEdgeFunction<ChatHistoryResponse>("chat-history", {
        method: "POST",
        body: { user_id: userId, limit: 50 },
        headers: {
          "Authorization": `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.success) {
        debugLogger.warn("useChatbot", "Failed to fetch chat history:", response.error);
        return;
      }

      const historyData = response.data;
      if (!historyData?.messages || historyData.messages.length === 0) return;

      // Convert history messages to ChatMessage format
      const historyMessages: ChatMessage[] = historyData.messages.flatMap((msg) => [
        {
          id: `${msg.id}_user`,
          role: "user" as const,
          content: msg.user_message,
          timestamp: msg.timestamp,
          storedAt: msg.timestamp,
        },
        {
          id: `${msg.id}_bot`,
          role: "assistant" as const,
          content: msg.bot_response,
          timestamp: msg.timestamp,
          storedAt: msg.timestamp,
        },
      ]);

      // Load into local storage and display
      historyMessages.forEach((msg) => {
        chatStorage.addMessage(msg, dataRef.current);
      });

      // Update conversation context with history
      const contextMessages = historyMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      chatStorage.setCurrentConversation(contextMessages, dataRef.current);

      setMessages((prev) => {
        // Combine existing messages with history, avoiding duplicates
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = historyMessages.filter((msg) => !existingIds.has(msg.id));
        return [...newMessages, ...prev];
      });

      debugLogger.info("useChatbot", `Loaded ${historyMessages.length} messages from chat history`);
    } catch (err) {
      debugLogger.warn("useChatbot", "Error loading chat history:", err);
      // Don't throw - this is optional functionality
    }
  }, [userId]);

  // Initialize messages from storage on mount and load history for logged-in users
  useEffect(() => {
    const storedMessages = chatStorage.getMessages(dataRef.current);
    setMessages(storedMessages);

    // Load chat history if user is logged in
    if (userId) {
      loadChatHistory();
    }
  }, [userId, loadChatHistory]);

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
        const response = await callEdgeFunction<ChatSubmitResponse>("chat-submit", {
          method: "POST",
          body: request,
        });

        // Check wrapper-level success first
        if (!response.success) {
          const errorMsg = response.error || "Failed to connect to chatbot service";
          debugLogger.error("useChatbot", "Edge Function error:", {
            error: response.error,
            details: response.details,
          });
          throw new Error(errorMsg);
        }

        // Extract the actual ChatSubmitResponse from wrapper
        const data = response.data;

        if (!data) {
          throw new Error("No response received from chatbot service");
        }

        // Check chatbot-level success
        if (!data.success) {
          setError(`This message was flagged for safety reasons: ${data.flag_reason || "Content policy violation"}`);
          setIsLoading(false);
          return;
        }

        // If response was flagged, notify user
        if (data.is_flagged) {
          setError(`This message was flagged for safety reasons: ${data.flag_reason || "Content policy violation"}`);
        }

        // Add bot message to UI
        const botChatMessage: ChatMessage = {
          id: data.message_id,
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
        debugLogger.error("useChatbot", "Chatbot error:", err);
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
