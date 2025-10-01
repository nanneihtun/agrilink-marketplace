import { useState, useEffect } from 'react'
import ENV from '../config/env'

export const useBackendFallback = () => {
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkBackendAvailability = async () => {
      setChecking(true)
      
      try {
        // Check if Supabase is properly configured
        if (!ENV.isSupabaseConfigured()) {
          console.log('🔧 Supabase not configured, using local mode')
          setBackendAvailable(false)
          setChecking(false)
          return
        }

        // Try to connect to Supabase
        const { supabase } = await import('../lib/supabase')
        if (!supabase) {
          console.log('🔧 Supabase client not available, using local mode')
          setBackendAvailable(false)
          setChecking(false)
          return
        }

        // Test connection with a simple query
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)

        if (error) {
          console.log('🔧 Backend connection failed, using local mode:', error.message)
          setBackendAvailable(false)
        } else {
          console.log('✅ Backend connected successfully')
          setBackendAvailable(true)
        }
      } catch (error) {
        console.log('🔧 Backend check failed, using local mode:', error)
        setBackendAvailable(false)
      } finally {
        setChecking(false)
      }
    }

    checkBackendAvailability()
  }, [])

  return { backendAvailable, checking }
}