"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { useChatStore } from "@/services/chatStore";
import { useAuthStore } from "@/services/authStore";
import { useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";

// Create context for sidebar state
const SidebarContext = createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
} | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarContext");
  }
  return context;
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start with sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loadThreads } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadThreads(true);
    }
  }, [isAuthenticated, user, loadThreads]);

  // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <Navbar />
      <div className="flex h-screen pt-16 bg-background relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-80" : "w-0"
          } transition-all duration-300 overflow-hidden border-r border-border relative z-50 lg:relative lg:z-auto`}
        >
          <Sidebar onToggle={toggleSidebar} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}
