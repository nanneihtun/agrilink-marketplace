import { useState, useCallback, useEffect } from 'react';
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
  businessLicenseNumber?: string;
  experience: string;
  qualityCertifications?: string[];
  farmingMethods?: string[];
  profileImage?: string;
  storefrontImage?: string;
  joinedDate?: string;
  rating?: number;
  totalReviews?: number;
  verificationStatus?: 'not_started' | 'in_progress' | 'under_review' | 'verified' | 'rejected';
  verificationDocuments?: {
    idCard?: {
      status?: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
      data?: string;
    };
    businessLicense?: {
      status?: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
      data?: string;
    };
    farmCertification?: {
      status?: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
      data?: string;
    };
  };
  phoneVerifiedAt?: string;
  verifiedAt?: string;
  agriLinkVerificationRequested?: boolean;
  agriLinkVerificationRequestedAt?: string;
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
      console.log('📧 Auth user email:', authData.user.email);
      console.log('📧 Auth user metadata:', authData.user.user_metadata);

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

      if (insertError) {
        console.error('❌ Profile insert error:', insertError);
        console.error('❌ Error code:', insertError.code);
        console.error('❌ Error message:', insertError.message);
      }
      
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
        console.log('📋 Created profile data:', profile);
      }

      console.log('🎉 Signup completed successfully!');
      console.log('👤 Auth user:', authData.user.email);
      console.log('📋 Profile user:', profile?.email);
      
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

      // User data will be loaded by the auth state change listener
      return data;

    } catch (error) {
      console.error('❌ Signin failed:', error);
      setLoading(false);
      throw error;
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
      // Convert camelCase field names to snake_case for database
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      // Map frontend field names to database field names
      if (updates.accountType !== undefined) dbUpdates.account_type = updates.accountType;
      if (updates.userType !== undefined) dbUpdates.user_type = updates.userType;
      if (updates.phoneVerified !== undefined) dbUpdates.phone_verified = updates.phoneVerified;
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.businessDescription !== undefined) dbUpdates.business_description = updates.businessDescription;
      if (updates.businessLicenseNumber !== undefined) dbUpdates.business_license_number = updates.businessLicenseNumber;
      if (updates.joinedDate !== undefined) dbUpdates.created_at = updates.joinedDate;
      if (updates.totalReviews !== undefined) dbUpdates.total_reviews = updates.totalReviews;
      
      // Direct field mappings (no conversion needed)
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.region !== undefined) dbUpdates.region = updates.region;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
    if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage;
    if (updates.storefrontImage !== undefined) dbUpdates.storefront_image = updates.storefrontImage;
      
      // Verification fields that now exist in the database
      if (updates.verificationStatus !== undefined) {
        dbUpdates.verification_status = updates.verificationStatus;
      }
      if (updates.verificationDocuments !== undefined) {
        dbUpdates.verification_documents = updates.verificationDocuments;
      }
      if (updates.agriLinkVerificationRequested !== undefined) {
        dbUpdates.verification_submitted = updates.agriLinkVerificationRequested;
      }
      if (updates.phoneVerifiedAt !== undefined) dbUpdates.phone_verified_at = updates.phoneVerifiedAt;
      if (updates.verifiedAt !== undefined) dbUpdates.verified_at = updates.verifiedAt;
      if (updates.agriLinkVerificationRequestedAt !== undefined) dbUpdates.agri_link_verification_requested_at = updates.agriLinkVerificationRequestedAt;
      
      // Note: The following fields don't exist in the database yet, so we skip them:
      // - experience (doesn't exist)

      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      const updatedUser: User = { ...user, ...updates };
      setUser(updatedUser);
      
      return data;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }, [user]);

  // Listen for auth state changes and load user data
  useEffect(() => {
    let mounted = true;
    let isLoading = false;

    // Set a reasonable timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Auth loading timeout - setting loading to false');
        setLoading(false);
        isLoading = false;
      }
    }, 20000); // 20 second timeout - database is slow

    const loadUserData = async (userId: string) => {
      if (isLoading) {
        console.log('⚠️ Already loading user data, skipping...');
        return;
      }
      if (!mounted) {
        console.log('⚠️ Component unmounted, skipping user data load...');
        return;
      }

      isLoading = true;
      setLoading(true);
      
      try {
        // Simple query - only essential fields that we know exist
        
        const queryPromise = supabase
          .from('users')
          .select(`
            id,
            email,
            name,
            user_type,
            account_type,
            location,
            phone,
            verified,
            phone_verified,
            created_at,
            verification_documents,
            verification_status,
            verification_submitted,
            phone_verified_at,
            verified_at,
            agri_link_verification_requested_at,
        profile_image,
        storefront_image
          `)
          .eq('id', userId)
          .single();
          
        // Add timeout to prevent hanging - database is slow (6+ seconds)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 15000)
        );
        
        const { data: profile, error: profileError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        if (profileError) {
          console.error('❌ Profile fetch failed:', profileError);
          if (profileError.code === 'PGRST116') {
            // Get auth user data to create profile
            const { data: authUser } = await supabase.auth.getUser();
            
            if (authUser?.user) {
              
              const { error: insertError } = await supabase
                .from('users')
                .insert([{
                  id: authUser.user.id,
                  email: authUser.user.email,
                  name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
                  user_type: authUser.user.user_metadata?.user_type || 'buyer',
                  account_type: authUser.user.user_metadata?.account_type || 'individual',
                  location: authUser.user.user_metadata?.location || null,
                  verified: false,
                  phone_verified: false,
                  created_at: new Date().toISOString()
                }]);
              
                if (insertError) {
                  console.error('❌ Failed to create user profile:', insertError);
                  if (mounted) setUser(null);
                  return;
                }
                
                // Retry loading user data from database
              const { data: retryProfile, error: retryError } = await supabase
                .from('users')
                .select(`
                  id,
                  email,
                  name,
                  user_type,
                  account_type,
                  location,
                  verified,
                  phone_verified,
                  created_at
                `)
                .eq('id', userId)
                .single();
              
              if (retryError || !retryProfile) {
                console.error('❌ Retry failed:', retryError);
                if (mounted) setUser(null);
                return;
              }
              
              // Create user object from database data
              const user: User = {
                id: retryProfile.id,
                email: retryProfile.email,
                name: retryProfile.name,
                userType: retryProfile.user_type,
                accountType: retryProfile.account_type,
                location: retryProfile.location,
                phone: retryProfile.phone,
                verified: retryProfile.verified,
                phoneVerified: retryProfile.phone_verified,
                experience: 'Unknown',
                joinedDate: retryProfile.created_at,
                totalReviews: 0,
                verificationStatus: retryProfile.verification_status || 'not_started',
                verificationDocuments: retryProfile.verification_documents || {},
                phoneVerifiedAt: retryProfile.phone_verified_at,
                verifiedAt: retryProfile.verified_at,
                agriLinkVerificationRequested: retryProfile.verification_submitted || false,
                agriLinkVerificationRequestedAt: retryProfile.agri_link_verification_requested_at,
                profileImage: retryProfile.profile_image || '',
                storefrontImage: retryProfile.storefront_image || '',
              };
              
              if (mounted) {
                setUser(user);
                console.log('✅ User profile loaded from database:', user.email);
              }
              return;
            }
          }
          
          if (mounted) {
            setUser(null);
          }
          return;
        }

        if (!profile) {
          console.error('❌ No profile found for user:', userId);
          if (mounted) {
            setUser(null);
          }
          return;
        }

        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          userType: profile.user_type,
          accountType: profile.account_type,
          location: profile.location,
          phone: profile.phone,
          verified: profile.verified,
          phoneVerified: profile.phone_verified,
          experience: 'Unknown',
          joinedDate: profile.created_at,
          totalReviews: 0,
          verificationStatus: profile.verification_status || 'not_started',
          verificationDocuments: profile.verification_documents || {},
          phoneVerifiedAt: profile.phone_verified_at,
          verifiedAt: profile.verified_at,
          agriLinkVerificationRequested: profile.verification_submitted || false,
          agriLinkVerificationRequestedAt: profile.agri_link_verification_requested_at,
      profileImage: profile.profile_image || '',
      storefrontImage: profile.storefront_image || ''
        };

          if (mounted) {
            setUser(user);
          }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        
        // If database query fails, show the actual error - no fallbacks
        console.error('❌ Database query failed with error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error);
        
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
        
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
        isLoading = false;
        console.log('🏁 loadUserData completed');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔄 SIGNED_IN event - loading user data for:', session.user.id);
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        isLoading = false;
        console.log('✅ User signed out');
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session - only auto-login if user explicitly wants to stay logged in
        console.log('🔄 INITIAL_SESSION event:', { hasSession: !!session, userId: session?.user?.id });
        if (session?.user) {
          // Check if user has explicitly chosen to stay logged in
          const shouldAutoLogin = localStorage.getItem('agrilink_auto_login') === 'true';
          if (shouldAutoLogin) {
            console.log('🔄 Auto-login enabled - loading user data for:', session.user.id);
            await loadUserData(session.user.id);
          } else {
            console.log('🔄 Auto-login disabled - signing out user');
            await supabase.auth.signOut();
            setUser(null);
            setLoading(false);
            isLoading = false;
          }
        } else {
          setUser(null);
          setLoading(false);
          isLoading = false;
          console.log('✅ No initial session - user not logged in');
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Handle token refresh - ensure user data is still loaded
        console.log('🔄 Token refreshed, ensuring user data is loaded');
        if (session?.user && !user) {
          console.log('🔄 Loading user data after token refresh');
          await loadUserData(session.user.id);
        }
      }
    });

    // Handle tab focus/blur events to prevent auto-logout
    const handleWindowFocus = async () => {
      if (!mounted) return;
      
      console.log('🔄 Window focused - checking session status');
      
      // Check if we have a valid session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error on focus:', error);
        return;
      }
      
      console.log('🔍 Window focus session check:', { hasSession: !!session, userId: session?.user?.id, hasUser: !!user });
      
      if (session?.user && !user) {
        console.log('🔄 Session exists but user not loaded - reloading user data');
        await loadUserData(session.user.id);
      } else if (!session?.user && user) {
        console.log('🔄 No session but user loaded - signing out');
        setUser(null);
        setLoading(false);
        isLoading = false;
      }
    };

    const handleWindowBlur = () => {
      console.log('🔄 Window blurred');
    };

    // Add event listeners for tab focus/blur
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    // Periodic session check to prevent unexpected logouts
    const sessionCheckInterval = setInterval(async () => {
      if (!mounted || !user) return;
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Periodic session check error:', error);
        return;
      }
      
      if (!session?.user && user) {
        console.log('🔄 Session expired during periodic check - signing out');
        setUser(null);
        setLoading(false);
        isLoading = false;
      }
    }, 30000); // Check every 30 seconds

    return () => {
      mounted = false;
      isLoading = false;
      clearTimeout(loadingTimeout);
      clearInterval(sessionCheckInterval);
      subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Set up real-time subscription for user verification status changes
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Setting up real-time subscription for user:', user.id);
    
    const userSubscription = supabase
      .channel('user-verification-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 User verification status updated:', payload);
          console.log('🔄 Payload details:', {
            event: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            new: payload.new,
            old: payload.old
          });
          // Reload user data when verification status changes
          const loadUserData = async (userId: string) => {
            try {
              console.log('🔄 Reloading user data after verification update...');
              
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select(`
                  id,
                  email,
                  name,
                  user_type,
                  account_type,
                  location,
                  region,
                  verified,
                  phone_verified,
                  phone,
                  business_name,
                  business_description,
                  created_at,
                  total_reviews,
                  verification_status,
                  verification_documents,
                  verification_submitted,
                  phone_verified_at,
                  verified_at,
                  agri_link_verification_requested_at,
                  business_details_completed
                `)
                .eq('id', userId)
                .single();

              if (profileError) {
                console.error('❌ Error reloading user data:', profileError);
                return;
              }

              if (profile) {
                const updatedUser: User = {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  userType: profile.user_type,
                  accountType: profile.account_type,
                  location: profile.location,
                  region: profile.region,
                  verified: profile.verified,
                  phoneVerified: profile.phone_verified,
                  phone: profile.phone,
                  businessName: profile.business_name,
                  businessDescription: profile.business_description,
                  experience: 'Unknown',
                  joinedDate: profile.created_at,
                  totalReviews: profile.total_reviews || 0,
                  verificationStatus: profile.verification_status || 'not_started',
                  verificationDocuments: profile.verification_documents || {},
                  phoneVerifiedAt: profile.phone_verified_at,
                  verifiedAt: profile.verified_at,
                  agriLinkVerificationRequested: profile.verification_submitted || false,
                  agriLinkVerificationRequestedAt: profile.agri_link_verification_requested_at
                };

                setUser(updatedUser);
                console.log('✅ User data reloaded after verification update:', updatedUser.email);
              }
            } catch (error) {
              console.error('❌ Error reloading user data:', error);
            }
          };

          loadUserData(user.id);
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up user verification subscription');
      userSubscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
};
