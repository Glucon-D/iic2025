"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Brain,
  Loader2,
  X,
  MapPin,
  Thermometer,
  Droplets,
  Sprout,
  Calendar,
  Target,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import { databaseService } from "@/utils/appwrite/database";
import { aiNudgesService } from "@/services/aiNudgesService";

interface NudgesData {
  nudges: string[];
  weather: {
    temperature: number;
    humidity: number;
    conditions: string;
    forecast: Array<{
      date: string;
      temp_min: number;
      temp_max: number;
      humidity: number;
      conditions: string;
    }>;
  };
  soil: {
    properties: {
      most_probable_soil_type: string;
      probabilities?: Array<{
        soil_type: string;
        probability: number;
      }>;
    };
  };
  location: string;
  crops: string[];
}

const AINudgesDropdown = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<NudgesData | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadNudges = async () => {
    if (!user) {
      setError("Please log in to get personalized nudges");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get user profile from database
      const userProfile = await databaseService.getUserByUserId(user.$id);
      if (!userProfile) {
        setError(
          "User profile not found. Please complete your profile in settings."
        );
        setLoading(false);
        return;
      }

      // Get location using GPS + OpenCage
      const location = await aiNudgesService.getLocationFromGPS();
      if (!location) {
        setError("Unable to detect location. Please enable location services.");
        setLoading(false);
        return;
      }

      // Generate AI nudges
      const nudgesResponse = await aiNudgesService.generateNudges({
        userProfile: {
          userId: user.$id, // Add userId for API call
          username: userProfile.username,
          location: userProfile.location,
          farmsize: userProfile.farmsize,
          crop: userProfile.crop,
          experience: userProfile.experience,
          language: userProfile.language,
        },
        location,
      });

      setData(nudgesResponse);
    } catch (err: any) {
      console.error("Failed to load AI nudges:", err);
      setError(err.message || "Failed to generate nudges. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!open && !data) {
      await loadNudges();
    }
    setOpen(!open);
  };

  const handleRefresh = async () => {
    setData(null);
    await loadNudges();
  };

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl border border-border/50 bg-background/60 hover:bg-accent/50 text-foreground transition-all duration-200"
        aria-label="AI Farming Nudges"
        title="Get AI-powered farming advice"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <Brain className="w-5 h-5 text-primary" />
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-background/40"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        AI Farming Nudges
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Personalized farming advice based on your profile and
                        current conditions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {data && (
                      <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        title="Refresh nudges"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Generating personalized farming advice...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-destructive text-lg mb-4">{error}</div>
                    <button
                      onClick={loadNudges}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : data ? (
                  <div className="space-y-6">
                    {/* Context Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Location & Weather */}
                      <div className="bg-accent/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">Location</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {data.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            <span>
                              {Math.round(data.weather.temperature)}°C
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            <span>{data.weather.humidity}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {data.weather.conditions}
                        </p>
                      </div>

                      {/* Crops */}
                      <div className="bg-accent/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="w-4 h-4 text-primary" />
                          <span className="font-medium">Your Crops</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {data.crops.map((crop, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Soil */}
                      <div className="bg-accent/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium">Soil Type</span>
                        </div>
                        <div className="space-y-1">
                          {data.soil.properties.probabilities ? (
                            data.soil.properties.probabilities
                              .slice(0, 2)
                              .map((soil, index) => (
                                <div key={index} className="text-xs">
                                  <span className="text-muted-foreground">
                                    {soil.soil_type} ({soil.probability}%)
                                  </span>
                                </div>
                              ))
                          ) : (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                {data.soil.properties.most_probable_soil_type}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Nudges */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Personalized Farming Tips
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {data.nudges.map((nudge, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary p-4 rounded-r-lg"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div className="prose prose-slate prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {nudge}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weather Forecast */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          5-Day Weather Forecast
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {data.weather.forecast.map((day, index) => (
                          <div
                            key={index}
                            className="bg-accent/30 rounded-lg p-3 text-center"
                          >
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Day {index + 1}
                            </p>
                            <p className="text-sm font-semibold">
                              {Math.round(day.temp_min)}° -{" "}
                              {Math.round(day.temp_max)}°
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {day.conditions}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {day.humidity}% humidity
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Get personalized farming advice based on your location,
                      crops, and current weather conditions.
                    </p>
                    <button
                      onClick={loadNudges}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Generate AI Nudges
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AINudgesDropdown;
