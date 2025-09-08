"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Sprout,
  Menu,
  X,
  User,
  MessageCircle,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import WeatherWidget from "@/components/ui/WeatherWidget";
import { useAuthStore } from "@/services/authStore";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "about", label: "About" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border/50 fixed top-0 inset-x-0 z-50 shadow-sm">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Digital Krishi Officer
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <WeatherWidget />
              <ThemeToggle />

              {isAuthenticated && user ? (
                // User dropdown menu
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-accent/30 hover:bg-accent/50 text-foreground transition-all duration-200 border border-border/50"
                  >
                    <div className="p-1 bg-primary/20 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">
                      {user.name || user.email}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm p-2 shadow-xl z-50">
                      <Link
                        href="/chat"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent/50 text-popover-foreground"
                      >
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        New Chat
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent/50 text-popover-foreground"
                      >
                        <div className="p-1.5 bg-gray-500/10 rounded-lg">
                          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        Settings
                      </Link>
                      <div className="border-t border-border/30 my-2" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-red-500/10 text-popover-foreground hover:text-red-600 dark:hover:text-red-400"
                      >
                        <div className="p-1.5 bg-red-500/10 rounded-lg">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Login/Register buttons for non-authenticated users
                <div className="flex space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-accent/30 hover:bg-accent/50 text-foreground transition-all duration-200 border border-border/50"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              {/* Weather Widget in Mobile Menu */}
              <div className="border-t border-border/30 pt-3 mt-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent/30 transition-all duration-200">
                  <span className="text-sm font-medium text-muted-foreground">Weather</span>
                  <WeatherWidget />
                </div>
              </div>

              {isAuthenticated && user ? (
                <>
                  <div className="border-t border-border/30 pt-4 mt-2">
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-accent/20 mb-3">
                      <div className="p-1.5 bg-primary/20 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name || user.email}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Link
                        href="/chat"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                      >
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>New Chat</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                      >
                        <div className="p-1.5 bg-gray-500/10 rounded-lg">
                          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left"
                      >
                        <div className="p-1.5 bg-red-500/10 rounded-lg">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border-t border-border/30 pt-4 mt-2 flex flex-col space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200 text-center shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
