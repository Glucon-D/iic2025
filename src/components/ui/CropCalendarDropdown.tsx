"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Thermometer,
  CloudRain,
  Loader2,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { weatherService } from "@/services/weatherService";
import cropCalendarData from "@/utils/Calender/calender.json";

interface CropData {
  cropId: number;
  cropName: string;
  cropIcon: string;
  weather: {
    minTemperatureC: number;
    maxTemperatureC: number;
    rainfallMinMm: number;
    rainfallMaxMm: number;
  };
  suitability: Array<{
    state: string;
    months: number[];
    cities: string[];
  }>;
}

interface WeatherData {
  ui: {
    city: string;
    country: string;
    today: {
      min: number;
      max: number;
      humidity: number;
    } | null;
    days: Array<{
      dateKey: string;
      label: string;
      min: number;
      max: number;
      humidity: number;
    }>;
  };
  raw: {
    current: any;
    forecast: any;
  } | null;
}

interface CropCalendarData {
  city: string;
  fetchDate: string;
  weatherData: WeatherData;
  suitableCrops: Array<{
    date: string;
    crops: Array<{
      cropId: number;
      cropName: string;
      cropIcon: string;
      suitabilityScore: number;
    }>;
  }>;
}

const CROP_CALENDAR_CACHE_KEY = "crop_calendar_cache";

export function CropCalendarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarData, setCalendarData] = useState<CropCalendarData | null>(
    null
  );
  const [editCity, setEditCity] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get today's date key
  const getTodayKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Read cache from localStorage
  const readCache = (): Record<string, CropCalendarData> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(CROP_CALENDAR_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Write cache to localStorage
  const writeCache = (cache: Record<string, CropCalendarData>) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CROP_CALENDAR_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn("Failed saving crop calendar cache", e);
    }
  };

  // Get user location using OpenCage (GPS or IP)
  const getUserLocation = async (): Promise<string> => {
    try {
      // Try GPS + OpenCage geocoding first
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const opencageKey = process.env.NEXT_PUBLIC_OPENCAGE_API;

                if (opencageKey) {
                  const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${opencageKey}`
                  );

                  if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                      const result = data.results[0];
                      const city =
                        result.components.city ||
                        result.components.town ||
                        result.components.village ||
                        result.components.county;

                      if (city) {
                        resolve(city);
                        return;
                      }
                    }
                  }
                }

                // Fallback to IP location if OpenCage fails
                const ipLocation = await getLocationFromIP();
                resolve(ipLocation);
              } catch (error) {
                console.warn("GPS geocoding failed:", error);
                const ipLocation = await getLocationFromIP();
                resolve(ipLocation);
              }
            },
            async () => {
              // GPS permission denied or failed
              const ipLocation = await getLocationFromIP();
              resolve(ipLocation);
            },
            { timeout: 10000 }
          );
        });
      }
    } catch (error) {
      console.warn("GPS location failed:", error);
    }

    // Fallback to IP location
    return getLocationFromIP();
  };

  // Get location from IP with multiple fallbacks
  const getLocationFromIP = async (): Promise<string> => {
    try {
      // Try ipapi.co first
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city) {
            return data.city;
          }
        }
      } catch (error) {
        console.log("ipapi.co failed, trying alternative...");
      }

      // Fallback to ip-api.com
      try {
        const response = await fetch("http://ip-api.com/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city) {
            return data.city;
          }
        }
      } catch (error) {
        console.log("ip-api.com also failed");
      }
    } catch (error) {
      console.warn("IP location failed:", error);
    }

    return "New Delhi";
  };

  // Calculate crop suitability based on weather conditions
  const calculateCropSuitability = (
    crop: CropData,
    temperature: number,
    humidity: number,
    city: string
  ): number => {
    let score = 0;
    const currentMonth = new Date().getMonth() + 1;

    // Temperature suitability (40% weight)
    const tempRange =
      crop.weather.maxTemperatureC - crop.weather.minTemperatureC;
    const tempCenter =
      (crop.weather.maxTemperatureC + crop.weather.minTemperatureC) / 2;
    const tempDiff = Math.abs(temperature - tempCenter);
    const tempScore = Math.max(0, 1 - tempDiff / (tempRange / 2));
    score += tempScore * 0.4;

    // Seasonal suitability (40% weight)
    const suitableRegion = crop.suitability.find(
      (region) =>
        region.cities.some((c) =>
          c.toLowerCase().includes(city.toLowerCase())
        ) || region.state.toLowerCase().includes(city.toLowerCase())
    );

    if (suitableRegion && suitableRegion.months.includes(currentMonth)) {
      score += 0.4;
    }

    // Humidity consideration (20% weight)
    const humidityScore = humidity > 50 ? 0.2 : 0.1;
    score += humidityScore;

    return Math.min(1, score);
  };

  // Generate next 5 days with suitable crops
  const generateCropCalendar = (weatherData: WeatherData, city: string) => {
    const calendar = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      // Get weather for this day
      const dayWeather =
        i === 0 ? weatherData.ui.today : weatherData.ui.days[i - 1];
      const avgTemp = dayWeather ? (dayWeather.max + dayWeather.min) / 2 : 25;
      const humidity = dayWeather ? dayWeather.humidity : 60;

      // Calculate suitable crops
      const suitableCrops = cropCalendarData
        .map((crop) => ({
          cropId: crop.cropId,
          cropName: crop.cropName,
          cropIcon: crop.cropIcon,
          suitabilityScore: calculateCropSuitability(
            crop,
            avgTemp,
            humidity,
            city
          ),
        }))
        .filter((crop) => crop.suitabilityScore > 0.3)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, 3); // Top 3 suitable crops

      calendar.push({
        date: dateKey,
        crops: suitableCrops,
      });
    }

    return calendar;
  };

  // Load crop calendar data
  const loadCropCalendar = async (city?: string) => {
    setLoading(true);
    setError("");

    try {
      const targetCity = city || (await getUserLocation());
      const today = getTodayKey();
      const cache = readCache();
      const cacheKey = targetCity.toLowerCase();

      // Check cache first
      if (cache[cacheKey] && cache[cacheKey].fetchDate === today) {
        setCalendarData(cache[cacheKey]);
        setEditCity(targetCity);
        setLoading(false);
        return;
      }

      let weatherData;
      try {
        // Fetch fresh weather data
        weatherData = await weatherService.getForecast(targetCity);
      } catch (weatherError: any) {
        // If weather API fails, create mock weather data
        console.warn("Weather API failed, using mock data:", weatherError);
        weatherData = {
          ui: {
            city: targetCity,
            country: "",
            today: {
              min: 20,
              max: 30,
              humidity: 60,
            },
            days: Array.from({ length: 5 }, (_, i) => ({
              dateKey: getTodayKey(),
              label: `Day ${i + 1}`,
              min: 18 + Math.random() * 5,
              max: 28 + Math.random() * 8,
              humidity: 50 + Math.random() * 30,
            })),
          },
          raw: null,
        };
      }

      // Generate crop calendar
      const suitableCrops = generateCropCalendar(weatherData, targetCity);

      const newCalendarData: CropCalendarData = {
        city: targetCity,
        fetchDate: today,
        weatherData,
        suitableCrops,
      };

      // Update cache
      cache[cacheKey] = newCalendarData;
      writeCache(cache);

      setCalendarData(newCalendarData);
      setEditCity(targetCity);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Crop calendar error:", err);
      setError(err.message || "Failed to load crop calendar");
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown toggle
  const handleToggle = async () => {
    if (!isOpen && !calendarData) {
      await loadCropCalendar();
    }
    setIsOpen(!isOpen);
  };

  // Handle city update
  const handleUpdateCity = async () => {
    if (!editCity.trim()) return;
    await loadCropCalendar(editCity.trim());
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      setEditCity(calendarData?.city || "");
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-accent/30 hover:bg-accent/50 text-foreground transition-all duration-200 border border-border/50"
        title="Crop Calendar - View suitable crops for the coming days"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span className="hidden lg:inline text-sm font-medium">
          Crop Calendar
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                Crop Calendar
              </h3>
              <button
                onClick={() => loadCropCalendar()}
                disabled={loading}
                className="p-1 rounded-lg hover:bg-accent/50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter city name"
                    onKeyPress={(e) => e.key === "Enter" && handleUpdateCity()}
                  />
                  <button
                    onClick={handleUpdateCity}
                    className="px-2 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm text-muted-foreground">
                    {calendarData?.city || "Loading..."}
                  </span>
                  <button
                    onClick={handleEditToggle}
                    className="p-1 rounded-lg hover:bg-accent/50 transition-colors"
                    title="Edit location"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading crop data...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => loadCropCalendar()}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            ) : calendarData ? (
              <div className="space-y-3">
                {calendarData.suitableCrops.map((day, index) => (
                  <div
                    key={day.date}
                    className="bg-card p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">
                        {index === 0 ? "Today" : `Day ${index + 1}`}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {day.date}
                      </span>
                    </div>

                    {day.crops.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {day.crops.map((crop) => (
                          <div
                            key={crop.cropId}
                            className="flex flex-col items-center p-2 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors"
                            title={`${crop.cropName} - ${Math.round(
                              crop.suitabilityScore * 100
                            )}% suitable`}
                          >
                            <div
                              className="w-6 h-6 mb-1 text-primary"
                              dangerouslySetInnerHTML={{
                                __html: crop.cropIcon,
                              }}
                            />
                            <span className="text-xs text-center text-foreground font-medium">
                              {crop.cropName}
                            </span>
                            <div className="w-full bg-muted rounded-full h-1 mt-1">
                              <div
                                className="bg-primary h-1 rounded-full"
                                style={{
                                  width: `${crop.suitabilityScore * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No suitable crops for this day
                      </p>
                    )}
                  </div>
                ))}

                {/* Weather Summary */}
                {calendarData.weatherData?.ui?.today && (
                  <div className="bg-card p-3 rounded-lg border border-border mt-3">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Current Weather
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span>
                          {Math.round(calendarData.weatherData.ui.today.min)}°-
                          {Math.round(calendarData.weatherData.ui.today.max)}°C
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CloudRain className="h-3 w-3 text-blue-500" />
                        <span>
                          {Math.round(
                            calendarData.weatherData.ui.today.humidity
                          )}
                          % humidity
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
