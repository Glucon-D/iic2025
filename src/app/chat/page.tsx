"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/services/chatStore";
import { useAuthStore } from "@/services/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MessageInput } from "@/components/chat/MessageInput";
import { Sprout, Menu } from "lucide-react";
import { useSidebar } from "./layout";

export default function ChatHomePage() {
  const router = useRouter();
  const { createThread, isLoading } = useChatStore();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && !isAuthenticated && !user) {
      router.replace("/login");
      return;
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading while auth is being initialized
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isCreatingThread) return;

    setIsCreatingThread(true);
    try {
      // Create thread instantly (optimistic UI)
      const newThread = await createThread("New Chat", "General farming query");
      
      // Navigate to the new thread with the initial message
      router.replace(
        `/chat/${newThread.$id}?initialMessage=${encodeURIComponent(content)}`
      );
    } catch (error) {
      console.error("Failed to create new thread:", error);
      setIsCreatingThread(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with sidebar toggle */}
      {!sidebarOpen && (
        <div className="p-4 border-b border-border bg-card">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Welcome Message */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sprout className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Digital Krishi Officer
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Your AI-powered agricultural advisor is ready to help. Ask me
            anything about farming, crops, diseases, weather, or any
            agricultural question in your preferred language.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl mb-2">🌾</div>
              <p className="text-sm font-medium">Crop Diseases</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl mb-2">🌤️</div>
              <p className="text-sm font-medium">Weather Advice</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl mb-2">🧪</div>
              <p className="text-sm font-medium">Fertilizers</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl mb-2">🐛</div>
              <p className="text-sm font-medium">Pest Control</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Example questions:</p>
            <div className="space-y-1">
              <p>
                "എന്റെ നെല്ലിന് എന്ത് രോഗമാണ്?" (What disease does my rice
                have?)
              </p>
              <p>"Best fertilizer for coconut trees in Kerala?"</p>
              <p>"How to control pest attacks on vegetables?"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input at Bottom */}
      <div className="border-t border-border">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || isCreatingThread}
          placeholder="Ask me anything about farming in your preferred language..."
        />
      </div>
    </div>
  );
}
