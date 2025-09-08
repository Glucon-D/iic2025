// AI Model Types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  inputCost: number;
  outputCost: number;
  capabilities: string[];
  recommended?: boolean;
}

export interface ModelResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

// Model selection criteria
export interface ModelSelectionCriteria {
  useCase: "chat" | "translation" | "image_analysis" | "agriculture_expert";
  language?: "malayalam" | "english" | "hindi";
  priority?: "speed" | "accuracy" | "cost";
  capabilities?: string[];
}

// Model usage statistics
export interface ModelUsage {
  modelId: string;
  requestCount: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  lastUsed: Date;
}

export type ModelCapability =
  | "text"
  | "vision"
  | "reasoning"
  | "code"
  | "multimodal";

export type ModelProvider =
  | "Google"
  | "OpenAI"
  | "Anthropic"
  | "Meta"
  | "Mistral";

export type UseCase =
  | "malayalam_chat"
  | "malayalam_translation"
  | "agriculture_expert"
  | "crop_disease_detection"
  | "general_chat"
  | "fast_response"
  | "image_analysis"
  | "crop_image_detection";
