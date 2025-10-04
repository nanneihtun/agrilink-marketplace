// Script to set up authentication for the 12 new users
// Run this with: node setup-user-auth.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from your project
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDIxOTIsImV4cCI6MjA3NDkxODE5Mn0.2nAVFSEZK4Je5LqI1H_otibVhpMarVOyiRBXmkxuAWM';

// Service role key for admin operations
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MjE5MiwiZXhwIjoyMDc0OTE4MTkyfQ.1vRnkxy9XWqI5n3KDdFxVcWk_yhwzvfFUqGsnwG_nTE';

const users = [
  { email: 'farmerindi1@gmail.com', name: 'Aung Min' },
  { email: 'farmerindi2@gmail.com', name: 'Thida Win' },
  { email: 'farmerbiz1@gmail.com', name: 'Green Valley Farm' },
  { email: 'farmerbiz2@gmail.com', name: 'Golden Harvest Co.' },
  { email: 'traderindi1@gmail.com', name: 'Ko Myint' },
  { email: 'traderindi2@gmail.com', name: 'Daw Hla' },
  { email: 'traderbiz1@gmail.com', name: 'Myanmar Trade Hub' },
  { email: 'traderbiz2@gmail.com', name: 'AgriConnect Trading' },
  { email: 'buyerindi1@gmail.com', name: 'Min Ko' },
  { email: 'buyerindi2@gmail.com', name: 'Daw Nwe' },
  { email: 'buyerbiz1@gmail.com', name: 'Fresh Market Chain' },
  { email: 'buyerbiz2@gmail.com', name: 'Premium Groceries Ltd' }
];

async function setupUserAuth() {
  console.log('🔐 Setting up authentication for 12 users...\n');
  
  // Create Supabase client with service role key for admin operations
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  for (const user of users) {
    try {
      console.log(`Creating auth for: ${user.email}`);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: '123456',
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });
      
      if (authError) {
        console.error(`❌ Error creating auth for ${user.email}:`, authError.message);
        continue;
      }
      
      console.log(`✅ Auth created for: ${user.email}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${user.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Authentication setup complete!');
  console.log('📧 All users can now login with password: 123456');
}

// Run the setup
setupUserAuth().catch(console.error);
