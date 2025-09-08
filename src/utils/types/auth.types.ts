import { Models } from 'appwrite';

// User authentication types
export interface AuthUser extends Models.User<Models.Preferences> {
  // Additional user properties can be added here
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: (useCache?: boolean) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

// Password reset types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  userId: string;
  secret: string;
  newPassword: string;
}

// Email verification types
export interface EmailVerificationConfirm {
  userId: string;
  secret: string;
}

// Session types
export interface UserSession extends Models.Session {
  // Additional session properties can be added here
}

// Auth error types
export interface AuthError {
  code: string;
  message: string;
  type: 'validation' | 'network' | 'server' | 'unknown';
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
}

// Auth context types
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}
