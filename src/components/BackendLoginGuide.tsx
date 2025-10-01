import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { 
  Server, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  UserPlus,
  LogIn
} from "lucide-react";

interface BackendLoginGuideProps {
  onCreateAccount: (userData: any) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<void>;
  onClose: () => void;
}

export function BackendLoginGuide({ onCreateAccount, onLogin, onClose }: BackendLoginGuideProps) {
  const [mode, setMode] = useState<'guide' | 'create' | 'login'>('guide');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Account creation form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: '',
    location: '',
    phone: '',
    businessName: '',
    businessDescription: '',
    experience: '',
    qualityCertifications: [] as string[],
    farmingMethods: [] as string[]
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await onCreateAccount(formData);
      setSuccess('Account created successfully! You can now login.');
      setTimeout(() => {
        setMode('login');
        setLoginData({ email: formData.email, password: '' });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(loginData.email, loginData.password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Backend Mode Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'guide' && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">Backend is Connected!</p>
                    <p>
                      When the backend is connected, AgriConnect Myanmar uses <strong>Supabase Authentication</strong> 
                      instead of local demo accounts. This means:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li>Demo accounts (farmer@demo.com, etc.) are <strong>not available</strong></li>
                      <li>You must create a real account with valid credentials</li>
                      <li>Your data is stored on the server, not locally</li>
                      <li>Accounts persist between sessions</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid gap-3">
                <Button
                  onClick={() => setMode('create')}
                  className="justify-start h-auto p-4"
                >
                  <UserPlus className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Create New Account</div>
                    <div className="text-sm opacity-75">Sign up for a new AgriConnect account</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>

                <Button
                  onClick={() => setMode('login')}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Login to Existing Account</div>
                    <div className="text-sm opacity-75">Sign in with your credentials</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={onClose} variant="ghost" className="w-full">
                  Cancel
                </Button>
              </div>
            </>
          )}

          {mode === 'create' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={() => setMode('guide')}
                  variant="ghost"
                  size="sm"
                >
                  ← Back
                </Button>
                <Badge variant="secondary">Create Account</Badge>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="userType">User Type *</Label>
                    <Select value={formData.userType} onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="trader">Trader</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Yangon, Mandalay"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., +95..."
                    />
                  </div>
                </div>

                {formData.userType && (
                  <>
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder={`Your ${formData.userType} business name`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessDescription">Business Description</Label>
                      <Textarea
                        id="businessDescription"
                        value={formData.businessDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                        placeholder="Describe your business..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Experience</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="e.g., 5 years in agriculture"
                      />
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={() => setMode('guide')}
                  variant="ghost"
                  size="sm"
                >
                  ← Back
                </Button>
                <Badge variant="secondary">Login</Badge>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="loginEmail">Email Address</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="loginPassword">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}