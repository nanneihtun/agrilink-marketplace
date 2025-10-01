import { projectId, publicAnonKey } from '../utils/supabase/info'

// Environment configuration with safe access
function getEnvironmentVariables() {
  try {
    // Check if we're in a Vite environment first
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteUrl = import.meta.env.VITE_SUPABASE_URL
      const viteKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const viteProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
      
      // Use Vite env vars if available, otherwise fall back to info.tsx
      return {
        SUPABASE_URL: viteUrl || `https://${projectId}.supabase.co`,
        SUPABASE_ANON_KEY: viteKey || publicAnonKey,
        SUPABASE_PROJECT_ID: viteProjectId || projectId,
        isVite: true
      }
    }
  } catch (error) {
    console.log('Vite environment not available, using Supabase info')
  }
  
  // Fall back to the values from info.tsx
  return {
    SUPABASE_URL: `https://${projectId}.supabase.co`,
    SUPABASE_ANON_KEY: publicAnonKey,
    SUPABASE_PROJECT_ID: projectId,
    isVite: false
  }
}

// Initialize environment variables
const envVars = getEnvironmentVariables()

export const ENV = {
  // Environment variables
  SUPABASE_URL: envVars.SUPABASE_URL,
  SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY,
  SUPABASE_PROJECT_ID: envVars.SUPABASE_PROJECT_ID,
  isVite: envVars.isVite,
  
  // Check if Supabase is properly configured
  isSupabaseConfigured(): boolean {
    // Enable Supabase backend
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  }
}

export default ENV