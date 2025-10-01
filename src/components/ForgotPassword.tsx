import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Leaf, ChevronLeft, Mail, Shield, Eye, EyeOff, CheckCircle } from "lucide-react";

interface ForgotPasswordProps {
  onBack: () => void;
  onReturnToLogin: () => void;
}

type Step = 'email' | 'verification' | 'code' | 'password' | 'success';

export function ForgotPassword({ onBack, onReturnToLogin }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!email.includes('@')) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setCurrentStep('verification');
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!verificationCode) {
      setErrors({ code: 'Verification code is required' });
      return;
    }

    if (verificationCode.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    // Demo: Accept any 6-digit code, or the special code "123456"
    if (verificationCode !== '123456' && !/^\d{6}$/.test(verificationCode)) {
      setErrors({ code: 'Invalid verification code. Try 123456 for demo.' });
      return;
    }

    setIsLoading(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setCurrentStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!newPassword) {
      setErrors({ password: 'New password is required' });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    
    // Simulate password update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setCurrentStep('success');
  };

  const resendCode = async () => {
    setIsLoading(true);
    
    // Simulate resending code
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-6 h-6 text-primary" />
            Reset Password
          </h1>
          <p className="text-muted-foreground">Secure password recovery for your AgriLink account</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className={`w-3 h-3 rounded-full ${currentStep === 'email' ? 'bg-primary' : currentStep !== 'email' ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`w-8 h-1 ${currentStep === 'verification' || currentStep === 'code' || currentStep === 'password' || currentStep === 'success' ? 'bg-primary' : 'bg-muted'} rounded`}></div>
          <div className={`w-3 h-3 rounded-full ${currentStep === 'verification' || currentStep === 'code' ? 'bg-primary' : currentStep === 'password' || currentStep === 'success' ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`w-8 h-1 ${currentStep === 'code' || currentStep === 'password' || currentStep === 'success' ? 'bg-primary' : 'bg-muted'} rounded`}></div>
          <div className={`w-3 h-3 rounded-full ${currentStep === 'password' ? 'bg-primary' : currentStep === 'success' ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`w-8 h-1 ${currentStep === 'success' ? 'bg-primary' : 'bg-muted'} rounded`}></div>
          <div className={`w-3 h-3 rounded-full ${currentStep === 'success' ? 'bg-primary' : 'bg-muted'}`}></div>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                {currentStep === 'email' && <Mail className="w-6 h-6 text-primary-foreground" />}
                {(currentStep === 'verification' || currentStep === 'code') && <Shield className="w-6 h-6 text-primary-foreground" />}
                {currentStep === 'password' && <Eye className="w-6 h-6 text-primary-foreground" />}
                {currentStep === 'success' && <CheckCircle className="w-6 h-6 text-primary-foreground" />}
              </div>
            </div>
            
            <CardTitle className="text-xl text-center">
              {currentStep === 'email' && 'Enter Your Email'}
              {currentStep === 'verification' && 'Check Your Email'}
              {currentStep === 'code' && 'Enter Verification Code'}
              {currentStep === 'password' && 'Set New Password'}
              {currentStep === 'success' && 'Password Reset Complete'}
            </CardTitle>
            
            <CardDescription className="text-center">
              {currentStep === 'email' && 'We\'ll send you a verification code to reset your password'}
              {currentStep === 'verification' && 'We\'ve sent a verification code to your email'}
              {currentStep === 'code' && 'Enter the 6-digit code from your email'}
              {currentStep === 'password' && 'Choose a strong new password for your account'}
              {currentStep === 'success' && 'Your password has been successfully updated'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Demo Mode Notice */}
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium">🎭 Demo Mode Password Reset</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {currentStep === 'email' && (
                      <>
                        <p>• Enter any valid email address</p>
                        <p>• No actual email will be sent</p>
                      </>
                    )}
                    {(currentStep === 'verification' || currentStep === 'code') && (
                      <>
                        <p>• Use verification code: <strong>123456</strong></p>
                        <p>• Any 6-digit number will work</p>
                      </>
                    )}
                    {currentStep === 'password' && (
                      <>
                        <p>• Choose any password (minimum 6 characters)</p>
                        <p>• This will simulate updating your password</p>
                      </>
                    )}
                    {currentStep === 'success' && (
                      <>
                        <p>• Password reset simulation complete</p>
                        <p>• You can now sign in with any demo credentials</p>
                      </>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Step 1: Email Input */}
            {currentStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {/* Step 2: Email Sent Confirmation */}
            {currentStep === 'verification' && (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">Verification Email Sent!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your email at <strong>{email}</strong>
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resendCode}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resending...' : 'Resend Code'}
                  </Button>
                </div>

                <Button 
                  onClick={() => setCurrentStep('code')} 
                  className="w-full h-11"
                >
                  I Have the Code
                </Button>
              </div>
            )}

            {/* Step 3: Verification Code */}
            {currentStep === 'code' && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className={`text-center tracking-widest text-lg ${errors.code ? 'border-destructive' : ''}`}
                    maxLength={6}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive mt-1">{errors.code}</p>
                  )}
                </div>

                <div className="text-center">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={resendCode}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resending...' : 'Resend Code'}
                  </Button>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            )}

            {/* Step 4: New Password */}
            {currentStep === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li className={newPassword.length >= 6 ? 'text-primary' : ''}>At least 6 characters</li>
                    <li className={newPassword !== confirmPassword || !confirmPassword ? '' : 'text-primary'}>Passwords match</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            )}

            {/* Step 5: Success */}
            {currentStep === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-green-800 mb-2">Password Reset Successful!</h3>
                  <p className="text-sm text-green-700">
                    Your password has been updated successfully. You can now sign in with your new password.
                  </p>
                </div>

                <Button onClick={onReturnToLogin} className="w-full h-11">
                  Return to Sign In
                </Button>
              </div>
            )}

            {/* Back Button - Only show on first step or if not success */}
            {(currentStep === 'email' || currentStep === 'verification') && (
              <div className="pt-4 border-t">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={onBack}
                  className="w-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            )}

            {/* Alternative actions for later steps */}
            {(currentStep === 'code' || currentStep === 'password') && (
              <div className="pt-4 border-t">
                <div className="text-center">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentStep('email')}
                  >
                    Use Different Email
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}