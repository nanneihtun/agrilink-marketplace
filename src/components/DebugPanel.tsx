import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, Bug, Eye, EyeOff } from "lucide-react";
import ENV from '../config/env';

interface DebugPanelProps {
  backendAvailable: boolean;
  currentUser: any;
  authLoading: boolean;
}

export function DebugPanel({ backendAvailable, currentUser, authLoading }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="bg-background border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Info
        </Button>
      </div>
    );
  }

  // Get stored users from localStorage
  const storedUsers = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
  const currentStoredUser = localStorage.getItem('agriconnect-myanmar-current-user');

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-orange-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Authentication Debug
            </CardTitle>
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
              variant="ghost"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Environment Status */}
          <div>
            <div className="font-medium mb-1">Environment:</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                🎯 Demo Mode Active
              </Badge>
              <Badge variant="secondary">
                Local Data Only
              </Badge>
            </div>
          </div>

          {/* Auth Status */}
          <div>
            <div className="font-medium mb-1">Authentication:</div>
            <div className="space-y-1">
              <div>Loading: {authLoading ? "Yes" : "No"}</div>
              <div>Current User: {currentUser ? currentUser.name : "None"}</div>
              <div>User Type: {currentUser?.userType || "N/A"}</div>
              <div>User ID: {currentUser?.id || "N/A"}</div>
            </div>
          </div>

          {/* localStorage Debug */}
          <div>
            <div className="font-medium mb-1">Local Storage:</div>
            <div className="space-y-1">
              <div>Demo Users: {storedUsers.length} stored</div>
              <div>Current User: {currentStoredUser ? "Set" : "Not Set"}</div>
            </div>
          </div>

          {/* Demo Users List */}
          {storedUsers.length > 0 && (
            <details className="cursor-pointer">
              <summary className="font-medium">Available Demo Users:</summary>
              <div className="mt-1 space-y-1 pl-2">
                {storedUsers.map((user: any, index: number) => (
                  <div key={index} className="text-xs">
                    {user.email} ({user.userType})
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="pt-2 border-t">
            <div className="font-medium mb-2">Quick Actions:</div>
            <div className="space-y-1">
              <Button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                Clear All Data & Reload
              </Button>
              <Button
                onClick={() => {
                  console.log('=== AUTH DEBUG ===');
                  console.log('Backend Available:', backendAvailable);
                  console.log('Auth Loading:', authLoading);
                  console.log('Current User:', currentUser);
                  console.log('Stored Users:', storedUsers);
                  console.log('Current Stored User:', currentStoredUser);
                  console.log('Environment Configured:', ENV.isSupabaseConfigured());
                  console.log('==================');
                }}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                Log Debug Info to Console
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}