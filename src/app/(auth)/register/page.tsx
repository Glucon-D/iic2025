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
  ArrowLeft,
  MapPin,
  Tractor,
  Globe,
  Target,
  Calendar,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { databaseService } from "@/utils/appwrite/database";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  farmSize: string;
  crops: string[];
  customCrop: string;
  experience: string;
  language: string;
}

const CROP_OPTIONS = [
  { name: "Rice", icon: "🌾" },
  { name: "Coconut", icon: "🥥" },
  { name: "Rubber", icon: "🌳" },
  { name: "Pepper", icon: "🌶️" },
  { name: "Cardamom", icon: "🌿" },
  { name: "Tea", icon: "🍃" },
  { name: "Coffee", icon: "☕" },
  { name: "Banana", icon: "🍌" },
  { name: "Tapioca", icon: "🍠" },
  { name: "Ginger", icon: "🫚" },
  { name: "Turmeric", icon: "🟡" },
  { name: "Vegetables", icon: "🥬" },
  { name: "Fruits", icon: "🍇" },
];

const FARM_SIZES = [
  { value: "small", label: "Small (< 2 acres)" },
  { value: "medium", label: "Medium (2-10 acres)" },
  { value: "large", label: "Large (> 10 acres)" },
  { value: "commercial", label: "Commercial Operation" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0-2 years)" },
  { value: "intermediate", label: "Intermediate (3-5 years)" },
  { value: "experienced", label: "Experienced (6-10 years)" },
  { value: "expert", label: "Expert (10+ years)" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "malayalam", label: "Malayalam" },
  { value: "hindi", label: "Hindi" },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    farmSize: "",
    crops: [],
    customCrop: "",
    experience: "",
    language: "english",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API}`
              );

              if (!response.ok) {
                throw new Error("Failed to get location data");
              }

              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const location = data.results[0].formatted;
                setFormData((prev) => ({ ...prev, location }));
              } else {
                // Fallback: use IP-based location
                await getIPLocation();
              }
            } catch (error) {
              console.error("Error getting location details:", error);
              await getIPLocation();
            } finally {
              setLocationLoading(false);
            }
          },
          async (error) => {
            console.error("Geolocation error:", error);
            await getIPLocation();
          }
        );
      } else {
        await getIPLocation();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationLoading(false);
    }
  };

  const getIPLocation = async () => {
    try {
      // Try multiple IP location services for better reliability
      let locationData = null;

      // Try ipapi.co first
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city && data.region && data.country_name) {
            locationData = `${data.city}, ${data.region}, ${data.country_name}`;
          }
        }
      } catch (error) {
        console.log("ipapi.co failed, trying alternative...");
      }

      // Fallback to ip-api.com if first service fails
      if (!locationData) {
        try {
          const response = await fetch("http://ip-api.com/json/");
          if (response.ok) {
            const data = await response.json();
            if (data.city && data.regionName && data.country) {
              locationData = `${data.city}, ${data.regionName}, ${data.country}`;
            }
          }
        } catch (error) {
          console.log("ip-api.com also failed");
        }
      }

      // Set the location or fallback to default
      const finalLocation = locationData || "India";
      setFormData((prev) => ({ ...prev, location: finalLocation }));
    } catch (error) {
      console.error("IP location error:", error);
      setFormData((prev) => ({ ...prev, location: "India" }));
    } finally {
      setLocationLoading(false);
    }
  };

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

      // Get the current user after registration
      const { user: currentUser } = useAuthStore.getState();

      if (currentUser) {
        // Save user profile data
        const crops = [...formData.crops];
        if (formData.customCrop.trim()) {
          crops.push(formData.customCrop.trim());
        }

        await databaseService.createUser({
          userId: currentUser.$id,
          username: formData.name,
          location: formData.location,
          farmsize: formData.farmSize,
          crop: crops,
          experience: formData.experience,
          language: formData.language,
        });
      }

      router.push("/chat");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCropToggle = (cropName: string) => {
    setFormData((prev) => ({
      ...prev,
      crops: prev.crops.includes(cropName)
        ? prev.crops.filter((c) => c !== cropName)
        : [...prev.crops, cropName],
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name.trim() &&
          formData.email.trim() &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      case 2:
        return formData.location.trim() && formData.farmSize;
      case 3:
        return formData.crops.length > 0 || formData.customCrop.trim();
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Location Field */}
            <div className="relative group">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Location
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                <MapPin
                  className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                  aria-hidden="true"
                />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full h-12 px-3 py-2 pl-10 pr-16 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm"
                placeholder="Enter your location"
              />
              <button
                type="button"
                onClick={getLocation}
                disabled={locationLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 mt-4"
              >
                {locationLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Target className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Farm Size Field */}
            <div className="relative group">
              <label
                htmlFor="farmSize"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Farm Size
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                <Tractor
                  className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                  aria-hidden="true"
                />
              </div>
              <select
                id="farmSize"
                name="farmSize"
                required
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full h-12 px-3 py-2 pl-10 pr-8 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm appearance-none"
              >
                <option value="">Select farm size</option>
                {FARM_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none mt-4" />
            </div>

            {/* Experience Field */}
            <div className="relative group">
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Experience Level
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                <Calendar
                  className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                  aria-hidden="true"
                />
              </div>
              <select
                id="experience"
                name="experience"
                required
                value={formData.experience}
                onChange={handleChange}
                className="w-full h-12 px-3 py-2 pl-10 pr-8 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm appearance-none"
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp.value} value={exp.value}>
                    {exp.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none mt-4" />
            </div>

            {/* Language Field */}
            <div className="relative group">
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Preferred Language
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                <Globe
                  className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                  aria-hidden="true"
                />
              </div>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full h-12 px-3 py-2 pl-10 pr-8 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm appearance-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none mt-4" />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {/* Crop Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Select your crops
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => handleCropToggle(crop.name)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                      formData.crops.includes(crop.name)
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-green-300 bg-white/50 dark:bg-gray-700/50"
                    }`}
                  >
                    <span className="text-lg">{crop.icon}</span>
                    <span className="text-sm font-medium">{crop.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Crop Field */}
            <div className="relative group">
              <label
                htmlFor="customCrop"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Other crops (optional)
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 mt-8">
                <Plus
                  className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200"
                  aria-hidden="true"
                />
              </div>
              <input
                id="customCrop"
                name="customCrop"
                type="text"
                value={formData.customCrop}
                onChange={handleChange}
                className="w-full h-12 px-3 py-2 pl-10 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all duration-300 text-sm"
                placeholder="Enter other crops you grow"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 p-4 sm:p-6 lg:p-24 relative overflow-hidden">
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
                {currentStep === 1 && "Create your account"}
                {currentStep === 2 && "Farm Information"}
                {currentStep === 3 && "Crop Selection"}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {currentStep === 1 &&
                  "Join Digital Krishi Officer and get expert farming advice"}
                {currentStep === 2 && "Tell us about your farming details"}
                {currentStep === 3 && "Select the crops you grow"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Step {currentStep} of 3</span>
                <span>{Math.round((currentStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <form
              onSubmit={
                currentStep === 3
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      nextStep();
                    }
              }
            >
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 mb-4">
                  <p
                    className="text-sm text-red-800 dark:text-red-400"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                </div>
              )}

              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-6 flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isStepValid()}
                  className={`${
                    currentStep === 1 ? "w-full" : "flex-1"
                  } group relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>
                          {currentStep === 3 ? "Create Account" : "Next"}
                        </span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    )}
                  </span>

                  {/* Ripple effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                </button>
              </div>

              {/* Already have account */}
              <div className="text-center mt-4">
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
