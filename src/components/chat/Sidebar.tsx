"use client";

import { useState } from "react";
import { Search, Plus, MessageSquare, Menu, Sprout } from "lucide-react";
import { useChatStore } from "@/services/chatStore";
import { useRouter, useParams } from "next/navigation";
import { ThreadItem } from "./ThreadItem";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface SidebarProps {
  onToggle: () => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { threads, createThread, isLoading } = useChatStore();
  const router = useRouter();
  const params = useParams();
  const currentThreadId = params?.threadId as string;

  // Filter threads based on search query
  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = async () => {
    try {
      const newThread = await createThread("New Chat", "General farming query");
      router.push(`/chat/${newThread.$id}`);
    } catch (error) {
      console.error("Failed to create new thread:", error);
    }
  };

  const handleThreadSelect = (threadId: string | undefined) => {
    if (!threadId) return;
    router.push(`/chat/${threadId}`);
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-card-foreground">
            Digital Krishi
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={onToggle}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredThreads.length > 0 ? (
          <div className="space-y-2">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.$id}
                thread={thread}
                isActive={thread.$id === currentThreadId}
                onClick={() => handleThreadSelect(thread.$id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Start a new chat to begin"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
