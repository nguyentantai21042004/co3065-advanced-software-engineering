// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://10.28.128.87:8090/api";

// App Configuration
export const APP_NAME = "AI Coach";
export const APP_DESCRIPTION = "CV Processing System";

// Routes
export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  // Dashboard routes
  DASHBOARD: {
    UPLOAD: "/dashboard/upload",
    PROCESSING: "/dashboard/processing",
    RESULTS: "/dashboard/results",
    HISTORY: "/dashboard/history",
    PROFILE: "/dashboard/profile",
    SETTINGS: "/dashboard/settings",
  },
  // Home
  HOME: "/",
} as const;

// Auth Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    UPDATE_PROFILE: "/auth/profile",
  },
  CV: {
    UPLOAD: "/cv/upload",
    LIST: "/cv/list",
    DETAIL: "/cv/:id",
    DELETE: "/cv/:id",
    PROCESS: "/cv/:id/process",
  },
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
