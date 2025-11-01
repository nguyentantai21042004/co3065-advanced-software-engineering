import http from "./http";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
} from "@/types/auth";

class AuthService {
  // Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>("/auth/login", data);

    // Lưu tokens và user vào localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // Register
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await http.post<RegisterResponse>("/auth/register", data);
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await http.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  // Forgot Password
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const response = await http.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  }

  // Reset Password
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const response = await http.post<ResetPasswordResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  }

  // Refresh Token
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await http.post<RefreshTokenResponse>(
      "/auth/refresh",
      data
    );

    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data;
  }

  // Get Current User
  async getCurrentUser(): Promise<User> {
    const response = await http.get<User>("/auth/me");

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  }

  // Change Password
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const response = await http.post<ChangePasswordResponse>(
      "/auth/change-password",
      data
    );
    return response.data;
  }

  // Update Profile
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    const response = await http.put<UpdateProfileResponse>(
      "/auth/profile",
      data
    );

    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    return !!token;
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }
}

export const authService = new AuthService();
export default authService;
