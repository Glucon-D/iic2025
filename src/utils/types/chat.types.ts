// Message types
export interface ChatMessage {
  $id?: string;
  threadId: string;
  userId: string;
  content: string;
  role: "user" | "assistant" | "system";
  contentType: "text" | "image" | "voice" | "file";
  attachment?: string;
  isStreaming?: boolean;
  error?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Thread types
export interface ChatThread {
  $id?: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "active" | "resolved" | "escalated" | "closed";
  tags?: string[];
  messageCount?: number;
  lastMessageAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Chat state types
export interface ChatState {
  currentThread: ChatThread | null;
  threads: ChatThread[];
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  selectedModel: string;
}

// Chat actions
export interface ChatActions {
  // Thread actions
  createThread: (title: string, description?: string) => Promise<ChatThread>;
  createAndSwitchThread: (title: string, description?: string) => Promise<ChatThread>;
  selectThread: (threadId: string, useCache?: boolean) => Promise<void>;
  updateThread: (
    threadId: string,
    updates: Partial<ChatThread>
  ) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  loadThreads: (useCache?: boolean) => Promise<void>;

  // Message actions
  sendMessage: (
    content: string,
    contentType?: ChatMessage["contentType"],
    attachment?: File
  ) => Promise<void>;
  generateAIResponse: () => Promise<void>;
  loadMessages: (threadId: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, "$id">) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => Promise<void>;

  // Streaming actions
  startStreaming: () => void;
  stopStreaming: () => void;

  // Model selection
  setSelectedModel: (modelId: string) => void;

  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  syncWithAppwrite: () => Promise<void>;
}

export type ChatStore = ChatState & ChatActions;

// Message input types
export interface MessageInput {
  content: string;
  contentType: ChatMessage["contentType"];
  attachment?: File;
}

// Voice message types
export interface VoiceMessage {
  audioBlob: Blob;
  duration: number;
  transcript?: string;
}

// Image message types
export interface ImageMessage {
  file: File;
  preview: string;
  description?: string;
}

// File attachment types
export interface FileAttachment {
  file: File;
  type: string;
  size: number;
  name: string;
}

// Chat context types
export interface ChatContextType {
  currentThread: ChatThread | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  createThread: (title: string) => Promise<ChatThread>;
  selectThread: (threadId: string) => Promise<void>;
}

// AI response types
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

// Streaming response types
export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

// Chat filters and search
export interface ChatFilters {
  category?: string;
  priority?: ChatThread["priority"];
  status?: ChatThread["status"];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface ChatSearchQuery {
  query: string;
  filters?: ChatFilters;
  limit?: number;
  offset?: number;
}
