import { supabase } from '../lib/supabase'

// Helper to check Supabase availability
const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not available')
  }
  return supabase
}

// Authentication API
export const authAPI = {
  signUp: async (userData: {
    email: string
    password: string
    name: string
    userType: 'farmer' | 'trader' | 'buyer'
    accountType?: 'individual' | 'business'
    location: string
    phone?: string
    businessName?: string
    businessDescription?: string
    experience?: string
    qualityCertifications?: string[]
    farmingMethods?: string[]
  }) => {
    try {
      const supabaseClient = checkSupabase()
      
      console.log('🔄 Starting signup process for:', userData.email)
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) {
        console.error('❌ Auth signup failed:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Check if profile already exists (from previous failed attempt)
      const { data: existingProfile } = await supabaseClient
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      let profileData
      if (existingProfile) {
        console.log('✅ Profile already exists, using existing profile')
        // Get the full existing profile
        const { data: fullProfile, error: fetchError } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        if (fetchError) {
          throw new Error(`Failed to fetch existing profile: ${fetchError.message}`)
        }
        profileData = fullProfile
      } else {
        console.log('🔄 Creating new profile...')
        // Create new profile in the users table
        const { data: newProfile, error: profileError } = await supabaseClient
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            user_type: userData.userType,
            account_type: userData.accountType || 'individual',
            location: userData.location,
            phone: userData.phone,
            business_name: userData.businessName,
            business_description: userData.businessDescription,
            experience: userData.experience || 'New to farming',
            quality_certifications: userData.qualityCertifications || [],
            farming_methods: userData.farmingMethods || [],
            verified: false,
            phone_verified: false,
            rating: 0,
            total_reviews: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) {
          console.error('❌ Profile creation failed:', profileError)
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }
        profileData = newProfile
      }

      console.log('✅ Profile ready:', profileData.id)

      return {
        user: authData.user,
        session: authData.session,
        profile: profileData
      }
    } catch (error) {
      console.error('❌ Sign up API error:', error)
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Sign in API error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      const supabaseClient = checkSupabase()
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  getCurrentSession: async () => {
    try {
      const supabaseClient = checkSupabase()
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Get session error:', error)
      throw error
    }
  }
}

// Products API
export const productsAPI = {
  getAll: async () => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey (
            verified,
            phone_verified,
            verification_status,
            account_type
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Fetch products API error:', error)
      throw error
    }
  },

  create: async (productData: {
    name: string
    description?: string
    category: string
    price: number
    unit: string
    quantity_available: string
    location: string
    images: string[]
    variations: any[]
  }) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabaseClient
        .from('products')
        .insert({
          ...productData,
          seller_id: session.user.id, // snake_case for existing table
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Create product API error:', error)
      throw error
    }
  },

  update: async (productId: string, updates: any) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabaseClient
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('seller_id', session.user.id) // Only allow updating own products
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Update product API error:', error)
      throw error
    }
  },

  delete: async (productId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', session.user.id) // Only allow deleting own products
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Delete product API error:', error)
      throw error
    }
  },

  getUserProducts: async (userId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Fetch user products API error:', error)
      throw error
    }
  }
}

// Profile API
export const profileAPI = {
  get: async () => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Fetch profile API error:', error)
      throw error
    }
  },

  update: async (updates: any) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabaseClient
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Update profile API error:', error)
      throw error
    }
  }
}

// Conversations API
export const conversationsAPI = {
  create: async (sellerId: string, productId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('buyer_id', session.user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId)
        .single()

      if (existingConversation) {
        return existingConversation
      }

      // Create new conversation
      const { data, error } = await supabaseClient
        .from('conversations')
        .insert({
          buyer_id: session.user.id,
          seller_id: sellerId,
          product_id: productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Create conversation API error:', error)
      throw error
    }
  },

  getAll: async () => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        return []
      }

      const { data, error } = await supabaseClient
        .from('conversations')
        .select(`
          *,
          buyer:users!conversations_buyer_id_fkey(id, name),
          seller:users!conversations_seller_id_fkey(id, name),
          product:products!conversations_product_id_fkey(id, name)
        `)
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order('updated_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Fetch conversations API error:', error)
      return []
    }
  }
}

// Messages API
export const messagesAPI = {
  send: async (conversationId: string, content: string, messageType: string = 'text') => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content,
          message_type: messageType,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }

      // Update conversation's updated_at timestamp
      await supabaseClient
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
      
      return data
    } catch (error) {
      console.error('Send message API error:', error)
      throw error
    }
  },

  getForConversation: async (conversationId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabaseClient
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Fetch messages API error:', error)
      throw error
    }
  }
}

// Real-time subscriptions
export const realtimeAPI = {
  subscribeToMessages: (conversationId: string, callback: (payload: any) => void) => {
    try {
      const supabaseClient = checkSupabase()
      
      return supabaseClient
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, callback)
        .subscribe()
    } catch (error) {
      console.error('Subscribe to messages API error:', error)
      return { unsubscribe: () => {} }
    }
  },

  subscribeToProducts: (callback: (payload: any) => void) => {
    try {
      const supabaseClient = checkSupabase()
      
      return supabaseClient
        .channel('products')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, callback)
        .subscribe()
    } catch (error) {
      console.error('Subscribe to products API error:', error)
      return { unsubscribe: () => {} }
    }
  }
}// FORCE REBUILD - Thu Oct  2 12:59:23 CEST 2025
