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
      case 'clear': return 'from-yellow-400/20 via-orange-300/20 to-red-400/20';
      case 'clouds': return 'from-gray-400/20 via-slate-300/20 to-gray-500/20';
      case 'rain': return 'from-blue-400/20 via-indigo-300/20 to-blue-600/20';
      case 'snow': return 'from-blue-100/20 via-white/20 to-blue-200/20';
      default: return 'from-muted/50 to-accent/50';
    }
  };

  // Helper function to get weather animation
  const getWeatherAnimation = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'rain': return 'animate-bounce';
      case 'clouds': return 'animate-pulse';
      case 'clear': return 'animate-pulse';
      default: return '';
    }
  };

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
        setLoadingProgress(prev => prev < 90 ? prev + 10 : prev);
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
    <div className="animate-pulse p-6">
      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
      <div className="h-12 bg-muted rounded w-1/2 mb-6"></div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl"></div>
        ))}
      </div>
    </div>
  );

  // Error State Component
  const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <CloudOff className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Weather Unavailable</h3>
      <p className="text-muted-foreground mb-6">{error}</p>
      <button 
        onClick={onRetry}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
      >
        Try Again
      </button>
    </div>
  );

  // Weather Icon Component
  const WeatherIcon = ({ iconUrl, main, size = "w-16 h-16" }: { iconUrl?: string; main?: string; size?: string }) => {
    const animation = getWeatherAnimation(main || '');
    
    return iconUrl ? (
      <img
        src={iconUrl}
        alt={main || "Weather"}
        className={`${size} drop-shadow-lg ${animation}`}
      />
    ) : (
      <div className={`${size} bg-primary/20 rounded-full flex items-center justify-center`}>
        <span className="text-2xl">☀</span>
      </div>
    );
  };

  return (
    <>
      <div className="">
        <button
          onClick={() => setOpen(true)}
          className="flex relative p-1.5 sm:p-2 rounded-xl border border-border/50 bg-background/60 hover:bg-accent/50 text-foreground transition-all duration-200"
          aria-label="Open weather app"
          title={cityLabel ? `Weather • ${cityLabel}` : "Weather"}
        >
          {todayIconUrl ? (
            <img
              src={todayIconUrl}
              alt="Weather"
              className="w-5 h-5 sm:w-7 sm:h-7 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-medium text-muted-foreground">
              N/A
            </div>
          )}
        </button>

        {open &&
          mounted &&
          createPortal(
            <div
              className={`fixed inset-0 z-[60] flex ${isMobile ? 'items-end' : 'items-center'} justify-center ${isMobile ? 'p-0' : 'p-2 sm:p-4'} backdrop-blur-md bg-background/40`}
              onClick={() => setOpen(false)}
            >
              <div
                className={`relative w-full max-w-5xl bg-card border border-border shadow-2xl ${isMobile ? 'rounded-t-2xl max-h-[85vh]' : 'rounded-2xl max-h-[90vh]'} overflow-auto`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Mobile swipe indicator */}
                {isMobile && (
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-12 h-1 bg-muted rounded-full"></div>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6">
                    {/* Loading Progress Bar */}
                    <div className="w-full max-w-xs mb-6">
                      <div className="w-full bg-muted rounded-full h-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-muted-foreground mb-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-lg">Loading weather data...</span>
                    </div>
                    
                    <WeatherSkeleton />
                  </div>
                ) : error ? (
                  <ErrorState error={error} onRetry={() => load()} />
                ) : (
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Left Panel - Current Weather */}
                    <div className={`lg:w-1/5 bg-gradient-to-br ${getWeatherGradient(data?.ui?.today?.main || '')} p-4 sm:p-6 flex flex-col justify-between backdrop-blur-sm`}>
                      {/* City Edit */}
                      <div className="flex items-center bg-background/70 backdrop-blur-sm rounded-xl overflow-hidden mb-4 shadow-sm border border-border/50">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                              onKeyDown={handleKeyPress}
                              placeholder="Enter city name"
                              className="flex-1 px-4 py-2.5 bg-transparent outline-none text-foreground placeholder-muted-foreground text-sm"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveCity}
                              className="p-2.5 bg-primary hover:bg-primary/90 transition-colors"
                              title="Save city"
                            >
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </button>
                            <button
                              onClick={handleEditToggle}
                              className="p-2.5 bg-muted hover:bg-muted/80 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 px-4 py-2.5 text-foreground text-sm font-medium">
                              {cityLabel || "Select city"}
                            </div>
                            <button
                              onClick={handleEditToggle}
                              className="p-2.5 hover:bg-muted/50 transition-colors rounded-lg"
                              title="Edit city"
                            >
                              <Edit3 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Current Temperature */}
                      <div className="text-center flex-1 flex flex-col justify-center">
                        {/* Weather Icon */}
                        <div className="flex justify-center mb-4">
                          <WeatherIcon 
                            iconUrl={todayIconUrl}
                            main={data?.ui?.today?.main}
                            size="w-20 h-20"
                          />
                        </div>

                        <div className="text-5xl md:text-6xl font-extralight text-foreground mb-3 tracking-tight">
                          {currentTemp !== null ? `${currentTemp}°` : "__°"}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                          CELSIUS
                        </div>

                        {/* Weather Description */}
                        <div className="text-foreground/90 text-base font-medium capitalize mb-1 mt-4">
                          {data?.ui?.today?.main?.toLowerCase() || "Clear sky"}
                        </div>
                      </div>

                      {/* City Display */}
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-4 px-6 rounded-xl font-semibold text-lg shadow-lg mt-8">
                        {cityLabel.toUpperCase() || "CITY"}
                      </div>
                    </div>

                    {/* Right Panel - Details */}
                    <div className="lg:w-4/5 bg-muted/30 p-3 sm:p-5">
                      {/* Close Button */}
                      <button
                        onClick={() => setOpen(false)}
                        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-accent transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>

                      {/* Tab Navigation */}
                      <div className="flex gap-8 mb-5">
                        <button
                          onClick={() => setActiveTab("today")}
                          className={`text-lg font-medium pb-2 border-b-2 transition-all duration-200 ${
                            activeTab === "today"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setActiveTab("week")}
                          className={`text-lg font-medium pb-2 border-b-2 transition-all duration-200 ${
                            activeTab === "week"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Week
                        </button>
                      </div>

                      {/* Today's Highlights */}
                      {activeTab === "today" && (
                        <div>
                          <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                              Today's Highlight
                            </h2>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {/* Wind */}
                            <div className="group bg-card p-3 sm:p-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border border-border hover:border-primary/50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm group-hover:text-foreground transition-colors">
                                  Wind
                                </h4>
                                <Wind className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                {additionalData?.windSpeed ||
                                  Math.round(
                                    (data?.ui?.today?.wind || 0) * 3.6
                                  )}{" "}
                                <span className="text-sm font-normal text-muted-foreground">
                                  km/hr
                                </span>
                              </div>
                            </div>

                            {/* Visibility */}
                            <div className="group bg-card p-3 sm:p-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border border-border hover:border-primary/50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm group-hover:text-foreground transition-colors">
                                  Visibility
                                </h4>
                                <Eye className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                {additionalData?.visibility || 10}
                                <span className="text-sm font-normal text-muted-foreground">
                                  km
                                </span>
                              </div>
                            </div>

                            {/* Humidity */}
                            <div className="group bg-card p-3 sm:p-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border border-border hover:border-primary/50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm group-hover:text-foreground transition-colors">
                                  Humidity
                                </h4>
                                <Droplets className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                {additionalData?.humidity ||
                                  data?.ui?.today?.humidity ||
                                  0}
                                <span className="text-sm font-normal text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Pressure */}
                            <div className="group bg-card p-3 sm:p-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border border-border hover:border-primary/50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm group-hover:text-foreground transition-colors">
                                  Pressure
                                </h4>
                                <Gauge className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                {additionalData?.pressure || 1013}
                                <span className="text-sm font-normal text-muted-foreground">
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
                          <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                              Next 5 Days Updates
                            </h2>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                            {data?.ui?.days?.slice(1, 6).map((day, index) => (
                              <div
                                key={day.dateKey}
                                className="group bg-card p-2 sm:p-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border border-border hover:border-primary/50"
                              >
                                <h3 className="text-center border-b border-border pb-2 mb-3 font-medium text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                  {day.dateKey}
                                </h3>

                                <div className="flex justify-center mb-2">
                                  <WeatherIcon 
                                    iconUrl={day.iconUrl}
                                    main={day.main}
                                    size="w-10 h-10"
                                  />
                                </div>

                                <div className="text-center font-bold text-lg mb-2 text-foreground">
                                  {Math.round((day.max + day.min) / 2)}°C
                                </div>

                                <div className="text-muted-foreground text-xs space-y-1">
                                  <div className="capitalize text-center">
                                    {day.main.toLowerCase()}
                                  </div>
                                  <div className="text-center">
                                    Humidity: {day.humidity}%
                                  </div>
                                  <div className="text-center">
                                    Wind: {Math.round(day.wind * 3.6)} km/hr
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
