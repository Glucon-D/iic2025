import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, generateText } from "ai";
import { openRouterConfig } from "./config";
import { DEFAULT_MODELS } from "../aiModels/modelConfig";

// Initialize OpenRouter provider
export const openrouter = createOpenRouter({
  apiKey: openRouterConfig.apiKey,
  baseURL: openRouterConfig.baseURL,
  headers: openRouterConfig.defaultHeaders,
});

// Chat message interface
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Generate AI response (non-streaming)
export async function generateAIResponse(
  messages: ChatMessage[],
  modelId: string = DEFAULT_MODELS.GENERAL_CHAT,
  options?: {
    temperature?: number;
    systemPrompt?: string;
  }
) {
  try {
    const { temperature = 0.7, systemPrompt } = options || {};

    // Add system prompt if provided
    const messagesWithSystem = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;

    const result = await generateText({
      model: openrouter(modelId),
      messages: messagesWithSystem,
      temperature,
    });

    return {
      content: result.text,
      usage: result.usage,
      model: modelId,
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

// Stream AI response
export async function streamAIResponse(
  messages: ChatMessage[],
  modelId: string = DEFAULT_MODELS.GENERAL_CHAT,
  options?: {
    temperature?: number;
    systemPrompt?: string;
  }
) {
  try {
    const { temperature = 0.7, systemPrompt } = options || {};

    // Add system prompt if provided
    const messagesWithSystem = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;

    const result = streamText({
      model: openrouter(modelId),
      messages: messagesWithSystem,
      temperature,
    });

    return result;
  } catch (error) {
    console.error("Error streaming AI response:", error);
    throw error;
  }
}

// Generate response for agricultural queries
export async function generateAgricultureResponse(
  query: string,
  context?: any
) {
  const messages = [
    {
      role: "user" as const,
      content: query,
    },
  ];

  const systemPrompt = `You are a Digital Krishi Officer, an AI agricultural advisor specializing in farming practices. Respond in the same language as the user's query.

Key Guidelines:
1. Respond in the same language as the user's input
2. Focus on practical, actionable agricultural advice
3. Include traditional and modern farming practices
4. Consider local climate and seasonal factors
5. Be concise but comprehensive
6. Use simple language that farmers can easily understand`;

  return generateAIResponse(messages, DEFAULT_MODELS.GENERAL_CHAT, {
    systemPrompt,
    temperature: 0.7,
  });
}

// Analyze crop diseases from image descriptions
export async function analyzeCropDisease(
  imageDescription: string,
  cropType?: string,
  symptoms?: string[]
) {
  const messages = [
    {
      role: "user" as const,
      content: `Image Description: ${imageDescription}${
        cropType ? `\nCrop Type: ${cropType}` : ""
      }${
        symptoms && symptoms.length > 0
          ? `\nObserved Symptoms: ${symptoms.join(", ")}`
          : ""
      }`,
    },
  ];

  const systemPrompt = `You are an expert in crop disease identification and agricultural diagnostics. Analyze the described image and provide detailed advice in the same language as the user's input.

Guidelines:
1. Identify the most likely diseases/pests
2. Provide immediate treatment recommendations
3. Suggest preventive measures
4. Include organic and chemical solutions
5. Respond in the same language as the user's input`;

  return generateAIResponse(messages, DEFAULT_MODELS.GENERAL_CHAT, {
    systemPrompt,
    temperature: 0.5,
  });
}
