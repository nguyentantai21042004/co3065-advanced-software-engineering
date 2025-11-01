"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth.service";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthState,
} from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state từ localStorage
  useEffect(() => {
    const initAuth = () => {
      const accessToken = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();
      const user = authService.getStoredUser();

      if (accessToken && user) {
        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(
    async (data: LoginRequest) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        console.log("Starting login...");
        await authService.login(data);

        // Lấy token và user từ localStorage (đã được lưu trong authService.login)
        const accessToken = authService.getAccessToken();
        const user = authService.getStoredUser();

        console.log("Access token:", accessToken);
        console.log("User:", user);

        setState({
          user,
          accessToken,
          refreshToken: null, // Backend không trả refreshToken
          isAuthenticated: true,
          isLoading: false,
        });

        console.log("Redirecting to dashboard...");
        // Redirect to dashboard
        router.push("/dashboard/upload");
      } catch (error) {
        console.error("Login error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [router]
  );

  // Register
  const register = useCallback(
    async (data: RegisterRequest) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        await authService.register(data);
        setState((prev) => ({ ...prev, isLoading: false }));

        // Redirect to login
        router.push("/auth/login");
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [router]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      router.push("/auth/login");
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }, []);

  // Update user
  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
    localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [state, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook để sử dụng Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
