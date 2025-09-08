"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Edit3,
  Loader2,
  X,
  Wind,
  Eye,
  Droplets,
  Gauge,
  Check,
  CloudOff,
} from "lucide-react";
import { weatherService } from "@/services/weatherService";

interface WeatherData {
  ui: {
    city: string;
    country: string;
    cnt: number;
    today: {
      dateKey: string;
      label: string;
      icon: string;
      iconUrl: string;
      main: string;
      min: number;
      max: number;
      humidity: number;
      wind: number;
    } | null;
    days: Array<{
      dateKey: string;
      label: string;
      icon: string;
      iconUrl: string;
      main: string;
      min: number;
      max: number;
      humidity: number;
      wind: number;
    }>;
  };
  raw: any;
  dateKey: string;
  city: string;
}

const WeatherWidget = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [editCity, setEditCity] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const todayIconUrl = useMemo(() => data?.ui?.today?.iconUrl, [data]);
  const cityLabel = useMemo(() => data?.ui?.city || data?.city || "", [data]);
  const currentTemp = useMemo(() => {
    if (data?.ui?.today) {
      return Math.round((data.ui.today.max + data.ui.today.min) / 2);
    }
    return null;
  }, [data]);

  // Helper function to get weather-based gradient
  const getWeatherGradient = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case "clear":
        return "from-gradient-to-br from-amber-400/30 via-yellow-300/20 to-orange-400/30";
      case "clouds":
        return "from-slate-400/30 via-gray-300/20 to-slate-500/30";
      case "rain":
        return "from-blue-500/30 via-indigo-400/20 to-cyan-500/30";
      case "snow":
        return "from-blue-100/30 via-white/20 to-blue-200/30";
      default:
        return "from-violet-500/20 via-purple-400/10 to-indigo-500/20";
    }
  };

  // Helper function to get weather animation
  const getWeatherAnimation = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case "rain":
        return "animate-bounce";
      case "clouds":
        return "animate-pulse";
      case "clear":
        return "animate-pulse";
      default:
        return "";
    }
  };

  // Mobile detection
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -100) {
      setOpen(false); // Swipe down to close
    }
  };

  const load = async (city?: string) => {
    setLoading(true);
    setError("");
    try {
      const payload = await weatherService.getForecast(city);
      setData(payload);
      setEditCity(payload.city);
      setIsEditing(false);

      // Save to local cache
      weatherService.saveCity(payload.city);
    } catch (e: any) {
      setError(e.message || "Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    load();
  }, []);

  // Loading progress effect
  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [loading]);

  const handleSaveCity = async () => {
    if (!editCity.trim()) return;
    await load(editCity.trim());
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - restore original city name
      setEditCity(cityLabel);
      setIsEditing(false);
    } else {
      // Start editing
      setEditCity(cityLabel);
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveCity();
    }
    if (e.key === "Escape") {
      setEditCity(cityLabel);
      setIsEditing(false);
    }
  };

  // Get additional weather data from raw API response
  const getAdditionalWeatherData = () => {
    if (!data?.raw?.current) return null;

    const current = data.raw.current;
    return {
      visibility: Math.round((current.visibility || 0) / 1000), // Convert to km
      pressure: current.main?.pressure || 0,
      windSpeed: Math.round((current.wind?.speed || 0) * 3.6), // Convert m/s to km/h
      humidity: current.main?.humidity || 0,
    };
  };

  const additionalData = getAdditionalWeatherData();

  // Weather Skeleton Component
  const WeatherSkeleton = () => (
    <div className="animate-pulse p-8">
      <div className="flex flex-col items-center space-y-6">
        <div className="h-6 bg-gradient-to-r from-muted/60 to-muted rounded-full w-3/4"></div>
        <div className="h-16 bg-gradient-to-r from-muted/60 to-muted rounded-2xl w-1/2"></div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gradient-to-br from-muted/40 to-muted/60 rounded-2xl"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Error State Component
  const ErrorState = ({
    error,
    onRetry,
  }: {
    error: string;
    onRetry: () => void;
  }) => (
    <div className="text-center py-16">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full animate-pulse"></div>
        <div className="relative w-full h-full rounded-full bg-gradient-to-r from-red-100/80 to-orange-100/80 flex items-center justify-center backdrop-blur-sm">
          <CloudOff className="w-10 h-10 text-red-500" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Weather Unavailable
      </h3>
      <p className="text-muted-foreground mb-8 text-lg">{error}</p>
      <button
        onClick={onRetry}
        className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
      >
        Try Again
      </button>
    </div>
  );

  // Weather Icon Component
  const WeatherIcon = ({
    iconUrl,
    main,
    size = "w-16 h-16",
  }: {
    iconUrl?: string;
    main?: string;
    size?: string;
  }) => {
    const animation = getWeatherAnimation(main || "");

    return iconUrl ? (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-md opacity-60"></div>
        <img
          src={iconUrl}
          alt={main || "Weather"}
          className={`relative ${size} drop-shadow-2xl ${animation}`}
        />
      </div>
    ) : (
      <div
        className={`${size} bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg`}
      >
        <span className="text-3xl filter drop-shadow-lg">☀</span>
      </div>
    );
  };

  return (
    <>
      <div className="">
        <button
          onClick={() => setOpen(true)}
          className="group relative p-0.5 rounded-xl border-2 border-border/30 bg-gradient-to-br from-background/90 to-muted/50 hover:from-accent/60 hover:to-accent/40 text-foreground transition-all duration-300 backdrop-blur-md"
          aria-label="Open weather app"
          title={cityLabel ? `Weather • ${cityLabel}` : "Weather"}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {todayIconUrl ? (
            <img
              src={todayIconUrl}
              alt="Weather"
              className="relative w-6 h-6 sm:w-8 sm:h-8 shrink-0 drop-shadow-lg transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : loading ? (
            <Loader2 className="relative w-6 h-6 animate-spin text-primary drop-shadow-lg" />
          ) : (
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-bold bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/20 rounded-lg">
              N/A
            </div>
          )}
        </button>

        {open &&
          mounted &&
          createPortal(
            <div
              className={`fixed inset-0 z-[60] flex ${
                isMobile ? "items-end" : "items-center"
              } justify-center ${
                isMobile ? "p-0" : "p-4 sm:p-6"
              } backdrop-blur-xl bg-black/30`}
              onClick={() => setOpen(false)}
            >
              <div
                className={`relative w-full max-w-6xl bg-gradient-to-br from-card/95 to-background/95 border-2 border-border/50 shadow-2xl ${
                  isMobile
                    ? "rounded-t-3xl max-h-[90vh]"
                    : "rounded-3xl max-h-[85vh]"
                } overflow-hidden backdrop-blur-xl`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Animated background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>

                {/* Mobile swipe indicator */}
                {isMobile && (
                  <div className="relative flex justify-center pt-3 pb-2">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-muted to-muted/50 rounded-full"></div>
                  </div>
                )}

                {loading ? (
                  <div className="relative flex flex-col items-center justify-center h-full min-h-[500px] p-8">
                    {/* Animated loading background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 animate-pulse"></div>

                    {/* Loading Progress Bar */}
                    <div className="relative w-full max-w-md mb-8">
                      <div className="w-full bg-gradient-to-r from-muted/50 to-muted/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary via-accent to-primary h-2 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="relative flex items-center gap-4 text-muted-foreground mb-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
                        <Loader2 className="relative w-8 h-8 animate-spin text-primary drop-shadow-lg" />
                      </div>
                      <span className="text-xl font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Loading weather data...
                      </span>
                    </div>

                    <WeatherSkeleton />
                  </div>
                ) : error ? (
                  <div className="relative">
                    <ErrorState error={error} onRetry={() => load()} />
                  </div>
                ) : (
                  <div className="relative flex flex-col lg:flex-row h-full">
                    {/* Left Panel - Current Weather */}
                    <div
                      className={`lg:w-2/5 bg-gradient-to-br ${getWeatherGradient(
                        data?.ui?.today?.main || ""
                      )} p-6 sm:p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden`}
                    >
                      {/* Animated background elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-xl"></div>

                      {/* City Edit */}
                      <div className="relative flex items-center bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden mb-6 shadow-lg border border-white/30">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                              onKeyDown={handleKeyPress}
                              placeholder="Enter city name (Press Enter to save, Esc to cancel)"
                              className="flex-1 px-5 py-3.5 bg-transparent outline-none text-foreground placeholder-white/60 text-base font-medium"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveCity}
                              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500/90 to-green-500/90 hover:from-emerald-500 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-r-2xl backdrop-blur-sm border-l border-white/20 group"
                              title="Save city"
                            >
                              <div className="flex items-center space-x-2">
                                <Check className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                                <span className="text-white font-semibold text-sm">
                                  Save
                                </span>
                              </div>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 px-5 py-3.5 text-foreground text-base font-semibold">
                              {cityLabel || "Select city"}
                            </div>
                            <button
                              onClick={handleEditToggle}
                              className="p-3.5 hover:bg-white/20 transition-all duration-200 rounded-r-2xl group"
                              title="Edit city"
                            >
                              <Edit3 className="w-5 h-5 text-foreground/70 group-hover:text-foreground group-hover:scale-110 transition-all duration-200" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Current Temperature */}
                      <div className="relative text-center flex-1 flex flex-col justify-center">
                        {/* Weather Icon */}
                        <div className="flex justify-center mb-6">
                          <WeatherIcon
                            iconUrl={todayIconUrl}
                            main={data?.ui?.today?.main}
                            size="w-28 h-28"
                          />
                        </div>

                        <div className="text-6xl md:text-7xl font-thin text-foreground mb-4 tracking-tight drop-shadow-2xl">
                          {currentTemp !== null ? `${currentTemp}°` : "__°"}
                        </div>
                        <div className="text-sm text-foreground/60 uppercase tracking-widest mb-6 font-medium">
                          CELSIUS
                        </div>

                        {/* Weather Description */}
                        <div className="text-foreground text-xl font-semibold capitalize mb-2 mt-6 drop-shadow-lg">
                          {data?.ui?.today?.main?.toLowerCase() || "Clear sky"}
                        </div>
                      </div>

                      {/* City Display */}
                      <div className="relative bg-gradient-to-r from-foreground/90 to-foreground/80 text-background text-center py-5 px-8 rounded-2xl font-bold text-xl shadow-xl mt-8 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
                        <div className="relative">
                          {cityLabel.toUpperCase() || "CITY"}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Details */}
                    <div className="relative lg:w-3/5 bg-gradient-to-br from-muted/40 to-background/60 p-4 sm:p-6 backdrop-blur-sm">
                      {/* Close Button */}
                      <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-muted/50 hover:bg-destructive/20 hover:text-destructive transition-all duration-200 backdrop-blur-sm border border-border/30 group"
                      >
                        <X className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                      </button>

                      {/* Tab Navigation */}
                      <div className="flex gap-12 mb-8">
                        <button
                          onClick={() => setActiveTab("today")}
                          className={`relative text-xl font-semibold pb-3 transition-all duration-300 ${
                            activeTab === "today"
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Today
                          {activeTab === "today" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("week")}
                          className={`relative text-xl font-semibold pb-3 transition-all duration-300 ${
                            activeTab === "week"
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Week
                          {activeTab === "week" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                          )}
                        </button>
                      </div>

                      {/* Today's Highlights */}
                      {activeTab === "today" && (
                        <div>
                          <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-3">
                              Today's Highlights
                            </h2>
                            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full"></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {/* Wind */}
                            <div className="group relative bg-gradient-to-br from-card/80 to-background/60 p-5 sm:p-6 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-border/50 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative flex items-center justify-between mb-3">
                                <h4 className="text-muted-foreground font-semibold text-base group-hover:text-foreground transition-colors">
                                  Wind
                                </h4>
                                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <Wind className="w-6 h-6 text-green-500 drop-shadow-sm" />
                                </div>
                              </div>
                              <div className="relative text-2xl font-bold text-foreground">
                                {additionalData?.windSpeed ||
                                  Math.round(
                                    (data?.ui?.today?.wind || 0) * 3.6
                                  )}{" "}
                                <span className="text-base font-semibold text-muted-foreground">
                                  km/hr
                                </span>
                              </div>
                            </div>

                            {/* Visibility */}
                            <div className="group relative bg-gradient-to-br from-card/80 to-background/60 p-5 sm:p-6 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-border/50 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative flex items-center justify-between mb-3">
                                <h4 className="text-muted-foreground font-semibold text-base group-hover:text-foreground transition-colors">
                                  Visibility
                                </h4>
                                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <Eye className="w-6 h-6 text-green-500 drop-shadow-sm" />
                                </div>
                              </div>
                              <div className="relative text-2xl font-bold text-foreground">
                                {additionalData?.visibility || 10}
                                <span className="text-base font-semibold text-muted-foreground">
                                  km
                                </span>
                              </div>
                            </div>

                            {/* Humidity */}
                            <div className="group relative bg-gradient-to-br from-card/80 to-background/60 p-5 sm:p-6 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-border/50 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative flex items-center justify-between mb-3">
                                <h4 className="text-muted-foreground font-semibold text-base group-hover:text-foreground transition-colors">
                                  Humidity
                                </h4>
                                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <Droplets className="w-6 h-6 text-green-500 drop-shadow-sm" />
                                </div>
                              </div>
                              <div className="relative text-2xl font-bold text-foreground">
                                {additionalData?.humidity ||
                                  data?.ui?.today?.humidity ||
                                  0}
                                <span className="text-base font-semibold text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Pressure */}
                            <div className="group relative bg-gradient-to-br from-card/80 to-background/60 p-5 sm:p-6 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-border/50 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative flex items-center justify-between mb-3">
                                <h4 className="text-muted-foreground font-semibold text-base group-hover:text-foreground transition-colors">
                                  Pressure
                                </h4>
                                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <Gauge className="w-6 h-6 text-green-500 drop-shadow-sm" />
                                </div>
                              </div>
                              <div className="relative text-2xl font-bold text-foreground">
                                {additionalData?.pressure || 1013}
                                <span className="text-base font-semibold text-muted-foreground">
                                  hPa
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Week Forecast */}
                      {activeTab === "week" && (
                        <div>
                          <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-3">
                              Next 5 Days Forecast
                            </h2>
                            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full"></div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                            {data?.ui?.days?.slice(1, 6).map((day, index) => (
                              <div
                                key={day.dateKey}
                                className="group relative bg-gradient-to-br from-card/80 to-background/60 p-4 sm:p-5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-border/50 backdrop-blur-sm overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative">
                                  <h3 className="text-center border-b border-border/50 pb-3 mb-4 font-bold text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    {day.label || day.dateKey}
                                  </h3>

                                  <div className="flex justify-center mb-3">
                                    <WeatherIcon
                                      iconUrl={day.iconUrl}
                                      main={day.main}
                                      size="w-12 h-12"
                                    />
                                  </div>

                                  <div className="text-center mb-3">
                                    <div className="font-bold text-lg text-foreground">
                                      {Math.round((day.max + day.min) / 2)}°C
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {Math.round(day.max)}° /{" "}
                                      {Math.round(day.min)}°
                                    </div>
                                  </div>

                                  <div className="text-muted-foreground text-xs space-y-2">
                                    <div className="capitalize text-center font-semibold">
                                      {day.main.toLowerCase()}
                                    </div>
                                    <div className="text-center bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg py-1 px-2">
                                      Humidity: {day.humidity}%
                                    </div>
                                    <div className="text-center bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg py-1 px-2">
                                      Wind: {Math.round(day.wind * 3.6)} km/hr
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    </>
  );
};

export default WeatherWidget;
