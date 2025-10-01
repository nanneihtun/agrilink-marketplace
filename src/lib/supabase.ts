import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ENV from '../config/env';

// Create Supabase client
let supabase: SupabaseClient | null = null;

try {
  if (ENV.isSupabaseConfigured()) {
    supabase = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.log('🔧 Supabase not configured, using null client');
    supabase = null;
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  supabase = null;
}

// Export for compatibility
export { supabase };
export default supabase;

