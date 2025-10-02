import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  currentUser: any;
  onVerificationComplete: (phoneNumber: string) => void;
  onBack?: () => void;
}

export function PhoneVerification({ currentUser, onVerificationComplete, onBack }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number with country code (e.g., +959123456789)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      // Send OTP via Supabase
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (otpError) {
        throw otpError;
      }

      toast.success('Verification code sent to your phone!');
      setStep('otp');
      startCountdown();
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      // Verify OTP with Supabase
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms'
      });

      if (verifyError) {
        throw verifyError;
      }

      // Update user profile with phone verification
      console.log('📱 Updating user profile with phone verification:', {
        userId: currentUser.id,
        phoneNumber: phoneNumber
      });

      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          phone: phoneNumber,
          phone_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select();

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      console.log('✅ User profile updated successfully:', updateData);

      toast.success('Phone number verified successfully!');
      onVerificationComplete(phoneNumber);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setOtpCode('');
    setError('');
    await handleSendOTP();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Phone Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+959123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter your phone number with country code (e.g., +959 for Myanmar)
              </p>
            </div>

            {/* Test Numbers Info */}
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>For testing:</strong> Use +15005550001 (OTP: 123456) or +15005550002 (OTP: 789012)
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack} disabled={isLoading}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleSendOTP} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Clock className="w-3 h-3 mr-1" />
                Code Sent
              </Badge>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <strong>{phoneNumber}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleVerifyOTP} 
                disabled={isLoading || otpCode.length !== 6}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify Phone Number'}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError('');
                }}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
