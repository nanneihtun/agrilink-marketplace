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

// No localStorage needed - using Supabase backend

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
        // Use the centralized authAPI.signIn function
        const { authAPI } = await import('../services/api')
        const data = await authAPI.signIn(email, password)
        
        if (data.user) {
          // Fetch user profile using profileAPI
          const { profileAPI } = await import('../services/api')
          const profile = await profileAPI.get()
          
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
          setSession(data.session)
          
          // Save to localStorage for session persistence
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(user))
        }
      } else {
        // Local mode - check stored users (no demo users)
        console.log('🔐 Attempting local login for:', email);
        
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
        // Use the fixed authAPI.signUp function
        const { authAPI } = await import('../services/api')
        const result = await authAPI.signUp(userData)
        
        if (result.profile) {
          // Convert profile to User format
          const user: User = {
            id: result.profile.id,
            email: result.profile.email,
            name: result.profile.name,
            userType: result.profile.user_type,
            accountType: result.profile.account_type,
            location: result.profile.location,
            businessName: result.profile.business_name,
            businessDescription: result.profile.business_description,
            experience: result.profile.experience,
            verified: result.profile.verified,
            phoneVerified: result.profile.phone_verified,
            phone: result.profile.phone,
            qualityCertifications: result.profile.quality_certifications || [],
            farmingMethods: result.profile.farming_methods || [],
            joinedDate: result.profile.created_at,
            rating: result.profile.rating || 0,
            totalReviews: result.profile.total_reviews || 0
          }
          
          setUser(user)
          setSession(result.session)
          
          // Save to localStorage for session persistence
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(user))
        }
      } else {
        // Local mode
 // Ensure users storage exists
        
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
        // Use centralized authAPI.signOut
        const { authAPI } = await import('../services/api')
        await authAPI.signOut()
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
        // Use centralized profileAPI.update
        const { profileAPI } = await import('../services/api')
        
        // Convert User updates to backend format
        const backendUpdates = {
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
        }
        
        await profileAPI.update(backendUpdates)
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
      try {
        if (backendAvailable) {
          // Backend mode - only run if backend is actually available
          console.log('🌐 Backend available - checking Supabase session');
          
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.warn('Supabase session error, falling back to local mode:', sessionError);
              throw sessionError; // Fall through to local mode
            }
            
            if (session?.user) {
              // Fetch user profile using profileAPI
              try {
                const { profileAPI } = await import('../services/api')
                const profile = await profileAPI.get()
                
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
              } catch (profileError) {
                console.warn('Profile fetch error:', profileError);
                throw profileError; // Fall through to local mode
              }
            }
          } catch (backendError) {
            console.warn('Backend authentication failed, falling back to local mode:', backendError);
            // Continue to local mode fallback
          }
        }

        // No local fallback - Supabase backend required
        console.log('❌ Backend authentication failed - Supabase connection required');
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