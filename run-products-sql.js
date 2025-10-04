// Script to run the products SQL directly
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MjE5MiwiZXhwIjoyMDc0OTE4MTkyfQ.1vRnkxy9XWqI5n3KDdFxVcWk_yhwzvfFUqGsnwG_nTE';

async function runProductsSQL() {
  console.log('🚀 Running products creation SQL...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./create-detailed-products.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ Products SQL executed successfully!');
    console.log('📊 Data:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
runProductsSQL().catch(console.error);
