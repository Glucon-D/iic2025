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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 p-4 sm:p-6 lg:p-24 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl dark:shadow-green-500/20 border border-white/30 dark:border-gray-700/30 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex items-center space-x-3">
                  <Sprout className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Profile Settings
                  </h1>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Profile Content */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl dark:shadow-green-500/20 border border-white/30 dark:border-gray-700/30 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <span>Personal Information</span>
              </h2>

              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                    />
                  ) : (
                    <div className="h-12 px-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white">
                      {profile.username}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Tractor className="h-5 w-5 text-green-600" />
                <span>Farm Information</span>
              </h2>

              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        value={editData.location}
                        onChange={handleInputChange}
                        className="w-full h-12 px-4 pr-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={getLocation}
                        disabled={locationLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-green-500 focus:outline-none"
                      >
                        {locationLoading ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="h-12 px-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white">
                      {profile.location}
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Farm Size
                  </label>
                  {isEditing ? (
                    <select
                      name="farmsize"
                      value={editData.farmsize}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                    >
                      <option value="">Select farm size</option>
                      {FARM_SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="h-12 px-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white">
                      {FARM_SIZES.find(
                        (size) => size.value === profile.farmsize
                      )?.label || profile.farmsize}
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level
                  </label>
                  {isEditing ? (
                    <select
                      name="experience"
                      value={editData.experience}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                    >
                      <option value="">Select experience level</option>
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <option key={exp.value} value={exp.value}>
                          {exp.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="h-12 px-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white">
                      {EXPERIENCE_LEVELS.find(
                        (exp) => exp.value === profile.experience
                      )?.label || profile.experience}
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Language
                  </label>
                  {isEditing ? (
                    <select
                      name="language"
                      value={editData.language}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="h-12 px-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl flex items-center text-gray-900 dark:text-white">
                      {LANGUAGES.find((lang) => lang.value === profile.language)
                        ?.label || profile.language}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Crops */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Wheat className="h-5 w-5 text-green-600" />
                <span>Crops</span>
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {CROP_OPTIONS.map((crop) => (
                      <button
                        key={crop.name}
                        type="button"
                        onClick={() => handleCropToggle(crop.name)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                          editData.crop.includes(crop.name)
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "border-gray-200 dark:border-gray-600 hover:border-green-300 bg-white dark:bg-gray-700"
                        }`}
                      >
                        <span className="text-lg">{crop.icon}</span>
                        <span className="text-sm font-medium">{crop.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Other crops (optional)
                    </label>
                    <input
                      type="text"
                      name="customCrop"
                      value={editData.customCrop}
                      onChange={handleInputChange}
                      placeholder="Enter other crops you grow"
                      className="w-full h-12 px-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.crop?.map((crop, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      <span>
                        {CROP_OPTIONS.find((option) => option.name === crop)
                          ?.icon || "🌱"}
                      </span>
                      <span>{crop}</span>
                    </span>
                  )) || (
                    <span className="text-gray-500 dark:text-gray-400">
                      No crops selected
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
