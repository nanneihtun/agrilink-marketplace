import { useState, useEffect, useCallback } from 'react'
import { productsAPI, realtimeAPI } from '../services/api'
import { Product } from '../data/products'
import ENV from '../config/env'
import { useBackendFallback } from './useBackendFallback'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { backendAvailable } = useBackendFallback()

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!backendAvailable || !ENV.isSupabaseConfigured()) {
        console.log('❌ Backend not available - Supabase connection required for products');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Products fetch timeout')), 10000)
      })
      
      // Try to fetch from backend first, fall back to KV store
      try {
        const fetchPromise = productsAPI.getAll()
        const backendProducts = await Promise.race([fetchPromise, timeoutPromise])
        const transformedProducts = backendProducts.map(transformBackendProduct)
        setProducts(transformedProducts)
      } catch (backendError) {
        console.log('Backend fetch failed, trying KV store:', backendError)
        
        try {
          // Fallback to KV store with timeout
          const kvFetchPromise = fetch(`${ENV.SUPABASE_URL}/functions/v1/make-server-aa5728d5/kv/products`, {
            headers: {
              'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`
            }
          })
          
          const response = await Promise.race([kvFetchPromise, timeoutPromise]) as Response
          const result = await response.json()
          
          if (result.products) {
            const transformedProducts = result.products.map(transformBackendProduct)
            setProducts(transformedProducts)
          } else {
            setProducts([])
          }
        } catch (kvError) {
          console.log('KV store also failed, using empty array:', kvError)
          setProducts([])
        }
      }
    } catch (err) {
      console.error('Fetch products error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([]) // Set empty array to prevent infinite loading
    } finally {
      setLoading(false)
    }
  }, [backendAvailable])

  // Transform backend product to frontend format
  const transformBackendProduct = (backendProduct: any): Product => {
    return {
      id: backendProduct.id,
      sellerId: backendProduct.seller_id,
      name: backendProduct.name,
      price: Number(backendProduct.price),
      unit: backendProduct.unit,
      location: backendProduct.location,
      sellerType: backendProduct.profiles?.user_type || 'farmer',
      sellerName: backendProduct.profiles?.business_name || backendProduct.profiles?.name || 'Unknown Seller',
      image: backendProduct.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
      quantity: backendProduct.quantity_available,
      priceChange: Math.floor(Math.random() * 20) - 10, // Random for demo
      lastUpdated: new Date(backendProduct.updated_at).toLocaleDateString(),
      variations: backendProduct.variations || []
    }
  }

  // Transform frontend product to backend format
  const transformFrontendProduct = (frontendProduct: Partial<Product>) => {
    return {
      name: frontendProduct.name,
      description: frontendProduct.variations?.[0]?.description,
      category: 'agriculture', // Default category
      price: frontendProduct.price,
      unit: frontendProduct.unit,
      quantity_available: frontendProduct.quantity,
      location: frontendProduct.location,
      images: frontendProduct.image ? [frontendProduct.image] : [],
      variations: frontendProduct.variations || []
    }
  }

  // Create a new product
  const createProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      if (!backendAvailable || !ENV.isSupabaseConfigured()) {
        console.log('❌ Backend not available - Supabase connection required for creating products');
        throw new Error('Backend connection required');
      }
      
      const backendData = transformFrontendProduct(productData)
      
      try {
        const newProduct = await productsAPI.create(backendData)
        const transformedProduct = transformBackendProduct(newProduct)
        setProducts(prev => [transformedProduct, ...prev])
        return transformedProduct
      } catch (backendError) {
        console.log('Backend create failed, trying KV store:', backendError)
        
        // Fallback to KV store
        const response = await fetch(`${ENV.SUPABASE_URL}/functions/v1/make-server-aa5728d5/kv/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(backendData)
        })
        
        const result = await response.json()
        if (result.product) {
          const transformedProduct = transformBackendProduct(result.product)
          setProducts(prev => [transformedProduct, ...prev])
          return transformedProduct
        }
      }
    } catch (err) {
      console.error('Create product error:', err)
      throw err
    }
  }, [backendAvailable])

  // Update a product
  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      const backendData = transformFrontendProduct(updates)
      const updatedProduct = await productsAPI.update(productId, backendData)
      const transformedProduct = transformBackendProduct(updatedProduct)
      
      setProducts(prev => prev.map(p => p.id === productId ? transformedProduct : p))
      return transformedProduct
    } catch (err) {
      console.error('Update product error:', err)
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

  // Initial fetch - using backendAvailable dependency instead of fetchProducts to prevent loops
  useEffect(() => {
    if (backendAvailable !== undefined) { // Only fetch when we know backend status
      fetchProducts()
    }
  }, [backendAvailable]) // Don't include fetchProducts to prevent loops

  // Set up real-time subscription only when backend is available
  useEffect(() => {
    if (!backendAvailable) return
    
    try {
      const subscription = realtimeAPI.subscribeToProducts((payload) => {
        console.log('Real-time product update:', payload)
        
        if (payload.eventType === 'INSERT') {
          const newProduct = transformBackendProduct(payload.new)
          setProducts(prev => [newProduct, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const updatedProduct = transformBackendProduct(payload.new)
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.log('Real-time subscription failed:', error)
    }
  }, [backendAvailable])

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