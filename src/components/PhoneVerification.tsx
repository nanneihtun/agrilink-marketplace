import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Phone, CheckCircle, Clock, AlertCircle, Shield, Edit } from 'lucide-react';
import { TwilioService } from '../services/twilio';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  currentUser: any;
  onVerificationComplete: (phoneNumber: string) => void;
  onBack?: () => void;
}

export function PhoneVerification({ currentUser, onVerificationComplete, onBack }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isTwilioConfigured, setIsTwilioConfigured] = useState(false);
  const [verificationSid, setVerificationSid] = useState<string | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Check Twilio configuration on component mount
  useEffect(() => {
    setIsTwilioConfigured(TwilioService.isConfigured());
  }, []);

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
      console.log('📱 Sending verification SMS via Twilio...');
      
      // Send OTP via Twilio
      const result = await TwilioService.sendVerificationSMS(phoneNumber);

      if (!result.success) {
        throw new Error(result.message);
      }

      setVerificationSid(result.verificationSid || null);
      toast.success(result.message);
      setStep('otp');
      startCountdown();
      
      console.log('✅ Verification SMS sent successfully');
    } catch (err: any) {
      console.error('❌ Send OTP error:', err);
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
      console.log('📱 Verifying SMS code via Twilio...');
      
      // Verify OTP with Twilio
      const result = await TwilioService.verifySMSCode(phoneNumber, otpCode);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Update user profile with phone verification
      console.log('📱 Updating user profile with phone verification:', {
        userId: currentUser.id,
        phoneNumber: phoneNumber
      });

      const updateResult = await TwilioService.updateUserPhoneVerification(
        currentUser.id,
        phoneNumber,
        true
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update user profile');
      }

      console.log('✅ Phone verification completed successfully');

      toast.success('Phone number verified successfully!');
      onVerificationComplete(phoneNumber);
    } catch (err: any) {
      console.error('❌ Verify OTP error:', err);
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
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+959123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading || !isEditingPhone}
                  className={`pr-10 ${!isEditingPhone ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                />
                {!isEditingPhone && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingPhone(true)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isEditingPhone 
                  ? 'Enter your phone number with country code (e.g., +959 for Myanmar)'
                  : 'Click the edit button to modify your phone number'
                }
              </p>
            </div>

            {/* Twilio Status */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="w-4 h-4 text-green-600" />
        <AlertDescription>
          <span className="text-green-800">
            <strong>Twilio Connected:</strong> Real SMS verification enabled
          </span>
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
                disabled={isLoading || !phoneNumber.trim()}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              
              {isEditingPhone && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingPhone(false);
                    setPhoneNumber(currentUser.phone || '');
                  }}
                  className="px-4"
                >
                  Cancel
                </Button>
              )}
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
              {!isTwilioConfigured && (
                <p className="text-xs text-yellow-600 font-medium">
                  Demo Mode: Use 123456 or any code ending in 00
                </p>
              )}
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
