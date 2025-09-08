"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function LoginPage() {
  const router = useRouter();
  const { login, logout, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      // Redirect to chat on successful login
      router.push("/chat");
    } catch (error) {
      // Error is handled by the store
      console.error("Login failed:", error);
    }
  };

  const handleClearSession = async () => {
    try {
      await logout();
      setFormErrors({});
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Navbar />
      <div className=" flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="w-full max-w-md lg:max-w-lg relative z-10">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl dark:shadow-green-500/20 border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
            {/* Header */}
            <div>
              <div className="flex justify-center mb-6">
                <Sprout className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Sign in to your Digital Krishi Officer account
              </p>
            </div>

            {/* Login Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Global Error */}
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3">
                  <div className="flex justify-between items-center">
                    <p
                      className="text-sm text-red-800 dark:text-red-400"
                      aria-live="polite"
                    >
                      {error}
                    </p>
                    {(error.includes("session is active") ||
                      error.includes("session is prohibited")) && (
                      <button
                        type="button"
                        onClick={handleClearSession}
                        className="ml-4 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
                      >
                        Clear Session
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Field */}
                <div className="relative group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email address
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                    <Mail
                      className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-3 py-2 pl-10 bg-white/50 dark:bg-gray-700/50 border-2 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm ${
                      formErrors.email
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-200/50 dark:border-gray-600/50"
                    }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                    <Lock
                      className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-3 py-2 pl-10 pr-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm ${
                      formErrors.password
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-200/50 dark:border-gray-600/50"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 mt-4"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Sign in</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    )}
                  </span>

                  {/* Ripple effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                </button>
              </div>

              {/* Links */}
              <div className="flex items-center justify-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
