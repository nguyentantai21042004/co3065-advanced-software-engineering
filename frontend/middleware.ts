import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các routes không cần authentication
const publicRoutes = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
]);

// Các routes chỉ dành cho guest (chưa login)
const guestOnlyRoutes = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has token
  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!accessToken;

  // Redirect authenticated users từ guest-only pages
  if (guestOnlyRoutes.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard/upload", request.url));
  }

  // Redirect unauthenticated users từ protected pages
  if (!publicRoutes.has(pathname) && !isAuthenticated) {
    // Nếu đang cố truy cập dashboard hoặc protected routes
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// Config để specify routes cần check
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
