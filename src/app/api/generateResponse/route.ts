import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterConfig } from "@/utils/openrouter/config";

const openrouter = createOpenRouter({
  apiKey: openRouterConfig.apiKey,
  baseURL: openRouterConfig.baseURL,
  headers: openRouterConfig.defaultHeaders,
});

// Message types for our API
interface APIMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{
    type: "text";
    text: string;
  } | {
    type: "image";
    image: string;
  }>;
}

function prepareContextMessages(messages: APIMessage[]): APIMessage[] {
  if (messages.length === 0) return [];

  const lastMessages = messages.slice(-10);
  const contextMessages: APIMessage[] = [];
  const userMsgs: APIMessage[] = [];
  const assistantMsgs: APIMessage[] = [];
  
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
    const body = await req.json();
    const { messages } = body;

    console.log("Received request body:", JSON.stringify(body, null, 2));
    console.log("Messages:", messages);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages:", { messages, isArray: Array.isArray(messages), length: messages?.length });
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate message structure
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.role || !msg.content) {
        console.error(`Invalid message at index ${i}:`, msg);
        return new Response(
          JSON.stringify({ error: `Invalid message structure at index ${i}. Missing role or content.` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const contextMessages = prepareContextMessages(messages);
    console.log("Context messages:", contextMessages);

    const result = streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      messages: contextMessages as any,
      system: "You are a helpful AI assistant for agricultural queries. You can analyze images of crops, pests, and farming conditions. Respond in the same language as the user's input. Provide clear, concise responses about farming, crops, diseases, and agricultural practices.",
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