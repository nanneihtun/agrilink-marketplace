import { useState, useEffect, useCallback } from 'react'
import { productsAPI, realtimeAPI } from '../services/api'
import { Product } from '../data/products'
import ENV from '../config/env'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!ENV.isSupabaseConfigured()) {
        console.log('❌ Supabase not configured');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      
      // Fetch products from Supabase
      const backendProducts = await productsAPI.getAll()
      const transformedProducts = backendProducts.map(transformBackendProduct)
      setProducts(transformedProducts)
    } catch (err) {
      console.error('Fetch products error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([]) // Set empty array to prevent infinite loading
    } finally {
      setLoading(false)
    }
  }, [])

  // Transform backend product to frontend format (now much simpler!)
  const transformBackendProduct = (backendProduct: any): Product => {
    return {
      id: backendProduct.id,
      sellerId: backendProduct.sellerId, // Now matches!
      name: backendProduct.name,
      price: Number(backendProduct.price),
      unit: backendProduct.unit,
      location: backendProduct.location,
      region: backendProduct.region,
      sellerType: backendProduct.sellerType || 'farmer',
      sellerName: backendProduct.sellerName || 'Loading...', // Will be populated from user lookup
      image: backendProduct.image || backendProduct.images?.[0],
      images: backendProduct.images || [],
      quantity: backendProduct.quantity,
      minimumOrder: backendProduct.minimumOrder || '1 unit',
      availableQuantity: backendProduct.availableQuantity || backendProduct.quantity,
      deliveryOptions: backendProduct.deliveryOptions || ['Pickup'],
      paymentTerms: backendProduct.paymentTerms || ['Cash on delivery'],
      category: backendProduct.category,
      description: backendProduct.description,
      additionalNotes: backendProduct.additionalNotes,
      priceChange: backendProduct.priceChange || 0,
      lastUpdated: backendProduct.lastUpdated ? new Date(backendProduct.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()
    }
  }

  // Transform frontend product to backend format (now much simpler!)
  const transformFrontendProduct = (frontendProduct: Partial<Product>) => {
    // Since schema now matches frontend, we can pass most fields directly
    const transformed = {
      name: frontendProduct.name || '',
      description: frontendProduct.description || '',
      category: frontendProduct.category || 'agriculture',
      price: frontendProduct.price || 0,
      unit: frontendProduct.unit || '',
      quantity: frontendProduct.quantity || '', // Now matches schema
      location: frontendProduct.location || '',
      region: frontendProduct.region,
      image: frontendProduct.image,
      images: frontendProduct.images || [],
      minimumOrder: frontendProduct.minimumOrder || '1 unit',
      availableQuantity: frontendProduct.availableQuantity || frontendProduct.quantity || '',
      deliveryOptions: frontendProduct.deliveryOptions || ['Pickup'],
      paymentTerms: frontendProduct.paymentTerms || ['Cash on delivery'],
      additionalNotes: frontendProduct.additionalNotes,
      priceChange: frontendProduct.priceChange || 0
    }
    
    console.log('🔄 Frontend to backend transform:', transformed)
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

  // Initial fetch
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Set up real-time subscription
  useEffect(() => {
    if (!ENV.isSupabaseConfigured()) return
    
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