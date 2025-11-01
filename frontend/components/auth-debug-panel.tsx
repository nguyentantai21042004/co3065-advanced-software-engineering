"use client";

import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthDebugPanel() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-gray-600">Loading auth state...</div>;
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Authentication Status:
          </p>
          <p
            className={`text-lg font-semibold ${
              isAuthenticated ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAuthenticated ? "✓ Authenticated" : "✗ Not Authenticated"}
          </p>
        </div>

        {user && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">User Info:</p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Local Storage:
          </p>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Access Token:</span>{" "}
              <span className="text-gray-600">
                {localStorage.getItem("accessToken")
                  ? "✓ Present"
                  : "✗ Missing"}
              </span>
            </div>
            <div>
              <span className="font-medium">Refresh Token:</span>{" "}
              <span className="text-gray-600">
                {localStorage.getItem("refreshToken")
                  ? "✓ Present"
                  : "✗ Missing"}
              </span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <Button onClick={logout} variant="destructive" className="w-full">
            Logout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
