import { supabase } from '../lib/supabase';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  verificationSid?: string;
}

export interface VerificationCheckResult {
  success: boolean;
  message: string;
  status?: 'approved' | 'pending' | 'denied';
}

export class TwilioService {
  private static config: TwilioConfig | null = null;

  /**
   * Initialize Twilio configuration (using Supabase Edge Functions)
   */
  static async initialize(): Promise<void> {
    try {
      // Twilio credentials are now managed by Supabase Edge Functions
      // No need to check local environment variables
      this.config = {
        accountSid: 'supabase-managed',
        authToken: 'supabase-managed',
        phoneNumber: 'supabase-managed'
      };

      console.log('✅ Twilio service initialized with Supabase Edge Functions');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio service:', error);
    }
  }

  /**
   * Send SMS verification code via Supabase Edge Function
   */
  static async sendVerificationSMS(phoneNumber: string): Promise<VerificationResult> {
    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      console.log('📱 Sending verification SMS via Supabase Edge Function...');
      console.log('📱 Phone number being sent:', phoneNumber);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-verification-sms', {
        body: { phoneNumber }
      });

      if (error) {
        console.error('❌ Supabase Edge Function error:', error);
        throw error;
      }

      console.log('✅ SMS sent successfully:', data);
      return data;

         } catch (error) {
           console.error('❌ Error sending verification SMS:', error);
           throw error;
         }
  }

  /**
   * Verify SMS code via Supabase Edge Function
   */
  static async verifySMSCode(phoneNumber: string, code: string): Promise<VerificationCheckResult> {
    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      console.log('📱 Verifying SMS code via Supabase Edge Function...');

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('verify-sms-code', {
        body: { phoneNumber, code }
      });

      if (error) {
        console.error('❌ Supabase Edge Function error:', error);
        throw error;
      }

      console.log('✅ SMS code verification result:', data);
      return data;

         } catch (error) {
           console.error('❌ Error verifying SMS code:', error);
           throw error;
         }
  }

  /**
   * Update user phone verification status in database
   */
  static async updateUserPhoneVerification(
    userId: string, 
    phoneNumber: string, 
    isVerified: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      const { error } = await supabase
        .from('users')
        .update({
          phone: phoneNumber,
          phone_verified: isVerified,
          phone_verified_at: isVerified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Database update error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ User phone verification status updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error updating user phone verification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if Twilio is properly configured (always true since we use Supabase Edge Functions)
   */
  static isConfigured(): boolean {
    return true;
  }

  /**
   * Get verification status for a user
   */
  static async getVerificationStatus(userId: string): Promise<{
    phoneVerified: boolean;
    phoneNumber?: string;
    phoneVerifiedAt?: string;
  }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      const { data, error } = await supabase
        .from('users')
        .select('phone, phone_verified, phone_verified_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching verification status:', error);
        return { phoneVerified: false };
      }

      return {
        phoneVerified: data.phone_verified || false,
        phoneNumber: data.phone,
        phoneVerifiedAt: data.phone_verified_at
      };

    } catch (error: any) {
      console.error('❌ Error getting verification status:', error);
      return { phoneVerified: false };
    }
  }
}

// Initialize Twilio service when module loads
TwilioService.initialize();
