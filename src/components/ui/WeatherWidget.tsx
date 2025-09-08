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

  const todayIconUrl = useMemo(() => data?.ui?.today?.iconUrl, [data]);
  const cityLabel = useMemo(() => data?.ui?.city || data?.city || "", [data]);
  const currentTemp = useMemo(() => {
    if (data?.ui?.today) {
      return Math.round((data.ui.today.max + data.ui.today.min) / 2);
    }
    return null;
  }, [data]);

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

  return (
    <>
      <div className="">
        <button
          onClick={() => setOpen(true)}
          className="hidden sm:flex relative p-2 rounded-xl border border-border/50 bg-background/60 hover:bg-accent/50 text-foreground transition-all duration-200"
          aria-label="Open weather app"
          title={cityLabel ? `Weather • ${cityLabel}` : "Weather"}
        >
          {todayIconUrl ? (
            <img
              src={todayIconUrl}
              alt="Weather"
              className="w-7 h-7 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <div className="w-7 h-7 flex items-center justify-center text-xs font-medium text-muted-foreground">
              N/A
            </div>
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
                className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-lg">Loading weather data...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-destructive text-lg mb-4">
                        {error}
                      </div>
                      <button
                        onClick={() => load()}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Left Panel - Current Weather */}
                    <div className="md:w-1/5 bg-gradient-to-br from-muted/50 to-accent/50 p-6 flex flex-col justify-between">
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
                              className="p-2.5 bg-primary hover:bg-primary/90 transition-colors"
                              title="Edit city"
                            >
                              <Edit3 className="w-4 h-4 text-primary-foreground" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Current Temperature */}
                      <div className="text-center flex-1 flex flex-col justify-center">
                        {/* Weather Icon */}
                        <div className="flex justify-center mb-3">
                          {todayIconUrl ? (
                            <img
                              src={todayIconUrl}
                              alt={data?.ui?.today?.main || "Weather"}
                              className="w-16 h-16 drop-shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-2xl">☀</span>
                            </div>
                          )}
                        </div>

                        <div className="text-4xl md:text-5xl font-thin text-foreground mb-2">
                          {currentTemp !== null ? `${currentTemp}°C` : "__°C"}
                        </div>

                        {/* Weather Description */}
                        <div className="text-foreground/80 text-base font-medium capitalize mb-1">
                          {data?.ui?.today?.main?.toLowerCase() || "Clear sky"}
                        </div>
                        <div className="text-muted-foreground text-sm capitalize">
                          {data?.ui?.today?.main?.toLowerCase() || "Clear"}
                        </div>
                      </div>

                      {/* City Display */}
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-4 px-6 rounded-xl font-semibold text-lg shadow-lg">
                        {cityLabel.toUpperCase() || "CITY"}
                      </div>
                    </div>

                    {/* Right Panel - Details */}
                    <div className="md:w-4/5 bg-muted/30 p-5">
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

                          <div className="grid grid-cols-2 gap-3">
                            {/* Wind */}
                            <div className="bg-card p-4 rounded-xl hover:shadow-md transition-all cursor-pointer border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm">
                                  Wind
                                </h4>
                                <Wind className="w-5 h-5 text-primary" />
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
                            <div className="bg-card p-4 rounded-xl hover:shadow-md transition-all cursor-pointer border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm">
                                  Visibility
                                </h4>
                                <Eye className="w-5 h-5 text-primary" />
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                {additionalData?.visibility || 10}
                                <span className="text-sm font-normal text-muted-foreground">
                                  km
                                </span>
                              </div>
                            </div>

                            {/* Humidity */}
                            <div className="bg-card p-4 rounded-xl hover:shadow-md transition-all cursor-pointer border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm">
                                  Humidity
                                </h4>
                                <Droplets className="w-5 h-5 text-primary" />
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
                            <div className="bg-card p-4 rounded-xl hover:shadow-md transition-all cursor-pointer border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-muted-foreground font-medium text-sm">
                                  Pressure
                                </h4>
                                <Gauge className="w-5 h-5 text-primary" />
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

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {data?.ui?.days?.slice(1, 6).map((day, index) => (
                              <div
                                key={day.dateKey}
                                className="bg-card p-3 rounded-xl hover:shadow-md transition-all cursor-pointer border border-border"
                              >
                                <h3 className="text-center border-b border-border pb-2 mb-3 font-medium text-xs text-muted-foreground">
                                  {day.dateKey}
                                </h3>

                                <div className="flex justify-center mb-2">
                                  <img
                                    src={day.iconUrl}
                                    alt={day.main}
                                    className="w-10 h-10"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='5'/%3E%3C/svg%3E";
                                    }}
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
