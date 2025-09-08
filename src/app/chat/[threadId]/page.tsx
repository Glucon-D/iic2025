"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useChatStore } from "@/services/chatStore";
import { useAuthStore } from "@/services/authStore";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";


export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const threadId = params?.threadId as string;
  const initialMessage = searchParams?.get("initialMessage");

  const {
    currentThread,
    messages,
    selectThread,
    sendMessage,

    isLoading,
    error,
  } = useChatStore();
  const { user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] =
    useState(false);



  const handleSendMessage = useCallback(
    async (
      content: string,
      contentType: "text" | "image" | "voice" | "file" = "text"
    ) => {
      if (!currentThread || !user) return;

      try {
        await sendMessage(content, contentType);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [currentThread, user, sendMessage]
  );

  useEffect(() => {
    if (threadId && user && !isInitialized) {
      selectThread(threadId).finally(() => setIsInitialized(true));
    }
  }, [threadId, user, selectThread, isInitialized]);

  // Handle initial message from URL params
  useEffect(() => {
    if (
      initialMessage &&
      currentThread &&
      !hasProcessedInitialMessage &&
      isInitialized
    ) {
      setHasProcessedInitialMessage(true);
      handleSendMessage(decodeURIComponent(initialMessage));
    }
  }, [
    initialMessage,
    currentThread,
    hasProcessedInitialMessage,
    isInitialized,
    handleSendMessage,
  ]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load conversation</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentThread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Conversation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader thread={currentThread} />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUserId={user?.$id} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask about farming, crops, diseases, or any agricultural question in your preferred language..."
      />
    </div>
  );
}
