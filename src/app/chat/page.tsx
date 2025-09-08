"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/services/chatStore";
import { useAuthStore } from "@/services/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MessageInput } from "@/components/chat/MessageInput";
import { Sprout } from "lucide-react";

export default function ChatHomePage() {
  const router = useRouter();
  const { createThread, isLoading } = useChatStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Only redirect if auth is fully loaded and user is definitely not authenticated
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while auth is being initialized
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show nothing while redirecting or if not authenticated
  if (!authLoading && !isAuthenticated) {
    return null;
  }

  const handleSendMessage = async (content: string, contentType?: 'text' | 'image' | 'voice' | 'file', attachment?: File) => {
    if ((!content.trim() && !attachment) || isCreatingThread) return;

    setIsCreatingThread(true);
    try {
      // Create thread instantly (optimistic UI)
      const threadTitle = attachment ? "Image conversation" : "New Chat";
      const newThread = await createThread(threadTitle, "General farming query");

      // Navigate to the new thread with the initial message and attachment info
      const params = new URLSearchParams();
      if (content.trim()) {
        params.set('initialMessage', content);
      }
      if (contentType) {
        params.set('contentType', contentType);
      }
      if (attachment) {
        params.set('hasAttachment', 'true');
      }

      const queryString = params.toString();
      router.replace(
        `/chat/${newThread.$id}${queryString ? `?${queryString}` : ''}`
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
      {/* Welcome Message */}
      <div className="flex-1  flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sprout className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Digital Krishi Officer
          </h1>

          {/* Sample Questions */}
          <div className="space-y-6 mb-8 max-w-3xl mx-auto">
            <div className="grid gap-4">
              {/* Question 1 - Malayalam */}
              <button
                onClick={() =>
                  setInputValue("എന്റെ വിളയിലെ രോഗം തിരിച്ചറിയാൻ എനിക്ക് സഹായം വേണം. എന്റെ വിളയുടെ അവസ്ഥ വിശകലനം ചെയ്യാൻ നിങ്ങൾക്ക് സഹായിക്കാമോ?")
                }
                className="w-full p-4 text-left bg-card border border-border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
              >
                <p className="text-sm font-medium text-foreground mb-1">
                  🌾 വിള രോഗ തിരിച്ചറിയൽ
                </p>
                <p className="text-xs text-muted-foreground">
                  എന്റെ വിളയിലെ രോഗം തിരിച്ചറിയാൻ എനിക്ക് സഹായം വേണം. എന്റെ വിളയുടെ അവസ്ഥ വിശകലനം ചെയ്യാൻ നിങ്ങൾക്ക് സഹായിക്കാമോ?
                </p>
              </button>

              {/* Question 2 - Malayalam */}
              <button
                onClick={() =>
                  setInputValue("കൃഷിക്കുള്ള കാലാവസ്ഥാ പ്രവചനം എന്താണ്? ഇന്ന് എന്റെ വിളകൾക്ക് വെള്ളം നൽകണോ?")
                }
                className="w-full p-4 text-left bg-card border border-border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
              >
                <p className="text-sm font-medium text-foreground mb-1">
                  🌤️ കാലാവസ്ഥ & കൃഷി ഉപദേശം
                </p>
                <p className="text-xs text-muted-foreground">
                  കൃഷിക്കുള്ള കാലാവസ്ഥാ പ്രവചനം എന്താണ്? ഇന്ന് എന്റെ വിളകൾക്ക് വെള്ളം നൽകണോ?
                </p>
              </button>

              {/* Question 3 - English */}
              <button
                onClick={() =>
                  setInputValue("What fertilizers should I use for my crops? I need recommendations based on my soil type.")
                }
                className="w-full p-4 text-left bg-card border border-border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
              >
                <p className="text-sm font-medium text-foreground mb-1">
                  🧪 Fertilizer Recommendations
                </p>
                <p className="text-xs text-muted-foreground">
                  What fertilizers should I use for my crops? I need recommendations based on my soil type.
                </p>
              </button>

              {/* Question 4 - Hindi */}
              <button
                onClick={() =>
                  setInputValue("मुझे अपनी फसलों में कीट की समस्या का सामना करना पड़ रहा है। क्या आप कीट नियंत्रण के तरीकों पर मार्गदर्शन प्रदान कर सकते हैं?")
                }
                className="w-full p-4 text-left bg-card border border-border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
              >
                <p className="text-sm font-medium text-foreground mb-1">
                  🐛 कीट नियंत्रण समाधान
                </p>
                <p className="text-xs text-muted-foreground">
                  मुझे अपनी फसलों में कीट की समस्या का सामना करना पड़ रहा है। क्या आप कीट नियंत्रण के तरीकों पर मार्गदर्शन प्रदान कर सकते हैं?
                </p>
              </button>
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
          value={inputValue}
          onChange={setInputValue}
        />
      </div>
    </div>
  );
}
