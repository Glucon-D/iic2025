// Weather service for fetching and caching weather data
// This service provides current weather and 7-day forecast functionality

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
  raw: {
    current: any;
    forecast: any;
  } | null;
  dateKey: string;
  city: string;
}

interface LocationData {
  city?: string;
  country?: string;
}

// Location service using OpenCage for GPS and IP-based location
const nudgesService = {
  // Get location using GPS + OpenCage geocoding
  getLocationFromGPS: async (): Promise<LocationData> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({});
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const opencageKey = process.env.NEXT_PUBLIC_OPENCAGE_API;

            if (!opencageKey) {
              console.warn(
                "OpenCage API key not found, falling back to IP location"
              );
              const ipLocation = await nudgesService.getLocationFromIP();
              resolve(ipLocation);
              return;
            }

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
                const country = result.components.country;

                if (city) {
                  resolve({ city, country });
                  return;
                }
              }
            }

            // Fallback to IP location if geocoding fails
            const ipLocation = await nudgesService.getLocationFromIP();
            resolve(ipLocation);
          } catch (error) {
            console.warn("GPS geocoding failed:", error);
            const ipLocation = await nudgesService.getLocationFromIP();
            resolve(ipLocation);
          }
        },
        async () => {
          // GPS permission denied or failed
          const ipLocation = await nudgesService.getLocationFromIP();
          resolve(ipLocation);
        },
        { timeout: 10000 }
      );
    });
  },

  getLocationFromIP: async (): Promise<LocationData> => {
    try {
      // Try multiple IP location services for better reliability
      let locationData: LocationData = {};

      // Try ipapi.co first
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city && data.country) {
            locationData = { city: data.city, country: data.country };
          }
        }
      } catch (error) {
        console.log("ipapi.co failed, trying alternative...");
      }

      // Fallback to ip-api.com if first service fails
      if (!locationData.city) {
        try {
          const response = await fetch("http://ip-api.com/json/");
          if (response.ok) {
            const data = await response.json();
            if (data.city && data.country) {
              locationData = { city: data.city, country: data.country };
            }
          }
        } catch (error) {
          console.log("ip-api.com also failed");
        }
      }

      return locationData;
    } catch (error) {
      console.warn("Failed to get location from IP:", error);
      return {};
    }
  },
};

const WEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const WEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Use environment variable for API key
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "";

// Local storage keys
const WEATHER_CITY_KEY = "weather_city";
const WEATHER_CACHE_KEY = "weather_cache";

// Helper functions
const todayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const readCache = (): Record<string, WeatherData> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache: Record<string, WeatherData>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed saving weather cache", e);
  }
};

const saveCity = (city: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEATHER_CITY_KEY, city);
};

const getSavedCity = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(WEATHER_CITY_KEY) || "";
};

const iconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

// Process 5-day/3-hour forecast data into daily summaries
const processForecast = (forecastJson: any) => {
  const byDate = new Map();
  (forecastJson?.list || []).forEach((entry: any) => {
    const date = new Date(entry.dt * 1000);
    const dateKey = date.toISOString().slice(0, 10);
    let bucket = byDate.get(dateKey);
    if (!bucket) {
      bucket = {
        temps: [],
        humidities: [],
        winds: [],
        icons: [],
        mains: [],
      };
      byDate.set(dateKey, bucket);
    }
    bucket.temps.push(entry.main?.temp);
    bucket.humidities.push(entry.main?.humidity);
    bucket.winds.push(entry.wind?.speed);
    const w = (entry.weather && entry.weather[0]) || {};
    if (w.icon) bucket.icons.push(w.icon);
    if (w.main) bucket.mains.push(w.main);
  });

  const days = Array.from(byDate.entries())
    .slice(0, 7)
    .map(([dateKey, b]: [string, any]) => {
      const date = new Date(dateKey);
      const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
      const dayNum = date.getDate();
      const month = date.toLocaleDateString(undefined, { month: "short" });

      const avg = (arr: number[]) => {
        const nums = arr.filter((x) => typeof x === "number");
        return nums.length ? nums.reduce((a, c) => a + c, 0) / nums.length : 0;
      };

      const icon = b.icons[0] || "01d";
      const main = b.mains[0] || "";

      return {
        dateKey,
        label: `${weekday} ${dayNum} ${month}`,
        icon,
        iconUrl: iconUrl(icon),
        main,
        min: Math.round(
          Math.min(...b.temps.filter((n: any) => typeof n === "number"))
        ),
        max: Math.round(
          Math.max(...b.temps.filter((n: any) => typeof n === "number"))
        ),
        humidity: Math.round(avg(b.humidities)),
        wind: Math.round(avg(b.winds)),
      };
    });

  return {
    city: forecastJson?.city?.name || "",
    country: forecastJson?.city?.country || "",
    cnt: days.length,
    today: days[0] || null,
    days,
  };
};

// Build API URLs
const buildCurrentUrl = (city: string) => {
  const params = new URLSearchParams({ q: city, units: "metric" });
  if (API_KEY) params.append("appid", API_KEY);
  return `${WEATHER_CURRENT_URL}?${params.toString()}`;
};

const buildForecastUrl = (city: string) => {
  const params = new URLSearchParams({ q: city, units: "metric" });
  if (API_KEY) params.append("appid", API_KEY);
  return `${WEATHER_FORECAST_URL}?${params.toString()}`;
};

export const weatherService = {
  iconUrl,
  getSavedCity,
  saveCity,

  getDefaultCity: async (): Promise<string> => {
    // Try saved city first
    const saved = getSavedCity();
    if (saved) return saved;

    try {
      // Try GPS + OpenCage geocoding first for better accuracy
      const gpsLoc = await nudgesService.getLocationFromGPS();
      if (gpsLoc?.city) {
        saveCity(gpsLoc.city);
        return gpsLoc.city;
      }

      // Fallback to IP-based location
      const ipLoc = await nudgesService.getLocationFromIP();
      if (ipLoc?.city) {
        saveCity(ipLoc.city);
        return ipLoc.city;
      }
    } catch (error) {
      console.warn("Failed to get location:", error);
    }

    // Final fallback
    const fallback = "New Delhi";
    saveCity(fallback);
    return fallback;
  },

  // Returns weather data with UI and raw data
  getForecast: async (desiredCity?: string): Promise<WeatherData> => {
    const city = desiredCity || (await weatherService.getDefaultCity());
    const date = todayKey();

    const cache = readCache();
    const entry = cache[city];

    // Return cached data if valid and from today
    if (entry && entry.dateKey === date && entry.ui && entry.raw) {
      return { ...entry, city };
    }

    // If API key missing, return placeholder data
    if (!API_KEY) {
      console.warn(
        "NEXT_PUBLIC_OPENWEATHER_API_KEY is not set. Weather widget will show placeholder."
      );
      const ui = { city, country: "", cnt: 0, today: null, days: [] };
      const payload: WeatherData = { ui, raw: null, dateKey: date, city };
      cache[city] = payload;
      writeCache(cache);
      return payload;
    }

    try {
      // Fetch current and forecast data
      const [curRes, forecastRes] = await Promise.all([
        fetch(buildCurrentUrl(city)),
        fetch(buildForecastUrl(city)),
      ]);

      if (!curRes.ok) throw new Error(`Weather API (current) ${curRes.status}`);
      if (!forecastRes.ok)
        throw new Error(`Weather API (forecast) ${forecastRes.status}`);

      const current = await curRes.json();
      const forecast = await forecastRes.json();

      const ui = processForecast(forecast);

      // Use current weather icon for today if available
      const curIcon = current?.weather?.[0]?.icon;
      if (curIcon && ui.today) {
        ui.today.icon = curIcon;
        ui.today.iconUrl = iconUrl(curIcon);
        ui.today.main = current?.weather?.[0]?.main || ui.today.main;
      }

      const raw = { current, forecast };
      const payload: WeatherData = { ui, raw, dateKey: date, city };

      // Cache the result
      cache[city] = payload;
      writeCache(cache);
      saveCity(city);

      return payload;
    } catch (error) {
      console.error("Weather API error:", error);
      throw error;
    }
  },

  // Force refresh weather data
  refreshForecast: async (city?: string): Promise<WeatherData> => {
    const targetCity =
      city || getSavedCity() || (await weatherService.getDefaultCity());
    const date = todayKey();

    if (!API_KEY) return weatherService.getForecast(targetCity);

    try {
      const [curRes, forecastRes] = await Promise.all([
        fetch(buildCurrentUrl(targetCity)),
        fetch(buildForecastUrl(targetCity)),
      ]);

      if (!curRes.ok) throw new Error(`Weather API (current) ${curRes.status}`);
      if (!forecastRes.ok)
        throw new Error(`Weather API (forecast) ${forecastRes.status}`);

      const current = await curRes.json();
      const forecast = await forecastRes.json();
      const ui = processForecast(forecast);

      const curIcon = current?.weather?.[0]?.icon;
      if (curIcon && ui.today) {
        ui.today.icon = curIcon;
        ui.today.iconUrl = iconUrl(curIcon);
        ui.today.main = current?.weather?.[0]?.main || ui.today.main;
      }

      const cache = readCache();
      const payload: WeatherData = {
        ui,
        raw: { current, forecast },
        dateKey: date,
        city: targetCity,
      };

      cache[targetCity] = payload;
      writeCache(cache);
      saveCity(targetCity);

      return payload;
    } catch (error) {
      console.error("Weather refresh error:", error);
      throw error;
    }
  },
};
