import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import {
  AuthStore,
  LoginCredentials,
  RegisterCredentials,
} from "@/utils/types/auth.types";
import { authService } from "@/utils/appwrite/auth";

// Cookie and cache management utilities
const AUTH_COOKIE_NAME = "dko-auth-session";
const USER_CACHE_KEY = "dko-user-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const setCookie = (name: string, value: string, expires?: number) => {
  const expirationDate = expires ? new Date(Date.now() + expires) : new Date(Date.now() + CACHE_DURATION);
  Cookies.set(name, value, { expires: expirationDate, secure: true, sameSite: 'lax' });
};

const getCookie = (name: string) => {
  return Cookies.get(name);
};

const removeCookie = (name: string) => {
  Cookies.remove(name);
};

const setUserCache = (user: any) => {
  if (typeof window !== 'undefined') {
    const cacheData = {
      user,
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    setCookie(AUTH_COOKIE_NAME, user.$id);
  }
};

const getUserFromCache = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authCookie = getCookie(AUTH_COOKIE_NAME);
    if (!authCookie) return null;

    const cacheData = localStorage.getItem(USER_CACHE_KEY);
    if (!cacheData) return null;

    const { user, timestamp } = JSON.parse(cacheData);
    
    // Check if cache is still valid (within 24 hours)
    if (Date.now() - timestamp > CACHE_DURATION) {
      clearUserCache();
      return null;
    }

    // Verify cache matches cookie
    if (user?.$id === authCookie) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error("Error reading user cache:", error);
    clearUserCache();
    return null;
  }
};

const clearUserCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_CACHE_KEY);
    removeCookie(AUTH_COOKIE_NAME);
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state - AuthProvider handles initialization loading
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          await authService.login(credentials);
          const user = await authService.getCurrentUser();
          
          if (user) {
            setUserCache(user);
          }

          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Handle specific session conflict error
          if (
            error.message?.includes("session is active") ||
            error.message?.includes("session is prohibited")
          ) {
            // Try to logout first and then login again
            try {
              await authService.logout();
              clearUserCache();
              await authService.login(credentials);
              const user = await authService.getCurrentUser();
              
               if (user) {
                setUserCache(user);
              }

              set({
                user,
                isAuthenticated: !!user,
                isLoading: false,
                error: null,
              });

              // Load chat data after successful retry login
              if (user) {
                const { useChatStore } = await import('./chatStore');
                const chatStore = useChatStore.getState();
                chatStore.loadThreads(false).catch(console.error);
              }
              return;
            } catch (retryError: any) {
              clearUserCache();
              set({
                error: retryError.message || "Login failed after retry",
                isLoading: false,
                isAuthenticated: false,
                user: null,
              });
              throw retryError;
            }
          }

          clearUserCache();
          set({
            error: error.message || "Login failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.createAccount(credentials);
          
          if (user) {
            setUserCache(user);
          }

          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            error: null,
          });

          // Load chat data for new user (will be empty initially)
          if (user) {
            const { useChatStore } = await import('./chatStore');
            const chatStore = useChatStore.getState();
            chatStore.loadThreads(false).catch(console.error);
          }
        } catch (error: any) {
          clearUserCache();
          set({
            error: error.message || "Registration failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.logout();
          clearUserCache();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          clearUserCache();
          set({
            error: error.message || "Logout failed",
            isLoading: false,
          });
          throw error;
        }
      },

      getCurrentUser: async (useCache = true) => {
        // First try to get user from cache if enabled
        if (useCache) {
          const cachedUser = getUserFromCache();
          if (cachedUser) {
            set({
              user: cachedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }

        set({ isLoading: true, error: null });
        try {
          const user = await authService.getCurrentUser();
          
          if (user) {
            setUserCache(user);
          }
          
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // If there's a session conflict, try to clear it
          if (error.message?.includes("session") || error.code === 401) {
            try {
              await authService.logout();
            } catch (logoutError) {
              // Ignore logout errors during cleanup
            }
          }

          clearUserCache();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Don't show error for session cleanup
          });
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) throw new Error("No user logged in");

        set({ isLoading: true, error: null });
        try {
          // Update user name if provided
          if (data.name && data.name !== user.name) {
            await authService.updateName(data.name);
          }

          // Update email if provided
          if (data.email && data.email !== user.email) {
            // This requires password confirmation in a real implementation
            // For now, we'll skip email updates
            console.warn("Email updates require password confirmation");
          }

          // Get updated user data
          const updatedUser = await authService.getCurrentUser();
          
          if (updatedUser) {
            setUserCache(updatedUser);
          }
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || "Profile update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Initialize auth state from cache
      initializeAuth: async () => {
        const cachedUser = getUserFromCache();
        if (cachedUser) {
          set({
            user: cachedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Load chat data immediately from cache for instant UI
          const { useChatStore } = await import('./chatStore');
          const chatStore = useChatStore.getState();
          chatStore.loadThreads(true).catch(console.error);
          
          // Verify session in background
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser && currentUser.$id === cachedUser.$id) {
              // Update cache with fresh data
              setUserCache(currentUser);
              set({ user: currentUser });
              
              // Refresh chat data in background
              chatStore.loadThreads(false).catch(console.error);
            } else {
              // Cache is invalid, clear it
              clearUserCache();
              set({
                user: null,
                isAuthenticated: false,
              });
            }
          } catch (error) {
            // Session invalid, clear cache
            clearUserCache();
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        } else {
          // No cache, try to get current user
          await get().getCurrentUser(false);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
