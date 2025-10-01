import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { HelpCircle, RefreshCw, User, AlertTriangle, Server } from "lucide-react";
import { BackendLoginGuide } from "./BackendLoginGuide";

interface LoginHelpProps {
  backendAvailable: boolean;
  onDemoLogin: (email: string, password: string) => Promise<void>;
  onRegister?: (userData: any) => Promise<void>;
}

export function LoginHelp({ backendAvailable, onDemoLogin, onRegister }: LoginHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackendGuide, setShowBackendGuide] = useState(false);

  const handleDemoLogin = async (userType: 'farmer' | 'trader' | 'buyer') => {
    setIsLoading(true);
    try {
      const credentials = {
        farmer: { email: 'farmer@demo.com', password: 'demo123' },
        trader: { email: 'trader@demo.com', password: 'demo123' },
        buyer: { email: 'buyer@demo.com', password: 'demo123' }
      };
      
      await onDemoLogin(credentials[userType].email, credentials[userType].password);
      setIsOpen(false);
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDemo = () => {
    // Clear all authentication data
    localStorage.removeItem('agriconnect-myanmar-current-user');
    localStorage.removeItem('agriconnect-myanmar-users');
    
    // Reload the page to reinitialize demo mode
    window.location.reload();
  };

  // If backend is available, show the backend guide
  if (showBackendGuide && backendAvailable && onRegister) {
    return (
      <BackendLoginGuide
        onCreateAccount={onRegister}
        onLogin={onDemoLogin}
        onClose={() => setShowBackendGuide(false)}
      />
    );
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => backendAvailable ? setShowBackendGuide(true) : setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="w-3 h-3 mr-1" />
        {backendAvailable ? 'Backend Login Help' : 'Can\'t login?'}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Login Help
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Current Status:</p>
                <div className="flex items-center gap-2">
                  <Badge variant={backendAvailable ? "default" : "secondary"}>
                    {backendAvailable ? "Backend Mode" : "Demo Mode"}
                  </Badge>
                </div>
                <p className="text-sm">
                  {backendAvailable 
                    ? "You're connected to the backend. Demo accounts are not available in backend mode."
                    : "You're in demo mode. Use the demo accounts below or create a new account."
                  }
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {backendAvailable && (
            <Alert>
              <Server className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Backend Authentication Required</p>
                  <p className="text-sm">
                    When the backend is connected, you need to create a real account or login with existing backend credentials.
                  </p>
                  <Button
                    onClick={() => setShowBackendGuide(true)}
                    size="sm"
                    className="mt-2"
                  >
                    Open Backend Login Guide
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!backendAvailable && (
            <div className="space-y-3">
              <p className="font-medium">Quick Demo Login:</p>
            
            <div className="grid gap-2">
              <Button
                onClick={() => handleDemoLogin('farmer')}
                disabled={isLoading}
                variant="outline"
                className="justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Login as Farmer (farmer@demo.com)
              </Button>
              
              <Button
                onClick={() => handleDemoLogin('trader')}
                disabled={isLoading}
                variant="outline"
                className="justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Login as Trader (trader@demo.com)
              </Button>
              
              <Button
                onClick={() => handleDemoLogin('buyer')}
                disabled={isLoading}
                variant="outline"
                className="justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Login as Buyer (buyer@demo.com)
              </Button>
            </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Having issues with your account?
            </p>
            <Button
              onClick={resetToDemo}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Reset to Demo Mode
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}