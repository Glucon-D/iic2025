"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Edit2, Trash2, MessageSquare, Settings, Tag, AlertCircle, Flag, Archive } from "lucide-react";
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { updateThread, deleteThread } = useChatStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
        setShowSettingsModal(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showMenu]);



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

  const handleUpdateProperty = async (property: string, value: string | string[] | undefined) => {
    if (!thread.$id) return;
    try {
      await updateThread(thread.$id, { [property]: value });
    } catch (error) {
      console.error(`Failed to update ${property}:`, error);
    }
    setShowMenu(false);
  };

  const handleToggleStatus = async () => {
    const statusOptions = ["active", "resolved", "escalated", "closed"];
    const currentIndex = statusOptions.indexOf(thread.status || "active");
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
    await handleUpdateProperty("status", nextStatus);
  };

  const handleTogglePriority = async () => {
    const priorityOptions = ["low", "medium", "high", "urgent"];
    const currentIndex = priorityOptions.indexOf(thread.priority || "medium");
    const nextPriority = priorityOptions[(currentIndex + 1) % priorityOptions.length];
    await handleUpdateProperty("priority", nextPriority);
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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "resolved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "escalated":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
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
              {thread.status && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor()}`}>
                  {thread.status}
                </span>
              )}
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
        <div className="relative" ref={menuRef}>
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
            <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
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
              
              <div className="border-t border-border my-1" />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus();
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-3 w-3" />
                  <span>Status</span>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor()}`}>
                  {thread.status || 'active'}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePriority();
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Flag className="h-3 w-3" />
                  <span>Priority</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor()}`} />
                  <span className="text-xs">{thread.priority || 'medium'}</span>
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsModal(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <Settings className="h-3 w-3" />
                <span>More Settings</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newCategory = prompt("Enter category:", thread.category || "");
                  if (newCategory !== null) {
                    handleUpdateProperty("category", newCategory);
                  }
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <Tag className="h-3 w-3" />
                <span>Category: {thread.category || 'None'}</span>
              </button>

              <div className="border-t border-border my-1" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateProperty("status", "closed");
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
              >
                <Archive className="h-3 w-3" />
                <span>Archive</span>
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSettingsModal(false);
            }
          }}
        >
          <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thread Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  placeholder="Thread title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  defaultValue={thread.description || ""}
                  onChange={(e) => handleUpdateProperty("description", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
                  rows={3}
                  placeholder="Thread description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  defaultValue={thread.category || ""}
                  onChange={(e) => handleUpdateProperty("category", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  placeholder="e.g., Crop Disease, Weather, Fertilizer"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={thread.priority || "medium"}
                  onChange={(e) => handleUpdateProperty("priority", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={thread.status || "active"}
                  onChange={(e) => handleUpdateProperty("status", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                >
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  defaultValue={thread.tags?.join(", ") || ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
                    handleUpdateProperty("tags", tags);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  placeholder="farming, pest-control, urgent (comma separated)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleEdit();
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
