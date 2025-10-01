import { useState, useCallback, useEffect } from 'react';
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
  region?: string;
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
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
    return { success: false, error };
  }
};

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
      if (backendAvailable && supabase) {
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
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(user))
          console.log('✅ Backend sign in successful:', user.email)
        }
      } else {
        // Local mode
        const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        const foundUser = users.find((u: any) => u.email === email && u.password === password)
        
        if (foundUser) {
          setUser(foundUser)
          setSession({ user: foundUser })
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(foundUser))
          console.log('✅ Local sign in successful:', foundUser.email)
        } else {
          throw new Error('Invalid credentials')
        }
      }
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [backendAvailable])

  const signUp = useCallback(async (userData: any) => {
    setLoading(true)
    try {
      if (backendAvailable && supabase) {
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
              phone: userData.phone,
              quality_certifications: userData.qualityCertifications || [],
              farming_methods: userData.farmingMethods || [],
              created_at: new Date().toISOString()
            })
          
          if (profileError) throw profileError
          
          console.log('✅ Backend sign up successful:', userData.email)
        }
      } else {
        // Local mode
        const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        
        const newUser: User = {
          id: `user-${Date.now()}`,
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
          phone: userData.phone,
          qualityCertifications: userData.qualityCertifications || [],
          farmingMethods: userData.farmingMethods || [],
          joinedDate: generateJoinDate(),
          rating: 0,
          totalReviews: 0
        }
        
        users.push(newUser)
        localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(users))
        console.log('✅ Local sign up successful:', userData.email)
      }
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [backendAvailable])

  const signOut = useCallback(async () => {
    try {
      if (backendAvailable && supabase) {
        await supabase.auth.signOut()
      }
      
      setUser(null)
      setSession(null)
      localStorage.removeItem('agriconnect-myanmar-current-user')
      console.log('✅ Sign out successful')
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }, [backendAvailable])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return

    try {
      if (backendAvailable && supabase) {
        const { error } = await supabase
          .from('users')
          .update({
            name: updates.name,
            location: updates.location,
            business_name: updates.businessName,
            business_description: updates.businessDescription,
            experience: updates.experience,
            phone: updates.phone,
            quality_certifications: updates.qualityCertifications,
            farming_methods: updates.farmingMethods,
            profile_image: updates.profileImage,
            storefront_image: updates.storefrontImage
          })
          .eq('id', user.id)

        if (error) throw error
      } else {
        // Local mode
        const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        const userIndex = users.findIndex((u: any) => u.id === user.id)
        
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates }
          localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(users))
        }
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)
      
      // Update localStorage
      const updatedUser = { ...user, ...updates }
      localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(updatedUser))
      
      console.log('✅ Profile updated successfully')
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }, [user, backendAvailable])

  // Simplified authentication restoration
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (backendAvailable && supabase) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.warn('Supabase session error:', sessionError);
            return;
          }
          
          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              console.warn('Profile fetch error:', profileError);
              return;
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
              console.log('✅ Backend authentication successful:', user.email);
              setLoading(false);
              return;
            }
          }
        }

        // Local mode fallback
        ensureUsersStorage();
        
        const savedUser = localStorage.getItem('agriconnect-myanmar-current-user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser)
            setSession({ user: parsedUser })
            console.log('✅ Restored user session:', parsedUser.email);
          } else {
            localStorage.removeItem('agriconnect-myanmar-current-user');
          }
        }
      } catch (error) {
        console.error('❌ Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [backendAvailable]);

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
