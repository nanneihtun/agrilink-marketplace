import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import ENV from '../config/env'

export function EnvironmentStatus() {
  const isConfigured = ENV.isSupabaseConfigured()
  
  if (isConfigured) {
    return null // Don't show environment status when backend is configured - BackendStatus handles this
  }

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between mb-2">
          <span>Running in demo mode - using local storage for data persistence</span>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Demo Mode
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Demo Login Credentials:</strong>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1 text-xs">
            <div>📱 <strong>Farmer:</strong> farmer@demo.com / demo123</div>
            <div>🏪 <strong>Trader:</strong> trader@demo.com / demo123</div>
            <div>🍽️ <strong>Buyer:</strong> buyer@demo.com / demo123</div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export function BackendStatus({ backendAvailable, checking }: { backendAvailable: boolean, checking: boolean }) {
  if (checking) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        Checking Backend...
      </Badge>
    )
  }

  if (backendAvailable) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Backend Connected
        </Badge>
        <span className="text-xs text-muted-foreground hidden md:inline">
          Real authentication required
        </span>
      </div>
    )
  }

  return (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
      <AlertCircle className="w-3 h-3 mr-1" />
      Demo Mode
    </Badge>
  )
}