import { useState, useEffect } from 'react'
import ENV from '../config/env'

export const useBackendFallback = () => {
  // 🎯 FORCE DEMO MODE: Always return backend unavailable
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [checking, setChecking] = useState(false) // Skip checking entirely

  useEffect(() => {
    // Force demo mode immediately
    console.log('🎯 DEMO MODE ACTIVATED: Backend disabled, using local demo data')
    setBackendAvailable(false)
    setChecking(false)
  }, [])

  return { backendAvailable, checking }
}