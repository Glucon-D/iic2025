"use client";

import { useState } from "react";
import {
  MoreVertical,
  Edit2,
  Archive,
  AlertTriangle,
  CheckCircle,
  Menu,
} from "lucide-react";
import { ChatThread } from "@/utils/types/chat.types";
import { useChatStore } from "@/services/chatStore";
import { useSidebar } from "@/app/chat/layout";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  thread: ChatThread;
}

export function ChatHeader({ thread }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { updateThread } = useChatStore();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  const getStatusIcon = () => {
    switch (thread.status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "closed":
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = () => {
    switch (thread.priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusChange = async (newStatus: ChatThread["status"]) => {
    if (!thread.$id) return;
    try {
      await updateThread(thread.$id, { status: newStatus });
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to update thread status:", error);
    }
  };

  const handlePriorityChange = async (newPriority: ChatThread["priority"]) => {
    if (!thread.$id) return;
    try {
      await updateThread(thread.$id, { priority: newPriority });
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to update thread priority:", error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center space-x-3">
        {/* Sidebar toggle button - only show when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Priority indicator */}
        {thread.priority && (
          <div
            className={`w-3 h-3 rounded-full ${getPriorityColor()}`}
            title={`Priority: ${thread.priority}`}
          />
        )}

        <div>
          <h1 className="text-lg font-semibold text-card-foreground">
            {thread.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {/* <span>{thread.messageCount || 0} messages</span> */}
            {thread.lastMessageAt && (
              <span>
                Last active{" "}
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            )}
            {thread.category && (
              <span className="px-2 py-1 bg-secondary rounded-full text-xs">
                {thread.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Status icon */}
        {getStatusIcon()}

        {/* Status text */}
        <span className="text-sm text-muted-foreground capitalize">
          {thread.status}
        </span>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 bg-popover border border-border rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
              {/* Status options */}
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-2">
                Status
              </div>
              <button
                onClick={() => handleStatusChange("active")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Active</span>
              </button>
              <button
                onClick={() => handleStatusChange("resolved")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Resolved</span>
              </button>
              <button
                onClick={() => handleStatusChange("escalated")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span>Escalated</span>
              </button>
              <button
                onClick={() => handleStatusChange("closed")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <Archive className="h-3 w-3 text-gray-500" />
                <span>Closed</span>
              </button>

              {/* Priority options */}
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-t border-border my-2">
                Priority
              </div>
              <button
                onClick={() => handlePriorityChange("low")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Low</span>
              </button>
              <button
                onClick={() => handlePriorityChange("medium")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Medium</span>
              </button>
              <button
                onClick={() => handlePriorityChange("high")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>High</span>
              </button>
              <button
                onClick={() => handlePriorityChange("urgent")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Urgent</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
