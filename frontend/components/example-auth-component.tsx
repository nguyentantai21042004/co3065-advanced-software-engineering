"use client";

/**
 * Example Component - Minh họa cách sử dụng Auth trong component
 *
 * Component này demo các tính năng:
 * - Get user info từ auth context
 * - Check authentication status
 * - Handle logout
 * - Call API với auto authentication
 */

import { useState } from "react";
import { useAuth } from "@/contexts/auth.context";
import http from "@/lib/http";
import { handleApiError } from "@/lib/api-error.handler";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/validation";
import { Loader2 } from "lucide-react";

export default function ExampleAuthComponent() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);

  // Example: Gọi API với authentication
  const handleFetchData = async () => {
    setIsLoading(true);
    try {
      // http client tự động attach Authorization header
      const response = await http.get("/users/profile");
      setApiData(response.data);
      alert("API call successful! Check console.");
      console.log("API Response:", response.data);
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Logout
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">You are not logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Information from Auth Context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {user.name || user.username || "User"}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              {user.role && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded">
            <h4 className="font-medium text-sm text-gray-700">User Object:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleFetchData}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Test API Call"
              )}
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {apiData && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>Data from API call</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>Code examples from this component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Get user info:</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {`import { useAuth } from '@/contexts/auth.context'

const { user, isAuthenticated } = useAuth()

if (isAuthenticated) {
  console.log(user.email)
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Call authenticated API:</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {`import http from '@/lib/http'
import { handleApiError } from '@/lib/api-error.handler'

try {
  const response = await http.get('/users/profile')
  console.log(response.data)
} catch (error) {
  alert(handleApiError(error))
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Logout:</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {`import { useAuth } from '@/contexts/auth.context'

const { logout } = useAuth()

await logout()
// Auto redirect to /auth/login`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
