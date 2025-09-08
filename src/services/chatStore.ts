import { create } from "zustand";
import { ChatStore, ChatMessage, ChatThread } from "@/utils/types/chat.types";
import { databaseService } from "@/utils/appwrite/database";
import { useAuthStore } from "./authStore";
import { DEFAULT_MODELS } from "@/utils/aiModels/modelConfig";
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

export const useChatStore = create<ChatStore>((set, get) => ({
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

    set({ isLoading: true, error: null });
    try {
      const threadData = {
        userId: user.$id,
        title,
        description: description || "",
        category: "general",
        priority: "medium" as const,
        status: "active" as const,
        tags: [],
      };

      const thread = (await databaseService.createThread(
        threadData
      )) as ThreadDocument;
      const newThread: ChatThread = {
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

      set((state) => ({
        threads: [newThread, ...state.threads],
        currentThread: newThread,
        messages: [],
        isLoading: false,
      }));

      return newThread;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  selectThread: async (threadId: string) => {
    set({ isLoading: true, error: null });
    try {
      const thread = (await databaseService.getThread(
        threadId
      )) as ThreadDocument;
      const messages = await databaseService.getThreadMessages(threadId);

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

      set({
        currentThread: chatThread,
        messages: chatMessages,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
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

  loadThreads: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });
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

      set({ threads, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Message actions
  sendMessage: async (content: string, contentType = "text" as const) => {
    const { currentThread, messages } = get();
    const { user } = useAuthStore.getState();

    if (!currentThread || !user) {
      throw new Error("No active thread or user not authenticated");
    }

    set({ isLoading: true, error: null });
    try {
      const userMessage: ChatMessage = {
        threadId: currentThread.$id!,
        userId: user.$id,
        content,
        role: "user",
        contentType,
      };

      const savedUserMessage = await databaseService.createMessage({
        threadId: userMessage.threadId,
        userId: userMessage.userId,
        content: userMessage.content,
        role: userMessage.role,
        contentType: userMessage.contentType,
        attachment: userMessage.attachment,
      });

      set((state) => ({
        messages: [
          ...state.messages,
          {
            ...userMessage,
            $id: savedUserMessage.$id,
            $createdAt: savedUserMessage.$createdAt,
          },
        ],
        isLoading: false,
      }));

      // Generate thread title on first message
      if (messages.length === 0 && currentThread.title === "New Chat") {
        try {
          const titleResponse = await fetch("/api/generateThreadTitle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: content }),
          });
          const { title } = await titleResponse.json();
          if (title && title !== "New Chat") {
            await get().updateThread(currentThread.$id!, { title });
          }
        } catch (titleError) {
          console.error("Failed to generate title:", titleError);
        }
      }

      // Generate AI response
      await get().generateAIResponse();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
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

  // Generate AI response
  generateAIResponse: async () => {
    const { currentThread, messages } = get();
    const { user } = useAuthStore.getState();

    if (!currentThread || !user) {
      throw new Error("No active thread or user not authenticated");
    }

    set({ isLoading: true, error: null });

    try {
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/generateResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.content?.trim()) {
        const savedAssistantMessage = await databaseService.createMessage({
          threadId: currentThread.$id!,
          userId: "assistant",
          content: data.content,
          role: "assistant",
          contentType: "text",
        });

        const assistantMessage: ChatMessage = {
          $id: savedAssistantMessage.$id,
          threadId: currentThread.$id!,
          userId: "assistant",
          content: data.content,
          role: "assistant",
          contentType: "text",
          $createdAt: savedAssistantMessage.$createdAt,
          $updatedAt: savedAssistantMessage.$updatedAt,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      set({
        error: error.message || "Failed to generate response",
        isLoading: false,
      });
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
}));
