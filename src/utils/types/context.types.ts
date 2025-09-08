// Context types for enhanced AI chat with farming context
// Provides comprehensive typing for user context, weather, soil, and location data

// User context interface
export interface UserContext {
  userId: string;
  username: string;
  location: string;
  farmsize?: string;
  crops: string[];
  experience?: string;
  language?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Weather data interfaces
export interface WeatherForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  windSpeed: number;
  pressure: number;
  forecast: WeatherForecast[];
}

// Soil data interfaces
export interface SoilProbability {
  soil_type: string;
  probability: number;
}

export interface SoilData {
  most_probable_soil_type: string;
  probabilities: SoilProbability[];
  coordinates: [number, number];
}

// Location interface
export interface LocationData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Date/time context
export interface DateTimeContext {
  date: string;
  time: string;
  timezone: string;
  season: string;
}

// Main context data interface
export interface ContextData {
  user: UserContext;
  location: LocationData;
  currentDateTime: DateTimeContext;
  weather?: WeatherData;
  soil?: SoilData;
}

// Cache interfaces for database storage
export interface WeatherCache {
  $id?: string;
  locationKey: string;
  data: WeatherData;
  cachedAt: string;
  expiresAt: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface SoilCache {
  $id?: string;
  locationKey: string;
  data: SoilData;
  cachedAt: string;
  expiresAt: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Enhanced prompt interfaces
export interface ContextPrompt {
  systemPrompt: string;
  contextSummary: string;
  userProfile: string;
  environmentalData: string;
  recommendations: string[];
}

// Cache expiry constants (in milliseconds)
export const CACHE_EXPIRY = {
  WEATHER: 2 * 60 * 60 * 1000, // 2 hours
  SOIL: 24 * 60 * 60 * 1000,   // 24 hours
} as const;

// Utility functions
export function createLocationKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)}_${lon.toFixed(4)}`;
}

export function getSeason(date: Date): string {
  const month = date.getMonth() + 1;
  
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Monsoon';
  if (month >= 9 && month <= 11) return 'Post-Monsoon';
  return 'Winter';
}

export function getFarmingSeason(date: Date): string {
  const month = date.getMonth() + 1;
  
  if (month >= 6 && month <= 9) return 'Kharif (Monsoon)';
  if (month >= 10 && month <= 3) return 'Rabi (Winter)';
  return 'Zaid (Summer)';
}

// Seasonal crop recommendations
export const SEASONAL_CROPS = {
  'Kharif (Monsoon)': ['Rice', 'Cotton', 'Sugarcane', 'Maize', 'Pulses'],
  'Rabi (Winter)': ['Wheat', 'Barley', 'Peas', 'Gram', 'Mustard'],
  'Zaid (Summer)': ['Watermelon', 'Muskmelon', 'Cucumber', 'Fodder crops'],
} as const;

// Weather condition mappings
export const WEATHER_ADVICE = {
  'clear sky': 'Perfect for outdoor farming activities',
  'few clouds': 'Good conditions for most farming tasks',
  'scattered clouds': 'Suitable for planting and harvesting',
  'broken clouds': 'Monitor for potential rain',
  'shower rain': 'Good for irrigation, avoid heavy machinery',
  'rain': 'Ideal for natural irrigation, postpone spraying',
  'thunderstorm': 'Stay indoors, avoid field work',
  'snow': 'Protect crops from frost damage',
  'mist': 'Limited visibility, be cautious with machinery',
} as const;

// Soil type characteristics
export const SOIL_CHARACTERISTICS = {
  'Cambisols': 'Well-drained, fertile soils suitable for diverse crops',
  'Acrisols': 'Acidic soils, may need lime treatment for optimal pH',
  'Gleysols': 'Waterlogged soils, suitable for rice cultivation',
  'Ferralsols': 'Highly weathered soils, need organic matter enhancement',
  'Luvisols': 'Clay-rich soils with good water retention',
  'Arenosols': 'Sandy soils with good drainage but low water retention',
  'Vertisols': 'Clay soils that swell and shrink, challenging for cultivation',
  'Regosols': 'Young soils with limited development',
} as const;
