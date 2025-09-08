'use client';

import { useEffect, ReactNode } from 'react';
import { useChatStore } from '@/services/chatStore';
import { useAuthStore } from '@/services/authStore';

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const loadThreads = useChatStore((state) => state.loadThreads);
  const syncWithAppwrite = useChatStore((state) => state.syncWithAppwrite);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load threads from cache immediately for instant UI
      loadThreads(true).catch(console.error);
      
      // Then refresh from Appwrite to stay in sync (minimal delay)
      const refreshTimer = setTimeout(() => {
        loadThreads(false).catch(console.error);
      }, 50);

      // Set up periodic sync every 30 seconds to ensure data stays fresh
      const syncInterval = setInterval(() => {
        syncWithAppwrite().catch(console.error);
      }, 30000);

      return () => {
        clearTimeout(refreshTimer);
        clearInterval(syncInterval);
      };
    }
  }, [isAuthenticated, user, loadThreads, syncWithAppwrite]);

  return <>{children}</>;
}