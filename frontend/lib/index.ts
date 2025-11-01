// Auth exports
export { useAuth, AuthProvider } from "@/contexts/auth.context";
export { authService } from "@/lib/auth.service";
export { handleApiError, getValidationErrors } from "@/lib/api-error.handler";
export { useProtectedRoute } from "@/hooks/use-protected-route";

// Types exports
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  AuthState,
  ApiError,
} from "@/types/auth";

// Constants exports
export {
  ROUTES,
  API_ENDPOINTS,
  VALIDATION,
  STORAGE_KEYS,
} from "@/lib/constants";

// Validation exports
export {
  isValidEmail,
  validatePassword,
  passwordsMatch,
  validateLoginForm,
  validateRegisterForm,
  getInitials,
  formatDate,
  formatRelativeTime,
  truncate,
  debounce,
} from "@/lib/validation";

// HTTP client export
export { default as http } from "@/lib/http";
