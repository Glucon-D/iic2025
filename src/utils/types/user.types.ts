import { Models } from 'appwrite';

// User profile types based on the database schema
export interface UserProfile {
  $id?: string;
  username: string;
  location: string;
  farmsize?: string;
  crop?: string[];
  experience?: string;
  language?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// User preferences
export interface UserPreferences {
  language: 'malayalam' | 'english' | 'hindi';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  aiModel: string;
  voiceEnabled: boolean;
  autoTranslate: boolean;
}

// User state
export interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

// User actions
export interface UserActions {
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createProfile: (profileData: Omit<UserProfile, '$id'>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export type UserStore = UserState & UserActions;

// Farm information types
export interface FarmInfo {
  size: string;
  location: {
    district: string;
    taluk: string;
    village: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  soilType?: string;
  irrigationType?: string;
  crops: CropInfo[];
}

export interface CropInfo {
  name: string;
  variety?: string;
  plantingDate?: Date;
  expectedHarvest?: Date;
  area: number; // in acres or hectares
  stage: 'planted' | 'growing' | 'flowering' | 'fruiting' | 'harvesting' | 'harvested';
}

// Experience levels
export type ExperienceLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'experienced' 
  | 'expert';

// Farm sizes
export type FarmSize = 
  | 'small' // < 2 acres
  | 'medium' // 2-10 acres
  | 'large' // > 10 acres
  | 'commercial'; // Large commercial operations

// Common crops in Kerala
export const KERALA_CROPS = [
  'rice', 'coconut', 'rubber', 'pepper', 'cardamom', 'tea', 'coffee',
  'banana', 'tapioca', 'ginger', 'turmeric', 'vanilla', 'nutmeg',
  'vegetables', 'fruits', 'spices'
] as const;

export type KeralaCrop = typeof KERALA_CROPS[number];

// Districts in Kerala
export const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod'
] as const;

export type KeralaDistrict = typeof KERALA_DISTRICTS[number];

// User activity tracking
export interface UserActivity {
  userId: string;
  action: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// User statistics
export interface UserStats {
  totalQueries: number;
  resolvedQueries: number;
  averageResponseTime: number;
  mostUsedCategories: string[];
  lastActive: Date;
  joinDate: Date;
}
