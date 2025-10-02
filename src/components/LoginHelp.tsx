import { useState } from "react";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";
import { BackendLoginGuide } from "./BackendLoginGuide";

interface LoginHelpProps {
  backendAvailable: boolean;
  onDemoLogin: (email: string, password: string) => Promise<void>;
  onRegister?: (userData: any) => Promise<void>;
}

export function LoginHelp({ backendAvailable, onDemoLogin, onRegister }: LoginHelpProps) {
  const [showBackendGuide, setShowBackendGuide] = useState(false);

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

  // Only show help for backend mode
  if (backendAvailable) {
    return (
      <Button
        onClick={() => setShowBackendGuide(true)}
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="w-3 h-3 mr-1" />
        Need Help?
      </Button>
    );
  }

  // No help needed for demo mode since we removed it
  return null;
}