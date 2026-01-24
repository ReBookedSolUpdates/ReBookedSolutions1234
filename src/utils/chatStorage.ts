import { ChatMessage, ChatStorageData, ChatContextMessage } from "@/types/chatbot";

const STORAGE_KEY = "rebooked_chatbot_data";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const chatStorage = {
  // Initialize or get existing chat data
  getOrCreateData(): ChatStorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ChatStorageData;
        // Clean expired messages on load
        this.cleanExpiredMessages(data);
        return data;
      }
    } catch (error) {
      console.warn("Failed to load chat data from storage:", error);
    }

    // Create new data structure
    return this.createNewData();
  },

  // Create fresh chat data with new session ID
  createNewData(): ChatStorageData {
    return {
      chatbot_messages: [],
      session_id: this.generateSessionId(),
      last_cleared: new Date().toISOString(),
      current_conversation: [],
    };
  },

  // Generate a persistent session ID (UUID-like)
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Save data to storage
  save(data: ChatStorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save chat data to storage:", error);
    }
  },

  // Add a new message to storage
  addMessage(message: ChatMessage, data: ChatStorageData): void {
    data.chatbot_messages.push(message);
    this.save(data);
  },

  // Get all stored messages
  getMessages(data: ChatStorageData): ChatMessage[] {
    this.cleanExpiredMessages(data);
    return data.chatbot_messages;
  },

  // Clean expired messages (older than 30 days)
  cleanExpiredMessages(data: ChatStorageData): void {
    const now = new Date().getTime();
    const originalLength = data.chatbot_messages.length;

    data.chatbot_messages = data.chatbot_messages.filter((msg) => {
      const storedAt = new Date(msg.storedAt || msg.timestamp).getTime();
      const isExpired = now - storedAt > THIRTY_DAYS_MS;
      return !isExpired;
    });

    // If messages were cleaned, save the updated data
    if (data.chatbot_messages.length < originalLength) {
      this.save(data);

      // If all messages are gone, clear the entire history
      if (data.chatbot_messages.length === 0) {
        data.last_cleared = new Date().toISOString();
        this.save(data);
      }
    }
  },

  // Get session ID
  getSessionId(data: ChatStorageData): string {
    return data.session_id;
  },

  // Clear all messages
  clearMessages(data: ChatStorageData): void {
    data.chatbot_messages = [];
    data.last_cleared = new Date().toISOString();
    this.save(data);
  },

  // Get current conversation context (last N messages for API context)
  getConversationContext(data: ChatStorageData, maxMessages: number = 10): ChatContextMessage[] {
    const messages = this.getMessages(data);
    const recent = messages.slice(-maxMessages).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    return recent;
  },

  // Update current conversation in memory (for active session)
  setCurrentConversation(conversation: ChatContextMessage[], data: ChatStorageData): void {
    data.current_conversation = conversation;
    // Don't save current_conversation to storage, it's in-memory only
  },

  // Get current conversation
  getCurrentConversation(data: ChatStorageData): ChatContextMessage[] {
    return data.current_conversation || [];
  },

  // Clear current conversation (when widget closes or new session starts)
  clearCurrentConversation(data: ChatStorageData): void {
    data.current_conversation = [];
  },

  // Check if storage is available
  isAvailable(): boolean {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Delete all data (hard reset)
  deleteAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to delete chat data:", error);
    }
  },
};
