// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query parameters
export interface QueryParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request configuration
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: QueryParams;
  timeout?: number;
}

// Chat API types
export interface ChatStreamRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatStreamResponse {
  content: string;
  isComplete: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// File upload types
export interface FileUploadRequest {
  file: File;
  type: 'image' | 'voice' | 'document';
  threadId?: string;
}

export interface FileUploadResponse {
  fileId: string;
  url: string;
  type: string;
  size: number;
  name: string;
}

// Authentication API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    $createdAt: string;
    $updatedAt: string;
  };
  session: {
    $id: string;
    userId: string;
    expire: string;
    $createdAt: string;
  };
}

// Thread API types
export interface CreateThreadRequest {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
}

export interface UpdateThreadRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  tags?: string[];
}

// Message API types
export interface CreateMessageRequest {
  threadId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  contentType: 'text' | 'image' | 'voice' | 'file';
  attachment?: string;
}

// User profile API types
export interface UpdateProfileRequest {
  username?: string;
  location?: string;
  farmsize?: string;
  crop?: string[];
  experience?: string;
  language?: string;
}

// Search API types
export interface SearchRequest {
  query: string;
  type?: 'threads' | 'messages' | 'all';
  filters?: {
    category?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    userId?: string;
  };
  pagination?: PaginationParams;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
  took: number; // Search time in milliseconds
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'error' | 'connection';
  data: any;
  timestamp: string;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}
