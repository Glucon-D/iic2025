import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterConfig } from "@/utils/openrouter/config";

const openrouter = createOpenRouter({
  apiKey: openRouterConfig.apiKey,
  baseURL: openRouterConfig.baseURL,
  headers: openRouterConfig.defaultHeaders,
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

function prepareContextMessages(messages: Message[]): Message[] {
  if (messages.length === 0) return [];
  
  const lastMessages = messages.slice(-10);
  const contextMessages: Message[] = [];
  const userMsgs: Message[] = [];
  const assistantMsgs: Message[] = [];
  
  lastMessages.forEach(msg => {
    if (msg.role === "user") userMsgs.push(msg);
    else if (msg.role === "assistant") assistantMsgs.push(msg);
  });
  
  const userCount = Math.min(5, userMsgs.length);
  const assistantCount = Math.min(5, assistantMsgs.length);
  const pairs = Math.min(userCount, assistantCount);
  
  for (let i = 0; i < pairs; i++) {
    contextMessages.push(userMsgs[userMsgs.length - pairs + i]);
    contextMessages.push(assistantMsgs[assistantMsgs.length - pairs + i]);
  }
  
  if (userMsgs.length > pairs) {
    for (let i = pairs; i < userCount; i++) {
      contextMessages.push(userMsgs[userMsgs.length - userCount + i]);
    }
  }
  
  return contextMessages.length > 0 ? contextMessages : [messages[messages.length - 1]];
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const contextMessages = prepareContextMessages(messages);
    
    const result = streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for agricultural queries. Respond in the same language as the user's input. Provide clear, concise responses about farming, crops, diseases, and agricultural practices."
        },
        ...contextMessages
      ],
      temperature: 0.7,
      maxRetries: 2,
    });

    // Return the streaming response with proper headers
    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}