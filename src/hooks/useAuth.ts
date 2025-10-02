import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'farmer' | 'trader' | 'buyer' | 'admin';
  accountType?: 'individual' | 'business';
  location: string;
    region?: string;
  verified: boolean;
  phoneVerified: boolean;
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  experience: string;
  qualityCertifications?: string[];
  farmingMethods?: string[];
  profileImage?: string;
  joinedDate?: string;
  rating?: number;
  totalReviews?: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(async (userData: {
    email: string;
    password: string;
    name: string;
    userType: 'farmer' | 'trader' | 'buyer';
    accountType?: 'individual' | 'business';
    location: string;
    region?: string;
    phone?: string;
    businessName?: string;
    businessDescription?: string;
  }) => {
    if (!supabase) {
      throw new Error('Supabase not available');
    }

    setLoading(true);
    
    try {
      console.log('🔄 Clean signup process started for:', userData.email);
      console.log('📋 Form data received:');
      console.log('  - Name:', userData.name);
      console.log('  - UserType:', userData.userType);
      console.log('  - AccountType:', userData.accountType);
      console.log('  - Location:', userData.location);
      console.log("  - Region:", userData.region);
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        console.error('❌ Auth signup failed:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // 2. Create profile in users table
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        user_type: userData.userType,
        account_type: userData.accountType || 'individual',
        location: userData.location,
        region: userData.region,
        phone: userData.phone,
        business_name: userData.businessName,
        business_description: userData.businessDescription,
        verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Creating profile with data:');
      console.log('  - Name:', profileData.name);
      console.log('  - User Type:', profileData.user_type);
      console.log('  - Account Type:', profileData.account_type);
      console.log('  - Location:', profileData.location);

      // Try to insert, if duplicate key error then update existing
      let profile;
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (insertError && insertError.code === '23505') {
        // Duplicate key error - update existing profile instead
        console.log('⚠️ User already exists, updating with new form data');
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({
            name: profileData.name,
            user_type: profileData.user_type,
            account_type: profileData.account_type,
            location: profileData.location,
            phone: profileData.phone,
            business_name: profileData.business_name,
            business_description: profileData.business_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Profile update failed:', updateError);
          throw new Error(`Profile update failed: ${updateError.message}`);
        }
        profile = updateData;
        console.log('✅ Profile updated with new form data');
      } else if (insertError) {
        console.error('❌ Profile creation failed:', insertError);
        throw new Error(`Profile creation failed: ${insertError.message}`);
      } else {
        profile = insertData;
        console.log('✅ New profile created successfully');
      }

      return { user: authData.user, session: authData.session, profile };

    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not available');
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        userType: profile.user_type,
        accountType: profile.account_type,
        location: profile.location,
        verified: profile.verified,
        phoneVerified: profile.phone_verified,
        phone: profile.phone,
        businessName: profile.business_name,
        businessDescription: profile.business_description,
        experience: profile.experience,
        joinedDate: profile.created_at,
        totalReviews: profile.total_reviews || 0
      };

      setUser(user);
      return data;

    } catch (error) {
      console.error('❌ Signin failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (error) {
      console.error('❌ Signout failed:', error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser: User = { ...user, ...updates };
      setUser(updatedUser);
      
      return data;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }, [user]);

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
};
