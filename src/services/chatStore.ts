import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatStore, ChatMessage, ChatThread } from "@/utils/types/chat.types";
import { databaseService } from "@/utils/appwrite/database";
import { storageService } from "@/utils/appwrite/storage";
import { useAuthStore } from "./authStore";
import { DEFAULT_MODELS } from "@/utils/aiModels/modelConfig"
import { Models } from "appwrite";

// Type helpers for Appwrite documents
type ThreadDocument = Models.Document & {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "active" | "resolved" | "escalated" | "closed";
  tags?: string[];
  messageCount?: number;
  lastMessageAt?: string;
};

type MessageDocument = Models.Document & {
  threadId: string;
  userId: string;
  content: string;
  role: "user" | "assistant" | "system";
  contentType: "text" | "image" | "voice" | "file";
  attachment?: string;
};

// Cache management utilities for chat data
const THREADS_CACHE_KEY = "dko-threads-cache";
const MESSAGES_CACHE_KEY = "dko-messages-cache";
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

const setThreadsCache = (threads: ChatThread[], userId: string) => {
  if (typeof window !== 'undefined') {
    const cacheData = {
      threads,
      userId,
      timestamp: Date.now(),
    };
    localStorage.setItem(THREADS_CACHE_KEY, JSON.stringify(cacheData));
  }
};

const getThreadsFromCache = (userId: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheData = localStorage.getItem(THREADS_CACHE_KEY);
    if (!cacheData) return null;

    const { threads, userId: cachedUserId, timestamp } = JSON.parse(cacheData);
    
    // Check if cache is still valid and matches current user
    if (Date.now() - timestamp > CACHE_EXPIRY || cachedUserId !== userId) {
      localStorage.removeItem(THREADS_CACHE_KEY);
      return null;
    }

    return threads;
  } catch (error) {
    console.error("Error reading threads cache:", error);
    localStorage.removeItem(THREADS_CACHE_KEY);
    return null;
  }
};

const setMessagesCache = (messages: ChatMessage[], threadId: string) => {
  if (typeof window !== 'undefined') {
    const cacheData = {
      messages,
      threadId,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${MESSAGES_CACHE_KEY}-${threadId}`, JSON.stringify(cacheData));
  }
};

const getMessagesFromCache = (threadId: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheData = localStorage.getItem(`${MESSAGES_CACHE_KEY}-${threadId}`);
    if (!cacheData) return null;

    const { messages, timestamp } = JSON.parse(cacheData);
    
    // Check if cache is still valid (15 minutes for messages)
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      localStorage.removeItem(`${MESSAGES_CACHE_KEY}-${threadId}`);
      return null;
    }

    return messages;
  } catch (error) {
    console.error("Error reading messages cache:", error);
    localStorage.removeItem(`${MESSAGES_CACHE_KEY}-${threadId}`);
    return null;
  }
};

const clearChatCache = () => {
  if (typeof window !== 'undefined') {
    // Clear threads cache
    localStorage.removeItem(THREADS_CACHE_KEY);
    
    // Clear all message caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(MESSAGES_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentThread: null,
      threads: [],
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      selectedModel: DEFAULT_MODELS.GENERAL_CHAT,

  // Thread actions
  createThread: async (title: string = "New Chat", description?: string) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("User not authenticated");

    // Create optimistic thread immediately for instant UI
    const tempThread: ChatThread = {
      $id: `temp-thread-${Date.now()}`,
      userId: user.$id,
      title,
      description: description || "",
      category: "general",
      priority: "medium" as const,
      status: "active" as const,
      tags: [],
      messageCount: 0,
      lastMessageAt: new Date().toISOString(),
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };

    // Add thread immediately to UI
    set((state) => ({
      threads: [tempThread, ...state.threads],
      currentThread: tempThread,
      messages: [],
      error: null,
    }));

    try {
      // Save to database in background
      const threadData = {
        userId: user.$id,
        title,
        description: description || "",
        category: "general",
        priority: "medium" as const,
        status: "active" as const,
        tags: [],
      };

      const thread = (await databaseService.createThread(threadData)) as ThreadDocument;
      
      // Update with real thread data
      const realThread: ChatThread = {
        $id: thread.$id,
        userId: thread.userId,
        title: thread.title,
        description: thread.description,
        category: thread.category,
        priority: thread.priority,
        status: thread.status,
        tags: thread.tags,
        messageCount: thread.messageCount,
        lastMessageAt: thread.lastMessageAt,
        $createdAt: thread.$createdAt,
        $updatedAt: thread.$updatedAt,
      };

      // Replace temp thread with real thread
      set((state) => ({
        threads: state.threads.map(t => 
          t.$id === tempThread.$id ? realThread : t
        ),
        currentThread: state.currentThread?.$id === tempThread.$id ? realThread : state.currentThread,
      }));

      // Update cache
      const updatedThreads = get().threads;
      setThreadsCache(updatedThreads, user.$id);

      return realThread;
    } catch (error: any) {
      // Remove temp thread on error
      set((state) => ({
        threads: state.threads.filter(t => t.$id !== tempThread.$id),
        currentThread: state.currentThread?.$id === tempThread.$id ? null : state.currentThread,
        error: error.message,
      }));
      throw error;
    }
  },

  selectThread: async (threadId: string, useCache = true) => {
    // Cancel any previous thread selection to prevent race conditions
    const currentState = get();

    // If already on this thread, don't do anything
    if (currentState.currentThread?.$id === threadId && currentState.messages.length > 0) {
      return;
    }

    // Immediately clear state if switching to a different thread
    if (currentState.currentThread?.$id !== threadId) {
      set({
        currentThread: null,
        messages: [],
        isLoading: true,
        error: null,
      });
    }

    // Check if this is a temporary thread (not yet saved to DB)
    const targetThread = get().threads.find(t => t.$id === threadId);
    if (threadId.startsWith('temp-thread-')) {
      // For temp threads, just set as current with empty messages
      if (targetThread) {
        set({
          currentThread: targetThread,
          messages: [],
          isLoading: false,
          error: null,
        });
      }
      return;
    }

    // Try to load messages from cache first for instant display
    if (useCache) {
      const cachedMessages = getMessagesFromCache(threadId);
      if (cachedMessages && targetThread) {
        set({
          currentThread: targetThread,
          messages: cachedMessages,
          isLoading: false,
        });
        // Don't return - continue to fetch fresh data
      }
    }

    // Set loading state if not using cache
    if (!useCache && !get().currentThread) {
      set({ isLoading: true, error: null });
    }

    try {
      const thread = (await databaseService.getThread(threadId)) as ThreadDocument;
      const messages = await databaseService.getThreadMessages(threadId);

      // Check if user switched to a different thread while we were loading
      const finalState = get();
      if (finalState.currentThread?.$id && finalState.currentThread.$id !== threadId) {
        // User switched threads, ignore this result
        return;
      }

      const chatThread: ChatThread = {
        $id: thread.$id,
        userId: thread.userId,
        title: thread.title,
        description: thread.description,
        category: thread.category,
        priority: thread.priority,
        status: thread.status,
        tags: thread.tags,
        messageCount: thread.messageCount,
        lastMessageAt: thread.lastMessageAt,
        $createdAt: thread.$createdAt,
        $updatedAt: thread.$updatedAt,
      };

      const chatMessages: ChatMessage[] = messages.documents.map((msg) => {
        const messageDoc = msg as MessageDocument;
        return {
          $id: messageDoc.$id,
          threadId: messageDoc.threadId,
          userId: messageDoc.userId,
          content: messageDoc.content,
          role: messageDoc.role,
          contentType: messageDoc.contentType,
          attachment: messageDoc.attachment,
          $createdAt: messageDoc.$createdAt,
          $updatedAt: messageDoc.$updatedAt,
        };
      });

      // Always update cache with fresh messages
      setMessagesCache(chatMessages, threadId);

      // Final check before setting state
      const veryFinalState = get();
      if (!veryFinalState.currentThread || veryFinalState.currentThread.$id === threadId) {
        set({
          currentThread: chatThread,
          messages: chatMessages,
          isLoading: false,
        });
      }
    } catch (error: any) {
      // Only set error if we're still on the same thread
      const errorState = get();
      if (!errorState.currentThread || errorState.currentThread.$id === threadId) {
        const currentMessages = errorState.messages;
        if (currentMessages.length === 0) {
          set({ error: error.message, isLoading: false });
        } else {
          set({ isLoading: false }); // Keep cached data, just stop loading
        }
      }
      throw error;
    }
  },

  updateThread: async (threadId: string, updates: Partial<ChatThread>) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.updateThread(threadId, updates);

      set((state) => ({
        threads: state.threads.map((thread) =>
          thread.$id === threadId ? { ...thread, ...updates } : thread
        ),
        currentThread:
          state.currentThread?.$id === threadId
            ? { ...state.currentThread, ...updates }
            : state.currentThread,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteThread: async (threadId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Note: Implement delete functionality in database service
      // await databaseService.deleteThread(threadId);

      set((state) => ({
        threads: state.threads.filter((thread) => thread.$id !== threadId),
        currentThread:
          state.currentThread?.$id === threadId ? null : state.currentThread,
        messages: state.currentThread?.$id === threadId ? [] : state.messages,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadThreads: async (useCache = true) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // Try to load from cache first for instant display
    if (useCache) {
      const cachedThreads = getThreadsFromCache(user.$id);
      if (cachedThreads && cachedThreads.length > 0) {
        set({ threads: cachedThreads, isLoading: false });
        // Don't return - continue to fetch fresh data
      }
    }

    // Always fetch from Appwrite to stay in sync
    if (!useCache) {
      set({ isLoading: true, error: null });
    }

    try {
      const threadsResponse = await databaseService.getUserThreads(user.$id);
      const threads: ChatThread[] = threadsResponse.documents.map((thread) => {
        const threadDoc = thread as ThreadDocument;
        return {
          $id: threadDoc.$id,
          userId: threadDoc.userId,
          title: threadDoc.title,
          description: threadDoc.description,
          category: threadDoc.category,
          priority: threadDoc.priority,
          status: threadDoc.status,
          tags: threadDoc.tags,
          messageCount: threadDoc.messageCount,
          lastMessageAt: threadDoc.lastMessageAt,
          $createdAt: threadDoc.$createdAt,
          $updatedAt: threadDoc.$updatedAt,
        };
      });

      // Always update cache with fresh data
      setThreadsCache(threads, user.$id);
      set({ threads, isLoading: false });
    } catch (error: any) {
      // Only set error if we don't have cached data
      const currentThreads = get().threads;
      if (currentThreads.length === 0) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ isLoading: false }); // Keep cached data, just stop loading
      }
    }
  },

  // Message actions
  sendMessage: async (content: string, contentType = "text" as const, attachment?: File) => {
    const { currentThread, messages } = get();
    const { user } = useAuthStore.getState();

    if (!currentThread || !user) {
      throw new Error("No active thread or user not authenticated");
    }

    let attachmentUrl: string | undefined;

    // Upload image if attachment is provided
    if (attachment && contentType === "image") {
      try {
        const uploadResult = await storageService.uploadImage(attachment);
        attachmentUrl = uploadResult.fileUrl;
      } catch (error: any) {
        set({ error: `Failed to upload image: ${error.message}` });
        throw error;
      }
    }

    // Create user message immediately with temporary ID
    const tempUserMessage: ChatMessage = {
      $id: `temp-${Date.now()}`,
      threadId: currentThread.$id!,
      userId: user.$id,
      content,
      role: "user",
      contentType,
      attachment: attachmentUrl,
      $createdAt: new Date().toISOString(),
    };

    // Add user message instantly to UI
    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      error: null,
    }));

    try {
      // If thread is temporary, we need to save it first
      if (currentThread.$id!.startsWith('temp-thread-')) {
        // The createThread should have already converted temp to real, but let's ensure consistency
        const realThreadId = get().currentThread?.$id;
        if (realThreadId && realThreadId.startsWith('temp-thread-')) {
          throw new Error("Thread creation is still in progress. Please wait.");
        }
        // Update the threadId for the message
        tempUserMessage.threadId = realThreadId || tempUserMessage.threadId;
      }

      // Save user message to database in background
      const savedUserMessage = await databaseService.createMessage({
        threadId: tempUserMessage.threadId,
        userId: tempUserMessage.userId,
        content: tempUserMessage.content,
        role: tempUserMessage.role,
        contentType: tempUserMessage.contentType,
        attachment: attachmentUrl,
      });

      // Update the temporary message with real ID
      const realUserMessage = {
        ...tempUserMessage,
        $id: savedUserMessage.$id,
        $createdAt: savedUserMessage.$createdAt,
      };

      set((state) => ({
        messages: state.messages.map(msg => 
          msg.$id === tempUserMessage.$id ? realUserMessage : msg
        ),
      }));

      // Update caches to stay in sync
      const currentMessages = get().messages;
      setMessagesCache(currentMessages, currentThread.$id!);
      
      // Update thread cache with new message count
      const { threads } = get();
      const updatedThreads = threads.map(t => 
        t.$id === currentThread.$id 
          ? { ...t, messageCount: (t.messageCount || 0) + 1, lastMessageAt: realUserMessage.$createdAt }
          : t
      );
      setThreadsCache(updatedThreads, user.$id);
      set({ threads: updatedThreads });

      // Generate thread title on first message (in background)
      if (messages.length === 0 && currentThread.title === "New Chat") {
        fetch("/api/generateThreadTitle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        }).then(async (response) => {
          const { title } = await response.json();
          if (title && title !== "New Chat") {
            await get().updateThread(currentThread.$id!, { title });
          }
        }).catch(error => console.error("Failed to generate title:", error));
      }

      // Start streaming AI response immediately
      await get().generateAIResponse();
    } catch (error: any) {
      // Remove the temporary message on error
      set((state) => ({
        messages: state.messages.filter(msg => msg.$id !== tempUserMessage.$id),
        error: error.message,
      }));
      throw error;
    }
  },

  loadMessages: async (threadId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messagesResponse = await databaseService.getThreadMessages(
        threadId
      );
      const messages: ChatMessage[] = messagesResponse.documents.map((msg) => {
        const messageDoc = msg as MessageDocument;
        return {
          $id: messageDoc.$id,
          threadId: messageDoc.threadId,
          userId: messageDoc.userId,
          content: messageDoc.content,
          role: messageDoc.role,
          contentType: messageDoc.contentType,
          attachment: messageDoc.attachment,
          $createdAt: messageDoc.$createdAt,
          $updatedAt: messageDoc.$updatedAt,
        };
      });

      set({ messages, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMessage: (message: Omit<ChatMessage, "$id">) => {
    set((state) => ({
      messages: [...state.messages, { ...message, $id: Date.now().toString() }],
    }));
  },

  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.$id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },

  deleteMessage: async (messageId: string) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.deleteMessage(messageId);

      set((state) => ({
        messages: state.messages.filter((msg) => msg.$id !== messageId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Generate AI response with real-time streaming
  generateAIResponse: async () => {
    const { currentThread } = get();
    const { user } = useAuthStore.getState();

    if (!currentThread || !user) {
      throw new Error("No active thread or user not authenticated");
    }

    // Create temporary assistant message for streaming
    const tempAssistantMessage: ChatMessage = {
      $id: `temp-assistant-${Date.now()}`,
      threadId: currentThread.$id!,
      userId: "assistant",
      content: "",
      role: "assistant",
      contentType: "text",
      $createdAt: new Date().toISOString(),
    };

    // Add empty assistant message immediately
    set((state) => ({
      messages: [...state.messages, tempAssistantMessage],
      isStreaming: true,
      error: null,
    }));

    try {
      // Get the latest messages state right before processing
      const { messages } = get();

      console.log("Total messages in state:", messages.length);
      console.log("Messages:", messages.map(m => ({ role: m.role, content: m.content?.substring(0, 50), id: m.$id })));

      // Prepare messages for AI SDK (exclude temporary assistant messages)
      const apiMessages = messages
        .filter(msg => msg.role !== "assistant" || !msg.$id?.startsWith("temp-assistant-"))
        .map((msg) => {
          if (msg.contentType === "image" && msg.attachment) {
            return {
              role: msg.role,
              content: [
                {
                  type: "text",
                  text: msg.content || "What's in this image?",
                },
                {
                  type: "image",
                  image: msg.attachment,
                },
              ],
            };
          }
          return {
            role: msg.role,
            content: msg.content || "",
          };
        }).filter(msg => {
          if (Array.isArray(msg.content)) {
            return msg.content.length > 0;
          }
          return typeof msg.content === 'string' && msg.content.trim().length > 0;
        });

      console.log("API messages to send:", apiMessages.length);
      console.log("API messages:", apiMessages);

      // Ensure we have at least one message
      if (apiMessages.length === 0) {
        throw new Error("No valid messages to process");
      }

      console.log("Sending messages to API:", apiMessages);

      // Get user location if available (you can enhance this to get actual coordinates)
      let userLocation;
      try {
        // Try to get location from user profile or browser geolocation
        const userProfile = await databaseService.getUserByUserId(user.$id);
        if (userProfile && (userProfile as any).location) {
          // For now, we'll use a default location for Kerala
          // In a real implementation, you'd geocode the location string
          userLocation = {
            city: (userProfile as any).location,
            latitude: 10.8505, // Kerala center coordinates
            longitude: 76.2711
          };
        }
      } catch (error) {
        console.warn('Failed to get user location:', error);
      }

      const response = await fetch("/api/generateResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user.$id,
          location: userLocation,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      // Process the streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Debug: Uncomment for streaming format debugging
        // console.log('Streaming chunk:', JSON.stringify(chunk));
        
        // For AI SDK streaming, the response might come as plain text
        if (chunk) {
          accumulatedContent += chunk;
          
          // Update the streaming message in real-time
          set((state) => ({
            messages: state.messages.map(msg => 
              msg.$id === tempAssistantMessage.$id 
                ? { ...msg, content: accumulatedContent }
                : msg
            ),
          }));
          
          // Small delay to make streaming visible and smooth
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      set({ isStreaming: false });

      // Save the complete message to database
      if (accumulatedContent.trim()) {
        try {
          const savedAssistantMessage = await databaseService.createMessage({
            threadId: currentThread.$id!,
            userId: "assistant",
            content: accumulatedContent,
            role: "assistant",
            contentType: "text",
          });

          // Update with real database ID
          const realAssistantMessage = {
            ...tempAssistantMessage,
            $id: savedAssistantMessage.$id,
            content: accumulatedContent,
            $createdAt: savedAssistantMessage.$createdAt,
            $updatedAt: savedAssistantMessage.$updatedAt,
          };

          set((state) => ({
            messages: state.messages.map(msg => 
              msg.$id === tempAssistantMessage.$id ? realAssistantMessage : msg
            ),
          }));

          // Update caches
          const currentMessages = get().messages;
          setMessagesCache(currentMessages, currentThread.$id!);
          
          // Update thread cache
          const { threads } = get();
          const updatedThreads = threads.map(t => 
            t.$id === currentThread.$id 
              ? { ...t, messageCount: (t.messageCount || 0) + 1, lastMessageAt: new Date().toISOString() }
              : t
          );
          setThreadsCache(updatedThreads, useAuthStore.getState().user!.$id);
          set({ threads: updatedThreads });
          
        } catch (saveError) {
          console.error("Failed to save assistant message:", saveError);
        }
      } else {
        // Remove empty message if no content
        set((state) => ({
          messages: state.messages.filter(msg => msg.$id !== tempAssistantMessage.$id),
        }));
      }
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      // Remove temporary message on error
      set((state) => ({
        messages: state.messages.filter(msg => msg.$id !== tempAssistantMessage.$id),
        error: error.message || "Failed to generate response",
        isStreaming: false,
      }));
      throw error;
    }
  },



  // Streaming actions (simplified)
  startStreaming: () => {
    set({ isStreaming: true });
  },

  stopStreaming: () => {
    set({ isStreaming: false });
  },

  // Model selection
  setSelectedModel: (modelId: string) => {
    set({ selectedModel: modelId });
  },

  // Utility actions
  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    clearChatCache();
    set({
      currentThread: null,
      threads: [],
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      selectedModel: DEFAULT_MODELS.GENERAL_CHAT,
    });
  },

  // Force sync with Appwrite (bypass cache)
  syncWithAppwrite: async () => {
    const { user } = useAuthStore.getState();
    const { currentThread } = get();
    
    if (!user) return;
    
    try {
      // Sync threads
      await get().loadThreads(false);
      
      // Sync current thread messages if we have a thread open
      if (currentThread) {
        await get().selectThread(currentThread.$id!, false);
      }
    } catch (error) {
      console.error("Failed to sync with Appwrite:", error);
    }
  },

  // Create thread and immediately switch to it (no navigation)
  createAndSwitchThread: async (title: string = "New Chat", description?: string) => {
    const newThread = await get().createThread(title, description);
    
    // The createThread already sets it as current, so we're done
    // This method exists for clarity and potential future enhancements
    return newThread;
  },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
      }),
    }
  )
);
