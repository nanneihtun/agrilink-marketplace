// Simple script to create authentication accounts
// This uses the regular signup method instead of admin createUser

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDIxOTIsImV4cCI6MjA3NDkxODE5Mn0.2nAVFSEZK4Je5LqI1H_otibVhpMarVOyiRBXmkxuAWM';

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
  console.log('⚠️  Note: This will create auth accounts. Make sure users are already in the database!\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  for (const user of users) {
    try {
      console.log(`Creating auth for: ${user.email}`);
      
      // Use signUp method (this will create auth accounts)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: '123456',
        options: {
          data: {
            name: user.name
          }
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
  console.log('\n⚠️  Note: Users may need to confirm their email addresses');
}

// Run the setup
setupUserAuth().catch(console.error);
