import { createClient } from '@supabase/supabase-js';
import ENV from '../config/env';

// Create Supabase client only if properly configured
let supabase: any = null;

try {
  if (ENV.isSupabaseConfigured()) {
    supabase = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ANON_KEY
    );
  } else {
    console.log('🎯 Supabase not configured, using null client');
    supabase = null;
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  supabase = null;
}

// Export for compatibility
export { supabase };
export default supabase;

