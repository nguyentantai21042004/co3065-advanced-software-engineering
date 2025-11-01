import { AxiosError } from "axios";
import type { ApiError } from "@/types/auth";

// Xử lý API errors và trả về message thân thiện với user
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;

    // Nếu có message từ server
    if (apiError?.message) {
      return apiError.message;
    }

    // Nếu có validation errors
    if (apiError?.errors) {
      const firstErrorKey = Object.keys(apiError.errors)[0];
      const firstError = apiError.errors[firstErrorKey]?.[0];
      if (firstError) {
        return firstError;
      }
    }

    // HTTP status code messages
    switch (error.response?.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Invalid credentials. Please try again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 409:
        return "This resource already exists.";
      case 422:
        return "Validation failed. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  }

  // Network errors
  if (error instanceof Error) {
    if (error.message.includes("Network Error")) {
      return "Network error. Please check your connection.";
    }
    if (error.message.includes("timeout")) {
      return "Request timeout. Please try again.";
    }
    return error.message;
  }

  return "An unexpected error occurred.";
}

// Get validation errors từ API response
export function getValidationErrors(
  error: unknown
): Record<string, string> | null {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.errors) {
      // Convert array of errors to single string per field
      const validationErrors: Record<string, string> = {};

      for (const [key, messages] of Object.entries(apiError.errors)) {
        validationErrors[key] = messages[0]; // Take first error message
      }

      return validationErrors;
    }
  }

  return null;
}
