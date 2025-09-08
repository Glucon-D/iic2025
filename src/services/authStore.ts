import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthStore,
  LoginCredentials,
  RegisterCredentials,
} from "@/utils/types/auth.types";
import { authService } from "@/utils/appwrite/auth";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
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
              await authService.login(credentials);
              const user = await authService.getCurrentUser();

              set({
                user,
                isAuthenticated: !!user,
                isLoading: false,
                error: null,
              });
              return;
            } catch (retryError: any) {
              set({
                error: retryError.message || "Login failed after retry",
                isLoading: false,
                isAuthenticated: false,
                user: null,
              });
              throw retryError;
            }
          }

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

          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
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
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || "Logout failed",
            isLoading: false,
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.getCurrentUser();
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
