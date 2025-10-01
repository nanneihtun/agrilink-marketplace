import { supabase } from '../lib/supabase'

// Helper to check if Supabase is available
const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not available')
  }
  return supabase
}

// Authentication API - using direct Supabase calls
export const authAPI = {
  signUp: async (userData: {
    email: string
    password: string
    name: string
    userType: 'farmer' | 'trader' | 'buyer'
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
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: userData.email,
        password: userData.password
      })
      
      if (authError) {
        throw authError
      }
      
      if (!authData.user) {
        throw new Error('User creation failed')
      }
      
      // Create user profile in users table
      const { data: profileData, error: profileError } = await supabaseClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          user_type: userData.userType,
          location: userData.location,
          phone: userData.phone,
          business_name: userData.businessName,
          business_description: userData.businessDescription,
          experience: userData.experience,
          quality_certifications: userData.qualityCertifications,
          farming_methods: userData.farmingMethods,
          verified: false,
          phone_verified: false,
          rating: 0,
          total_reviews: 0
        })
        .select()
        .single()
      
      if (profileError) {
        throw profileError
      }
      
      return {
        user: profileData,
        session: authData.session
      }
    } catch (error) {
      console.error('Signup API error:', error)
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
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
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Sign out API error:', error)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      
      if (error) {
        throw error
      }
      
      if (!session?.user) {
        return null
      }
      
      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profileError) {
        throw profileError
      }
      
      return {
        user: profile,
        session
      }
    } catch (error) {
      console.error('Get current user API error:', error)
      throw error
    }
  }
}

// Products API - using direct Supabase calls
export const productsAPI = {
  getAll: async () => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(
            id,
            name,
            business_name,
            user_type,
            verified,
            rating,
            total_reviews
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

  create: async (productData: any) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('products')
        .insert(productData)
        .select(`
          *,
          seller:users!products_seller_id_fkey(
            id,
            name,
            business_name,
            user_type,
            verified,
            rating,
            total_reviews
          )
        `)
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

  update: async (id: string, updates: any) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          seller:users!products_seller_id_fkey(
            id,
            name,
            business_name,
            user_type,
            verified,
            rating,
            total_reviews
          )
        `)
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

  delete: async (id: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Delete product API error:', error)
      throw error
    }
  },

  getByUser: async (userId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(
            id,
            name,
            business_name,
            user_type,
            verified,
            rating,
            total_reviews
          )
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Get user products API error:', error)
      throw error
    }
  }
}

// Conversations API - using direct Supabase calls
export const conversationsAPI = {
  getAll: async () => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('conversations')
        .select(`
          *,
          buyer:users!conversations_buyer_id_fkey(id, name),
          seller:users!conversations_seller_id_fkey(id, name),
          product:products!conversations_product_id_fkey(id, name)
        `)
        .order('updated_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Fetch conversations API error:', error)
      throw error
    }
  },

  create: async (buyerId: string, sellerId: string, productId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('conversations')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId
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
  }
}

// Messages API - using direct Supabase calls
export const messagesAPI = {
  getForConversation: async (conversationId: string) => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
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
  },

  send: async (conversationId: string, content: string, messageType: string = 'text') => {
    try {
      const supabaseClient = checkSupabase()
      
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session?.user) {
        throw new Error('User not authenticated')
      }
      
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content,
          type: messageType
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Send message API error:', error)
      throw error
    }
  }
}

// Real-time API - using Supabase real-time subscriptions
export const realtimeAPI = {
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
      throw error
    }
  },

  subscribeToMessages: (conversationId: string, callback: (payload: any) => void) => {
    try {
      const supabaseClient = checkSupabase()
      
      return supabaseClient
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, callback)
        .subscribe()
    } catch (error) {
      console.error('Subscribe to messages API error:', error)
      throw error
    }
  }
}