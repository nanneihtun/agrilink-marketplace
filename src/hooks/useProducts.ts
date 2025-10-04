import { useState, useEffect, useCallback } from 'react'
import { productsAPI, realtimeAPI } from '../services/api'
import { Product } from '../data/products'
import ENV from '../config/env'
import { useDataCache } from './useDataCache'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use cached data fetching
  const { data: cachedProducts, loading: cacheLoading, error: cacheError, fetchData, invalidate } = useDataCache<Product[]>(
    'products',
    async () => {
      if (!ENV.isSupabaseConfigured()) {
        console.log('❌ Supabase not configured');
        return [];
      }
      
      console.log('🔄 Fetching products from Supabase...')
      const backendProducts = await productsAPI.getAll()
      const transformedProducts = backendProducts.map(transformBackendProduct)
      console.log('✅ Products loaded:', transformedProducts.length)
      return transformedProducts;
    },
    { ttl: 2 * 60 * 1000 } // 2 minutes cache
  )

  // Fetch all products (legacy method for compatibility)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchData(true); // Force refresh
      if (result) {
        setProducts(result)
      }
    } catch (err) {
      console.error('Fetch products error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  // Transform backend product to frontend format (matches actual table schema)
  const transformBackendProduct = (backendProduct: any): Product => {
    // Reduced logging for better performance
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('💾 Backend product sample:', {
        id: backendProduct.id,
        name: backendProduct.name,
        price: backendProduct.price
      })
    }
    
    // Get verification status from joined users data
    const userData = backendProduct.users;
    const isVerified = userData?.verified || false;
    const isBusinessVerified = userData?.verified && userData?.account_type === 'business';
    const verificationStatus = userData?.verification_status || 'unverified';
    
    return {
      id: backendProduct.id,
      sellerId: backendProduct.seller_id,
      name: backendProduct.name,
      price: Number(backendProduct.price),
      unit: backendProduct.unit,
      location: backendProduct.location,
      region: backendProduct.region,
      
      // From actual table schema:
      sellerType: backendProduct.seller_type as 'farmer' | 'trader',
      sellerName: backendProduct.seller_name,
      
      // Images
      image: backendProduct.image || backendProduct.images?.[0],
      images: backendProduct.images || [],
      
      // Convert table fields to frontend format:
      quantity: backendProduct.quantity, // Table has 'quantity' field
      minimumOrder: backendProduct.minimum_order || '1 unit',
      availableQuantity: backendProduct.available_quantity || backendProduct.quantity,
      deliveryOptions: backendProduct.delivery_options || ['Pickup'],
      paymentTerms: backendProduct.payment_terms || ['Cash on delivery'],
      
      // Other fields
      category: backendProduct.category,
      description: backendProduct.description,
      additionalNotes: backendProduct.additional_notes,
      priceChange: backendProduct.price_change || 0,
      lastUpdated: backendProduct.last_updated || new Date().toISOString(),
      
      // Verification status from joined users table
      sellerVerified: isVerified,
      sellerVerificationStatus: {
        idVerified: isVerified,
        businessVerified: isBusinessVerified,
        verified: isVerified,
        trustLevel: isBusinessVerified ? 'business-verified' : 
                   isVerified ? 'id-verified' : 
                   verificationStatus === 'under_review' ? 'under-review' : 'unverified',
        tierLabel: isBusinessVerified ? 'Business Verified' : 
                  isVerified ? 'Verified' : 
                  verificationStatus === 'under_review' ? 'Under Review' : 'Unverified',
        levelBadge: isBusinessVerified ? 'Tier 2' : 
                   isVerified ? 'Tier 1' : 
                   verificationStatus === 'under_review' ? 'Under Review' : 'Unverified',
        level: isBusinessVerified ? 2 : isVerified ? 1 : 0,
        userType: backendProduct.seller_type,
        accountType: userData?.account_type
      }
    }
  }

  // Transform frontend product to backend format (matches actual table schema)
  const transformFrontendProduct = (frontendProduct: Partial<Product>) => {
    const transformed = {
      name: frontendProduct.name || '',
      description: frontendProduct.description || '',
      category: frontendProduct.category || 'agriculture',
      price: frontendProduct.price || 0,
      unit: frontendProduct.unit || '',
      location: frontendProduct.location || '',
      region: frontendProduct.region || null,
      
      // Required fields that were missing:
      seller_type: frontendProduct.sellerType || 'farmer',
      seller_name: frontendProduct.sellerName || 'Unknown Seller',
      
      // Convert frontend fields to match table schema:
      quantity: frontendProduct.quantity || '', // Table uses 'quantity' not 'quantity_available'
      minimum_order: frontendProduct.minimumOrder || '1 unit',
      available_quantity: frontendProduct.availableQuantity || frontendProduct.quantity || '',
      delivery_options: frontendProduct.deliveryOptions || ['Pickup'],
      payment_terms: frontendProduct.paymentTerms || ['Cash on delivery'],
      additional_notes: frontendProduct.additionalNotes || null,
      price_change: frontendProduct.priceChange || 0,
      
      // Images - prioritize images array over single image
      image: frontendProduct.images?.[0] || frontendProduct.image || null,
      images: frontendProduct.images && frontendProduct.images.length > 0 
        ? frontendProduct.images 
        : (frontendProduct.image ? [frontendProduct.image] : []),
      
      // Timestamps
      last_updated: new Date().toISOString(),
      is_active: true
    }
    
    // Reduced logging for better performance
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Frontend to backend transform:', {
        name: transformed.name,
        images_count: transformed.images?.length || 0
      })
    }
    return transformed
  }

  // Create a new product
  const createProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }
      
      console.log('➕ Creating product in Supabase:', productData.name);
      const backendData = transformFrontendProduct(productData)
      console.log('🚀 Sending to Supabase:', backendData);
      
      const newProduct = await productsAPI.create(backendData)
      const transformedProduct = transformBackendProduct(newProduct)
      
      console.log('✅ Product created successfully in Supabase');
      setProducts(prev => [transformedProduct, ...prev])
      return transformedProduct
    } catch (err) {
      console.error('❌ Create product error:', err)
      throw err
    }
  }, [])

  // Update a product
  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }
      
      console.log('🔄 Updating product in Supabase:', productId);
      console.log('📝 Update data:', updates);
      
      const backendData = transformFrontendProduct(updates)
      console.log('🚀 Sending to Supabase:', backendData);
      
      const updatedProduct = await productsAPI.update(productId, backendData)
      const transformedProduct = transformBackendProduct(updatedProduct)
      
      console.log('✅ Product updated successfully in Supabase');
      setProducts(prev => prev.map(p => p.id === productId ? transformedProduct : p))
      return transformedProduct
    } catch (err) {
      console.error('❌ Update product error:', err)
      throw err
    }
  }, [])

  // Delete a product
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await productsAPI.delete(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (err) {
      console.error('Delete product error:', err)
      throw err
    }
  }, [])

  // Get user's products
  const getUserProducts = useCallback(async (userId: string) => {
    try {
      const userProducts = await productsAPI.getUserProducts(userId)
      return userProducts.map(transformBackendProduct)
    } catch (err) {
      console.error('Get user products error:', err)
      return []
    }
  }, [])

  // Sync cached data with local state
  useEffect(() => {
    if (cachedProducts) {
      setProducts(cachedProducts)
      setLoading(false)
      setError(null)
    } else if (cacheError) {
      // Don't show database timeout as an error to users
      if (cacheError.includes('timeout') || cacheError.includes('57014')) {
        console.log('⏱️ Database timeout - showing empty state');
        setProducts([])
        setLoading(false)
        setError(null)
      } else {
        setError(cacheError)
        setLoading(false)
      }
    } else if (cacheLoading) {
      setLoading(true)
    }
  }, [cachedProducts, cacheLoading, cacheError])

  // Initial fetch - prevent duplicate calls
  useEffect(() => {
    if (!cachedProducts && !cacheLoading) {
      console.log('🔄 useProducts - Initial fetch starting...');
      fetchData()
    }
  }, [cachedProducts, cacheLoading, fetchData])

  // Set up real-time subscription
  useEffect(() => {
    if (!ENV.isSupabaseConfigured()) return
    
    try {
      const subscription = realtimeAPI.subscribeToProducts((payload) => {
        console.log('Real-time product update:', payload)
        
        if (payload.eventType === 'INSERT') {
          const newProduct = transformBackendProduct(payload.new)
          setProducts(prev => [newProduct, ...prev])
          // Invalidate cache to ensure fresh data
          invalidate()
        } else if (payload.eventType === 'UPDATE') {
          const updatedProduct = transformBackendProduct(payload.new)
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
          // Invalidate cache to ensure fresh data
          invalidate()
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id))
          // Invalidate cache to ensure fresh data
          invalidate()
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.log('Real-time subscription failed:', error)
    }
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getUserProducts
  }
}