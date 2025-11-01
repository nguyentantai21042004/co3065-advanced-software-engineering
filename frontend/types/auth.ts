// Auth Types
export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  error_code: number;
  message: string;
  data: {
    email: string;
    token: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
}

export interface RegisterResponse {
  user: User;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface UpdateProfileRequest {
  username?: string;
  name?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Error Response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}
