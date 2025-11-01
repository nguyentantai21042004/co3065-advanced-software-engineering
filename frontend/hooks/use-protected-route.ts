"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Hook để protect routes
 * - requireAuth = true: Chỉ cho phép user đã login
 * - requireAuth = false: Chỉ cho phép guest (chưa login)
 */
export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { redirectTo = "/auth/login", requireAuth = true } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    } else if (!requireAuth && isAuthenticated) {
      router.push("/dashboard/upload");
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  return { isAuthenticated, isLoading };
}
