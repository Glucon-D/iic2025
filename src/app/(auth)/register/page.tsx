"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      router.push("/chat");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
            <div>
              <div className="flex justify-center mb-6">
                <Sprout className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Join Digital Krishi Officer and get expert farming advice
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3">
                  <p
                    className="text-sm text-red-800 dark:text-red-400"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {/* Name Field */}
                <div className="relative group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full name
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                    <User
                      className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 px-3 py-2 pl-10 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
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
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 px-3 py-2 pl-10 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm"
                    placeholder="Enter your email address"
                  />
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
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 px-3 py-2 pl-10 pr-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm"
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
                </div>
                {/* Confirm Password Field */}
                <div className="relative group">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm password
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                    <Lock
                      className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-12 px-3 py-2 pl-10 pr-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 mt-4"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Create account</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    )}
                  </span>

                  {/* Ripple effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                </button>
              </div>
              {/* Already have account */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
