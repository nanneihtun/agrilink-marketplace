import { useState, useCallback, useEffect } from 'react';
// Removed demo accounts import to reduce memory usage
import { generateJoinDate } from '../utils/dates';
import { useBackendFallback } from './useBackendFallback';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'farmer' | 'trader' | 'buyer' | 'admin';
  accountType?: 'individual' | 'business';
  location: string;
  region?: string; // Add region field for proper location display
  businessName?: string;
  businessDescription?: string;
  experience: string;
  verified: boolean;
  phoneVerified: boolean;
  phone?: string;
  qualityCertifications?: string[];
  farmingMethods?: string[];
  profileImage?: string;
  storefrontImage?: string;
  joinedDate?: string;
  rating?: number;
  totalReviews?: number;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected';
  verificationRequested?: boolean;
  verificationRequestedAt?: string;
  verificationDocuments?: {
    idCard?: string;
    businessLicense?: string;
    addressProof?: string;
  };
  businessDetailsCompleted?: boolean;
  fullLegalName?: string;
  idNumber?: string;
  farmLocation?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  bankAccountDetails?: string;
  emergencyContact?: string;
  tradingExperience?: string;
  farmSize?: string;
  openingHours?: string;
}

// Utility functions for storage management
const getLocalStorageInfo = () => {
  const estimate = navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : Promise.resolve({ quota: 10 * 1024 * 1024, usage: 0 });
  return estimate.then(({ quota = 10 * 1024 * 1024, usage = 0 }) => ({
    total: quota,
    used: usage,
    available: quota - usage
  })).catch(() => ({
    total: 10 * 1024 * 1024,
    used: 0,
    available: 10 * 1024 * 1024
  }));
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
    return { success: false, error };
  }
};

// Simplified user management - no demo users for memory optimization
const ensureUsersStorage = () => {
  try {
    const existing = localStorage.getItem('agriconnect-myanmar-users');
    if (!existing) {
      localStorage.setItem('agriconnect-myanmar-users', JSON.stringify([]));
    }
  } catch (error) {
    console.error('Failed to initialize users storage:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const { backendAvailable } = useBackendFallback()

  // Authentication functions
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      if (backendAvailable) {
        // Backend mode
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          // Fetch user profile from backend
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          if (profileError) throw profileError
          
          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            userType: profile.user_type,
            accountType: profile.account_type,
            location: profile.location,
            businessName: profile.business_name,
            businessDescription: profile.business_description,
            experience: profile.experience,
            verified: profile.verified,
            phoneVerified: profile.phone_verified,
            phone: profile.phone, // Add phone field from backend
            qualityCertifications: profile.quality_certifications || [],
            farmingMethods: profile.farming_methods || [],
            profileImage: profile.profile_image,
            storefrontImage: profile.storefront_image,
            joinedDate: profile.created_at,
            rating: profile.rating || 0,
            totalReviews: profile.total_reviews || 0
          }
          
          setUser(user)
          setSession(data.session)
          
          // Save to localStorage for session persistence
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(user))
        }
      } else {
        // Local mode - check stored users (no demo users)
        console.log('🔐 Attempting local login for:', email);
        ensureUsersStorage();
        
        const storedUsers = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        console.log('📋 Available users:', storedUsers.length);
        
        const user = storedUsers.find((u: any) => u.email === email && u.password === password)
        
        if (!user) {
          throw new Error('Invalid credentials. Please check your email and password.')
        }
        
        console.log('✅ User found:', user.email, user.userType);
        
        // Create user object without password
        const { password: _, ...userWithoutPassword } = user
        setUser(userWithoutPassword)
        setSession({ user: userWithoutPassword })
        
        // Save current user to localStorage
        localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(userWithoutPassword))
        console.log('✅ Local login successful for:', userWithoutPassword.email);
      }
    } catch (error: any) {
      console.error('Sign in failed:', error)
      throw new Error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }, [backendAvailable])

  const signUp = useCallback(async (userData: any) => {
    setLoading(true)
    try {
      if (backendAvailable) {
        // Backend mode
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
        })
        
        if (error) throw error
        
        if (data.user) {
          // Create user profile in backend
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: userData.email,
              name: userData.name,
              user_type: userData.userType,
              account_type: userData.accountType,
              location: userData.location,
              business_name: userData.businessName,
              business_description: userData.businessDescription,
              experience: userData.experience,
              verified: false,
              phone_verified: false,
              phone: userData.phone, // Add phone field from registration
              quality_certifications: [],
              farming_methods: [],
            })
          
          if (profileError) throw profileError
        }
      } else {
        // Local mode
        ensureUsersStorage(); // Ensure users storage exists
        
        const storedUsers = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        
        // Check if user already exists
        if (storedUsers.some((u: any) => u.email === userData.email)) {
          throw new Error('User with this email already exists')
        }
        
        // Create new user
        const newUser: User = {
          id: `demo-${Date.now()}`,
          email: userData.email,
          name: userData.name,
          userType: userData.userType,
          accountType: userData.accountType,
          location: userData.location,
          businessName: userData.businessName,
          businessDescription: userData.businessDescription,
          experience: userData.experience,
          verified: false,
          phoneVerified: false,
          phone: userData.phone, // Add phone field from registration
          qualityCertifications: [],
          farmingMethods: [],
          joinedDate: new Date().toISOString(),
          rating: 0,
          totalReviews: 0
        }
        
        // Add to stored users
        const newUserWithPassword = { ...newUser, password: userData.password }
        storedUsers.push(newUserWithPassword)
        localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(storedUsers))
        
        // Set as current user
        setUser(newUser)
        setSession({ user: newUser })
        localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(newUser))
      }
    } catch (error: any) {
      console.error('Sign up failed:', error)
      throw new Error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }, [backendAvailable])

  const signOut = useCallback(async () => {
    try {
      if (backendAvailable) {
        await supabase.auth.signOut()
      }
      
      setUser(null)
      setSession(null)
      localStorage.removeItem('agriconnect-myanmar-current-user')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }, [backendAvailable])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return
    
    try {
      if (backendAvailable) {
        // Backend mode
        const { error } = await supabase
          .from('users')
          .update({
            name: updates.name,
            location: updates.location,
            business_name: updates.businessName,
            business_description: updates.businessDescription,
            experience: updates.experience,
            verified: updates.verified,
            phone_verified: updates.phoneVerified,
            quality_certifications: updates.qualityCertifications,
            farming_methods: updates.farmingMethods,
            profile_image: updates.profileImage,
            storefront_image: updates.storefrontImage,
          })
          .eq('id', user.id)
        
        if (error) throw error
      } else {
        // Demo mode
        const storedUsers = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        const userIndex = storedUsers.findIndex((u: any) => u.id === user.id)
        
        if (userIndex !== -1) {
          // Update stored user
          storedUsers[userIndex] = { ...storedUsers[userIndex], ...updates }
          localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(storedUsers))
        }
      }
      
      // Update local state
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }, [user, backendAvailable])

  // Enhanced authentication restoration with better error handling
  useEffect(() => {
    const checkSession = async () => {
      console.log('🎯 DEMO MODE ACTIVATED: Backend disabled, using local demo data');
      console.log('🎯 LOCAL MODE ACTIVATED: Backend disabled, using local storage');
      console.log('🎯 Backend not available, using local mode');

      try {
        if (backendAvailable) {
          // Backend mode - only run if backend is actually available
          console.log('🌐 Backend available - checking Supabase session');
          
          try {
            if (!supabase) {
              console.log('🎯 Supabase client not available, skipping session check');
              throw new Error('Supabase not configured');
            }
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.warn('Supabase session error, falling back to local mode:', sessionError);
              throw sessionError; // Fall through to local mode
            }
            
            if (session?.user) {
              // Fetch user profile
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (profileError) {
                console.warn('Profile fetch error, falling back to local mode:', profileError);
                throw profileError; // Fall through to local mode
              }
              
              if (profile) {
                const user: User = {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  userType: profile.user_type,
                  accountType: profile.account_type,
                  location: profile.location,
                  businessName: profile.business_name,
                  businessDescription: profile.business_description,
                  experience: profile.experience,
                  verified: profile.verified,
                  phoneVerified: profile.phone_verified,
                  phone: profile.phone,
                  qualityCertifications: profile.quality_certifications || [],
                  farmingMethods: profile.farming_methods || [],
                  profileImage: profile.profile_image,
                  storefrontImage: profile.storefront_image,
                  joinedDate: profile.created_at,
                  rating: profile.rating || 0,
                  totalReviews: profile.total_reviews || 0
                }
                
                setUser(user)
                setSession(session)
                
                // Also save to localStorage for consistency
                localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(user))
                console.log('✅ Backend authentication successful:', user.email);
                setLoading(false);
                return; // Success, exit early
              }
            }
          } catch (backendError) {
            console.warn('Backend authentication failed, falling back to local mode:', backendError);
            // Continue to local mode fallback
          }
        }

        // Local mode fallback (also used when backend fails)
        console.log('🎯 Using local authentication mode');
        
        ensureUsersStorage();
        
        try {
          const savedUser = localStorage.getItem('agriconnect-myanmar-current-user')
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser)
            
            // Validate user object
            if (parsedUser && parsedUser.id && parsedUser.email) {
              setUser(parsedUser)
              setSession({ user: parsedUser })
              console.log('✅ Restored user session:', parsedUser.email);
            } else {
              console.warn('⚠️ Invalid stored user data, clearing...');
              localStorage.removeItem('agriconnect-myanmar-current-user');
            }
          } else {
            console.log('📭 No stored user session found');
          }
        } catch (localError) {
          console.error('❌ Failed to restore local session:', localError);
          // Clear corrupted data
          localStorage.removeItem('agriconnect-myanmar-current-user');
        }
      } catch (error) {
        console.error('❌ Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    // Delay initialization slightly to prevent React strict mode issues
    const timeoutId = setTimeout(checkSession, 100);

    // Listen for auth changes (only when backend is available)
    let subscription: any = null;
    
    if (backendAvailable) {
      console.log('🔄 Setting up Supabase auth listener');
      
      try {
        const { data: authData } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔔 Supabase auth event:', event);
            
            if (event === 'SIGNED_OUT' || !session) {
              setUser(null)
              setSession(null)
              localStorage.removeItem('agriconnect-myanmar-current-user')
              console.log('🚪 User signed out');
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Re-fetch user data on sign in or token refresh
              checkSession();
            }
          }
        )
        subscription = authData.subscription;
      } catch (error) {
        console.warn('⚠️ Failed to set up Supabase auth listener:', error);
      }
    } else {
      console.log('⏭️ Skipping Supabase auth listener - backend not available');
    }

    return () => {
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }, [backendAvailable])

  return {
    user,
    loading,
    session,
    signIn,
    signUp,
    signOut,
    updateProfile

  }
}