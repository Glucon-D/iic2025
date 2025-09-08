"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, Trash2, MessageSquare } from "lucide-react";
import { ChatThread } from "@/utils/types/chat.types";
import { useChatStore } from "@/services/chatStore";
import { formatDistanceToNow } from "date-fns";

interface ThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
}

export function ThreadItem({ thread, isActive, onClick }: ThreadItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);
  const { updateThread, deleteThread } = useChatStore();

  const handleEdit = async () => {
    if (!thread.$id) return;
    if (editTitle.trim() && editTitle !== thread.title) {
      try {
        await updateThread(thread.$id, { title: editTitle.trim() });
      } catch (error) {
        console.error("Failed to update thread:", error);
        setEditTitle(thread.title); // Reset on error
      }
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!thread.$id) return;
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteThread(thread.$id);
      } catch (error) {
        console.error("Failed to delete thread:", error);
      }
    }
    setShowMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setEditTitle(thread.title);
      setIsEditing(false);
    }
  };

  const getStatusColor = () => {
    switch (thread.status) {
      case "active":
        return "text-green-500";
      case "resolved":
        return "text-blue-500";
      case "escalated":
        return "text-yellow-500";
      case "closed":
        return "text-gray-500";
      default:
        return "text-muted-foreground";
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

  return (
    <div
      className={`relative group p-3 rounded-lg cursor-pointer transition-colors ${
        isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-card-foreground"
              autoFocus
            />
          ) : (
            <h3 className="text-sm font-medium text-card-foreground truncate">
              {thread.title}
            </h3>
          )}

          {thread.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {thread.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {/* Priority indicator */}
              {thread.priority && (
                <div
                  className={`w-2 h-2 rounded-full ${getPriorityColor()}`}
                  title={`Priority: ${thread.priority}`}
                />
              )}

              {/* Message count */}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{thread.messageCount || 0}</span>
              </div>

              {/* Status */}
              <span className={`text-xs ${getStatusColor()}`}>
                {thread.status}
              </span>
            </div>

            {/* Last message time */}
            {thread.lastMessageAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <Edit2 className="h-3 w-3" />
                <span>Rename</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center space-x-2"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
