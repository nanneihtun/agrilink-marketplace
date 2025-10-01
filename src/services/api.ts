import { supabase } from '../lib/supabase'
import ENV from '../config/env'

// Use direct Supabase API calls instead of edge functions
const API_BASE = ENV.SUPABASE_URL

// Helper to get auth headers
const getAuthHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`
  }
  
  // Add user token if available
  try {
    if (!supabase) {
      console.log('🎯 Supabase client not available, using anon key');
      return headers
    }
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.log('Session error:', error)
      return headers
    }
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (error) {
    console.log('Error getting session for headers:', error)
  }
  
  return headers
}

// Authentication API
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
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(userData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Signup failed')
      }
      
      return result
    } catch (error) {
      console.error('Signup API error:', error)
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ email, password })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Sign in failed')
      }
      
      return result
    } catch (error) {
      console.error('Sign in API error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
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
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      const { data, error } = await supabase
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
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          unit: productData.unit,
          quantity_available: productData.quantity_available,
          location: productData.location,
          images: productData.images,
          variations: productData.variations,
          seller_id: session.user.id
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
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify(updates)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product')
      }
      
      return result.product
    } catch (error) {
      console.error('Update product API error:', error)
      throw error
    }
  },

  delete: async (productId: string) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete product')
      }
      
      return result
    } catch (error) {
      console.error('Delete product API error:', error)
      throw error
    }
  },

  getUserProducts: async (userId: string) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE}/users/${userId}/products`, {
        headers
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user products')
      }
      
      return result.products
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
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile')
      }
      
      return result.profile
    } catch (error) {
      console.error('Fetch profile API error:', error)
      throw error
    }
  },

  update: async (updates: any) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify(updates)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }
      
      return result.profile
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
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ sellerId, productId })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create conversation')
      }
      
      return result.conversation
    } catch (error) {
      console.error('Create conversation API error:', error)
      throw error
    }
  },

  getAll: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        // Return empty array instead of throwing error for missing auth
        console.log('No authenticated session for conversations fetch')
        return []
      }

      const response = await fetch(`${API_BASE}/conversations`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // Check if it's an auth error
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error fetching conversations')
          return []
        }
        throw new Error(result.error || 'Failed to fetch conversations')
      }
      
      return result.conversations || []
    } catch (error) {
      // Only log non-auth errors
      if (!(error instanceof Error && error.message.includes('Not authenticated'))) {
        console.error('Fetch conversations API error:', error)
      }
      return []
    }
  }
}

// Messages API
export const messagesAPI = {
  send: async (conversationId: string, content: string, messageType: string = 'text') => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ conversationId, content, messageType })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }
      
      return result.message
    } catch (error) {
      console.error('Send message API error:', error)
      throw error
    }
  },

  getForConversation: async (conversationId: string) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch messages')
      }
      
      return result.messages
    } catch (error) {
      console.error('Fetch messages API error:', error)
      throw error
    }
  }
}

// Real-time subscriptions (disabled for KV store implementation)
export const realtimeAPI = {
  subscribeToMessages: (conversationId: string, callback: (message: any) => void) => {
    // Return a mock subscription for KV store implementation
    return {
      unsubscribe: () => console.log('Mock subscription unsubscribed')
    }
  },

  subscribeToProducts: (callback: (product: any) => void) => {
    // Return a mock subscription for KV store implementation
    return {
      unsubscribe: () => console.log('Mock subscription unsubscribed')
    }
  }
}