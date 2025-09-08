'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useAuthStore } from '@/services/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth]);

  // Show minimal loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}