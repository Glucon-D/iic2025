import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterConfig } from "@/utils/openrouter/config";

const openrouter = createOpenRouter({
  apiKey: openRouterConfig.apiKey,
  baseURL: openRouterConfig.baseURL,
  headers: openRouterConfig.defaultHeaders,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      messages: [
        {
          role: "system",
          content: "Generate a concise title (max 4 words) for this chat in the same language as the input message. Return only the title.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.5,
      maxRetries: 1,
    });

    const title = result.text.trim().substring(0, 50) || "New Chat";

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error generating thread title:", error);
    return NextResponse.json(
      { error: "Failed to generate title", title: "New Chat" },
      { status: 500 }
    );
  }
}
