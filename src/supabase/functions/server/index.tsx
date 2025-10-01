import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Apply CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Apply logger middleware
app.use('*', logger(console.log))

// Initialize Supabase admin client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to get user from token
async function getUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return null
  }
  
  return user
}

// Helper function to get user profile from KV store
async function getUserProfile(userId: string) {
  try {
    const profile = await kv.get(`profile-${userId}`)
    return profile
  } catch (error) {
    console.log('Error fetching profile from KV:', error)
    return null
  }
}

// Helper function to save user profile to KV store
async function saveUserProfile(userId: string, profileData: any) {
  try {
    const profile = {
      id: userId,
      ...profileData,
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    await kv.set(`profile-${userId}`, profile)
    return profile
  } catch (error) {
    console.log('Error saving profile to KV:', error)
    throw error
  }
}

// Authentication Routes
app.post('/make-server-aa5728d5/auth/signup', async (c) => {
  try {
    const { email, password, name, userType, location, phone, businessName, businessDescription, experience, qualityCertifications, farmingMethods } = await c.req.json()
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      email_confirm: true // Auto-confirm since we don't have email server configured
    })
    
    if (authError) {
      console.log('Auth error during signup:', authError)
      return c.json({ error: authError.message }, 400)
    }
    
    // Create profile in KV store
    const profileData = {
      email,
      name,
      user_type: userType,
      location,
      phone,
      business_name: businessName,
      business_description: businessDescription,
      experience,
      quality_certifications: qualityCertifications || [],
      farming_methods: farmingMethods || [],
      verified: false
    }
    
    const profile = await saveUserProfile(authData.user.id, profileData)
    
    return c.json({ 
      user: authData.user,
      profile: profile
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Signup failed' }, 500)
  }
})

app.post('/make-server-aa5728d5/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.log('Sign in error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Get user profile from KV store
    const profile = await getUserProfile(data.user.id)
    
    if (!profile) {
      console.log('Profile not found for user:', data.user.id)
      return c.json({ error: 'Profile not found' }, 400)
    }
    
    return c.json({
      user: data.user,
      session: data.session,
      profile
    })
  } catch (error) {
    console.log('Sign in error:', error)
    return c.json({ error: 'Sign in failed' }, 500)
  }
})

// Product Routes using KV Store
app.get('/make-server-aa5728d5/products', async (c) => {
  try {
    // Get all products from KV store
    const userProducts = await kv.getByPrefix('user-products-') || []
    const demoProducts = await kv.get('demo-products') || []
    
    // Combine user products and demo products
    const allProducts = [
      ...userProducts.map(item => item.value),
      ...demoProducts
    ]
    
    // Enrich products with profile data
    const enrichedProducts = await Promise.all(
      allProducts.map(async (product) => {
        const profile = await getUserProfile(product.seller_id)
        return {
          ...product,
          profiles: profile ? {
            name: profile.name,
            user_type: profile.user_type,
            location: profile.location,
            business_name: profile.business_name,
            verified: profile.verified
          } : null
        }
      })
    )
    
    return c.json({ products: enrichedProducts })
  } catch (error) {
    console.log('Products fetch error:', error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

app.post('/make-server-aa5728d5/products', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const productData = await c.req.json()
    const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const product = {
      id: productId,
      seller_id: user.id,
      ...productData,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`user-products-${user.id}-${productId}`, product)
    
    return c.json({ product })
  } catch (error) {
    console.log('Product creation error:', error)
    return c.json({ error: 'Failed to create product' }, 500)
  }
})

app.put('/make-server-aa5728d5/products/:id', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const productId = c.req.param('id')
    const updates = await c.req.json()
    
    // Find the product in KV store
    const userProducts = await kv.getByPrefix(`user-products-${user.id}-`) || []
    const productKey = userProducts.find(item => item.value.id === productId)?.key
    
    if (!productKey) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    const existingProduct = await kv.get(productKey)
    const updatedProduct = {
      ...existingProduct,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(productKey, updatedProduct)
    
    return c.json({ product: updatedProduct })
  } catch (error) {
    console.log('Product update error:', error)
    return c.json({ error: 'Failed to update product' }, 500)
  }
})

app.delete('/make-server-aa5728d5/products/:id', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const productId = c.req.param('id')
    
    // Find and delete the product from KV store
    const userProducts = await kv.getByPrefix(`user-products-${user.id}-`) || []
    const productKey = userProducts.find(item => item.value.id === productId)?.key
    
    if (!productKey) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    await kv.del(productKey)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Product deletion error:', error)
    return c.json({ error: 'Failed to delete product' }, 500)
  }
})

// User Products Route
app.get('/make-server-aa5728d5/users/:userId/products', async (c) => {
  try {
    const userId = c.req.param('userId')
    const userProducts = await kv.getByPrefix(`user-products-${userId}-`) || []
    
    const products = userProducts.map(item => item.value)
    
    return c.json({ products })
  } catch (error) {
    console.log('User products fetch error:', error)
    return c.json({ error: 'Failed to fetch user products' }, 500)
  }
})

// Profile Routes using KV Store
app.get('/make-server-aa5728d5/profile', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }
    
    return c.json({ profile })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.put('/make-server-aa5728d5/profile', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const updates = await c.req.json()
    const existingProfile = await getUserProfile(user.id)
    
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const profile = await saveUserProfile(user.id, updatedProfile)
    
    return c.json({ profile })
  } catch (error) {
    console.log('Profile update error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Conversation Routes using KV Store
app.post('/make-server-aa5728d5/conversations', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { sellerId, productId } = await c.req.json()
    
    // Check if conversation already exists
    const conversationKey = `conversation-${user.id}-${sellerId}-${productId}`
    const existingConversation = await kv.get(conversationKey)
    
    if (existingConversation) {
      return c.json({ conversation: existingConversation })
    }
    
    // Create new conversation
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const conversation = {
      id: conversationId,
      buyer_id: user.id,
      seller_id: sellerId,
      product_id: productId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(conversationKey, conversation)
    
    return c.json({ conversation })
  } catch (error) {
    console.log('Conversation creation error:', error)
    return c.json({ error: 'Failed to create conversation' }, 500)
  }
})

app.get('/make-server-aa5728d5/conversations', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get all conversations where user is buyer or seller
    const allConversations = await kv.getByPrefix('conversation-') || []
    const userConversations = allConversations
      .map(item => item.value)
      .filter(conv => conv.buyer_id === user.id || conv.seller_id === user.id)
    
    // Enrich with product and profile data
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const [product, buyer, seller] = await Promise.all([
          kv.get(`user-products-${conv.seller_id}-${conv.product_id}`),
          getUserProfile(conv.buyer_id),
          getUserProfile(conv.seller_id)
        ])
        
        return {
          ...conv,
          products: product ? { name: product.name, images: product.images } : null,
          buyer: buyer ? { name: buyer.name } : null,
          seller: seller ? { name: seller.name } : null
        }
      })
    )
    
    return c.json({ conversations: enrichedConversations })
  } catch (error) {
    console.log('Conversations fetch error:', error)
    return c.json({ error: 'Failed to fetch conversations' }, 500)
  }
})

// Message Routes using KV Store
app.post('/make-server-aa5728d5/messages', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { conversationId, content, messageType = 'text' } = await c.req.json()
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const message = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`message-${conversationId}-${messageId}`, message)
    
    // Update conversation timestamp
    const conversationKeys = await kv.getByPrefix('conversation-') || []
    const conversationKey = conversationKeys.find(item => item.value.id === conversationId)?.key
    if (conversationKey) {
      const conversation = await kv.get(conversationKey)
      await kv.set(conversationKey, {
        ...conversation,
        updated_at: new Date().toISOString()
      })
    }
    
    return c.json({ message })
  } catch (error) {
    console.log('Message creation error:', error)
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

app.get('/make-server-aa5728d5/conversations/:id/messages', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const conversationId = c.req.param('id')
    
    // Verify user is part of this conversation
    const conversationKeys = await kv.getByPrefix('conversation-') || []
    const conversation = conversationKeys
      .map(item => item.value)
      .find(conv => conv.id === conversationId && (conv.buyer_id === user.id || conv.seller_id === user.id))
    
    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404)
    }
    
    // Get all messages for this conversation
    const allMessages = await kv.getByPrefix(`message-${conversationId}-`) || []
    const messages = allMessages
      .map(item => item.value)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    // Enrich with sender data
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await getUserProfile(msg.sender_id)
        return {
          ...msg,
          sender: sender ? { name: sender.name } : null
        }
      })
    )
    
    return c.json({ messages: enrichedMessages })
  } catch (error) {
    console.log('Messages fetch error:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Initialize demo data in KV store
app.post('/make-server-aa5728d5/init-demo-data', async (c) => {
  try {
    // Initialize some demo products if they don't exist
    const existingProducts = await kv.get('demo-products')
    if (!existingProducts) {
      const demoProducts = [
        {
          id: 'demo-product-1',
          seller_id: 'demo-farmer-1',
          name: 'Premium Myanmar Rice',
          description: 'High-quality aromatic rice from Ayeyarwady Delta',
          category: 'grains',
          price: 45000,
          unit: 'per ton',
          quantity_available: 50,
          location: 'Ayeyarwady',
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c'],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      await kv.set('demo-products', demoProducts)
    }
    
    return c.json({ success: true, message: 'Demo data initialized' })
  } catch (error) {
    console.log('Demo data initialization error:', error)
    return c.json({ error: 'Failed to initialize demo data' }, 500)
  }
})

// Legacy KV routes for backwards compatibility
app.get('/make-server-aa5728d5/kv/products', async (c) => {
  return c.redirect('/make-server-aa5728d5/products')
})

app.post('/make-server-aa5728d5/kv/products', async (c) => {
  return c.redirect('/make-server-aa5728d5/products')
})

app.get('/make-server-aa5728d5/kv/users/:userId/products', async (c) => {
  const userId = c.req.param('userId')
  return c.redirect(`/make-server-aa5728d5/users/${userId}/products`)
})

// Health check
app.get('/make-server-aa5728d5/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Start the server
Deno.serve(app.fetch)