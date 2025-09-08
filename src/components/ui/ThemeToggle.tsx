"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(actualTheme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background border border-border"
      aria-label={`Switch to ${
        actualTheme === "light" ? "dark" : "light"
      } mode`}
    >
      {actualTheme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">
        Switch to {actualTheme === "light" ? "dark" : "light"} mode
      </span>
    </button>
  );
}

// Simple theme toggle button (just light/dark)
export function SimpleThemeToggle() {
  const { actualTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(actualTheme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background border border-border"
      aria-label={`Switch to ${
        actualTheme === "light" ? "dark" : "light"
      } mode`}
    >
      {actualTheme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">
        Switch to {actualTheme === "light" ? "dark" : "light"} mode
      </span>
    </button>
  );
}
