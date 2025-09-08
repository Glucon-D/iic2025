"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sprout,
  User,
  Tractor,
  Wheat,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Target,
  MapPin,
  Calendar,
  Globe,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import {
  databaseService,
  User as UserProfile,
} from "@/utils/appwrite/database";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

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

// Utility function to truncate location intelligently
const truncateLocation = (location: string, maxLength: number = 50): string => {
  if (!location || location.length <= maxLength) return location;
  
  // Try to find a good breaking point (comma, hyphen, or space)
  const breakPoints = [', ', ' - ', ' '];
  let bestTruncation = location.substring(0, maxLength - 3) + '...';
  
  for (const breakPoint of breakPoints) {
    const lastBreakIndex = location.lastIndexOf(breakPoint, maxLength - 3);
    if (lastBreakIndex > maxLength * 0.6) { // At least 60% of desired length
      bestTruncation = location.substring(0, lastBreakIndex) + '...';
      break;
    }
  }
  
  return bestTruncation;
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [editData, setEditData] = useState({
    username: "",
    location: "",
    farmsize: "",
    crop: [] as string[],
    customCrop: "",
    experience: "",
    language: "",
  });

  const populateEditData = useCallback((profileData: UserProfile) => {
    setEditData({
      username: profileData.username || "",
      location: profileData.location || "",
      farmsize: profileData.farmsize || "",
      crop: profileData.crop || [],
      customCrop: "",
      experience: profileData.experience || "",
      language: profileData.language || "english",
    });
  }, []);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Try to find user by userId
      const userProfiles = await databaseService.getUserByUserId(user.$id);
      if (userProfiles) {
        // Convert Appwrite Document to UserProfile type
        const profileData: UserProfile = {
          $id: userProfiles.$id,
          userId: (userProfiles as any).userId,
          username: (userProfiles as any).username,
          location: (userProfiles as any).location,
          farmsize: (userProfiles as any).farmsize,
          crop: (userProfiles as any).crop,
          experience: (userProfiles as any).experience,
          language: (userProfiles as any).language,
          $createdAt: userProfiles.$createdAt,
          $updatedAt: userProfiles.$updatedAt,
        };
        setProfile(profileData);
        populateEditData(profileData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [user, populateEditData]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/login");
      return;
    }

    if (user) {
      loadUserProfile();
    }
  }, [user, isAuthenticated, authLoading, router, loadUserProfile]);

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // For demo, we'll just use a basic location format
              const location = `${latitude.toFixed(4)}, ${longitude.toFixed(
                4
              )}`;
              setEditData((prev) => ({ ...prev, location }));
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
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const location = `${data.city}, ${data.region}, ${data.country_name}`;
      setEditData((prev) => ({ ...prev, location }));
    } catch (error) {
      console.error("IP location error:", error);
      setEditData((prev) => ({ ...prev, location: "India" }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    setError(null);

    try {
      const crops = [...editData.crop];
      if (editData.customCrop.trim()) {
        crops.push(editData.customCrop.trim());
      }

      const updateData = {
        username: editData.username,
        location: editData.location,
        farmsize: editData.farmsize,
        crop: crops,
        experience: editData.experience,
        language: editData.language,
      };

      const updatedProfile = await databaseService.updateUser(
        profile.$id!,
        updateData
      );

      // Convert Appwrite Document to UserProfile type
      const updatedProfileData: UserProfile = {
        $id: updatedProfile.$id,
        userId: (updatedProfile as any).userId,
        username: (updatedProfile as any).username,
        location: (updatedProfile as any).location,
        farmsize: (updatedProfile as any).farmsize,
        crop: (updatedProfile as any).crop,
        experience: (updatedProfile as any).experience,
        language: (updatedProfile as any).language,
        $createdAt: updatedProfile.$createdAt,
        $updatedAt: updatedProfile.$updatedAt,
      };
      setProfile(updatedProfileData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      populateEditData(profile);
    }
    setIsEditing(false);
    setError(null);
  };

  const handleCropToggle = (cropName: string) => {
    setEditData((prev) => ({
      ...prev,
      crop: prev.crop.includes(cropName)
        ? prev.crop.filter((c) => c !== cropName)
        : [...prev.crop, cropName],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your profile...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="animate-in fade-in duration-500">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please complete your profile setup.
            </p>
            <button
              onClick={() => router.push("/register")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Complete Profile
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-24 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-4xl xl:max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 mb-6 sm:mb-8 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-blue-50/30 dark:from-green-900/10 dark:via-transparent dark:to-blue-900/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.08),transparent_50%)]"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl">
                    <Sprout className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Profile Settings
                  </h1>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-md w-full sm:w-auto"
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2 sm:space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 sm:space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl transition-all duration-300 hover:shadow-md text-sm sm:text-base"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 hover:shadow-lg shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50/90 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/60 rounded-2xl p-4 mb-6 shadow-md">
              <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Profile Content */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 dark:from-blue-900/5 dark:via-transparent dark:to-indigo-900/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_50%)]"></div>
            
            <div className="relative z-10 divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {/* Personal Information */}
              <div className="p-4 sm:p-6 relative overflow-hidden">
                {/* Section background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-transparent dark:from-green-900/10 dark:to-transparent"></div>
                
                <div className="relative z-10">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span>Personal Information</span>
                  </h2>

                  <div className="space-y-4 sm:space-y-5">
                    <div className="group">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <User className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={editData.username}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full h-10 sm:h-12 pl-10 pr-3 sm:pr-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:border-primary focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 text-sm sm:text-base placeholder:text-gray-400"
                          />
                        </div>
                      ) : (
                        <div className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white font-semibold hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-all duration-300 text-sm sm:text-base">
                          <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">{profile.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Farm Information */}
              <div className="p-4 sm:p-6 relative overflow-hidden">
                {/* Section background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
                
                <div className="relative z-10">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl">
                      <Tractor className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span>Farm Information</span>
                  </h2>

                  <div className="space-y-4 sm:space-y-5">
                    <div className="group">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Location
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            name="location"
                            value={editData.location}
                            onChange={handleInputChange}
                            placeholder="Enter your location"
                            className="w-full h-10 sm:h-12 pl-10 pr-10 sm:pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:border-primary focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 text-sm sm:text-base placeholder:text-gray-400"
                            title={editData.location}
                          />
                          <button
                            type="button"
                            onClick={getLocation}
                            disabled={locationLoading}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-gray-400 hover:text-primary hover:bg-primary/10 focus:outline-none rounded-lg transition-all duration-300"
                          >
                            {locationLoading ? (
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white font-semibold hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-all duration-300 text-sm sm:text-base group/location relative">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span 
                            className="flex-1 truncate pr-2" 
                            title={profile.location}
                          >
                            {truncateLocation(profile.location || '', 50)}
                          </span>
                          {profile.location && profile.location.length > 50 && (
                            <>
                              <span className="text-gray-400 text-xs flex-shrink-0">hover for full</span>
                              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover/location:opacity-100 transition-opacity duration-300 pointer-events-none z-20 w-72 sm:w-80 break-words shadow-lg whitespace-normal border border-gray-700 dark:border-gray-600">
                                <div className="font-medium mb-1">Full Address:</div>
                                {profile.location}
                                {/* Tooltip arrow */}
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Farm Size
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                          <select
                            name="farmsize"
                            value={editData.farmsize}
                            onChange={handleInputChange}
                            className="w-full h-10 sm:h-12 pl-10 pr-8 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:border-primary focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 text-sm sm:text-base"
                          >
                            <option value="">Select farm size</option>
                            {FARM_SIZES.map((size) => (
                              <option key={size.value} value={size.value}>
                                {size.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white font-semibold hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-all duration-300 text-sm sm:text-base">
                          <BarChart3 className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">
                            {FARM_SIZES.find(
                              (size) => size.value === profile.farmsize
                            )?.label || profile.farmsize}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Experience Level
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <select
                            name="experience"
                            value={editData.experience}
                            onChange={handleInputChange}
                            className="w-full h-10 sm:h-12 pl-10 pr-8 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:border-primary focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 text-sm sm:text-base"
                          >
                            <option value="">Select experience level</option>
                            {EXPERIENCE_LEVELS.map((exp) => (
                              <option key={exp.value} value={exp.value}>
                                {exp.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white font-semibold hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-all duration-300 text-sm sm:text-base">
                          <Calendar className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">
                            {EXPERIENCE_LEVELS.find(
                              (exp) => exp.value === profile.experience
                            )?.label || profile.experience}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Preferred Language
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <Globe className="h-4 w-4" />
                          </div>
                          <select
                            name="language"
                            value={editData.language}
                            onChange={handleInputChange}
                            className="w-full h-10 sm:h-12 pl-10 pr-8 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:border-primary focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 text-sm sm:text-base"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.value} value={lang.value}>
                                {lang.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white font-semibold hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-all duration-300 text-sm sm:text-base">
                          <Globe className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">
                            {LANGUAGES.find((lang) => lang.value === profile.language)
                              ?.label || profile.language}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Crops */}
              <div className="p-4 sm:p-6 relative overflow-hidden">
                {/* Section background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-transparent dark:from-emerald-900/10 dark:to-transparent"></div>
                
                <div className="relative z-10">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl">
                      <Wheat className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span>Crops</span>
                  </h2>

                  {isEditing ? (
                    <div className="space-y-4 sm:space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {CROP_OPTIONS.map((crop) => (
                          <button
                            key={crop.name}
                            type="button"
                            onClick={() => handleCropToggle(crop.name)}
                            className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 hover:scale-[1.02] transform ${
                              editData.crop.includes(crop.name)
                                ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-primary/50 bg-white dark:bg-gray-700 hover:shadow-md"
                            }`}
                          >
                            <span className="text-base sm:text-lg">{crop.icon}</span>
                            <span className="text-xs sm:text-sm font-semibold">{crop.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="group">
                        <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Other crops (optional)
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Sprout className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            name="customCrop"
                            value={editData.customCrop}
                            onChange={handleInputChange}
                            placeholder="Enter other crops you grow"
                            className="w-full h-10 sm:h-12 pl-10 pr-3 sm:pr-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:border-primary focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 placeholder:text-gray-400 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {profile.crop?.map((crop, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-1 sm:space-x-2 bg-primary/10 text-primary px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-primary/20 hover:bg-primary/20 transition-all duration-300"
                        >
                          <span className="text-sm sm:text-base">
                            {CROP_OPTIONS.find((option) => option.name === crop)
                              ?.icon || "🌱"}
                          </span>
                          <span>{crop}</span>
                        </span>
                      )) || (
                        <span className="text-gray-500 dark:text-gray-400 italic text-sm">
                          No crops selected
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        username: profile.username,
                        location: profile.location || '',
                        farmsize: profile.farmsize || '',
                        experience: profile.experience || '',
                        language: profile.language || '',
                        crop: profile.crop || [],
                        customCrop: '',
                      });
                    }}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
