// Check if products have payment terms in the database
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDIxOTIsImV4cCI6MjA3NDkxODE5Mn0.2nAVFSEZK4Je5LqI1H_otibVhpMarVOyiRBXmkxuAWM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProductPaymentTerms() {
  console.log('🔍 Checking product payment terms in database...\n');
  
  try {
    // Get products for farmerindi1
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', '72c8f83d-1496-48f4-ab23-40be1aa8284d')
      .limit(2);
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    console.log(`✅ Found ${products.length} products for farmerindi1`);
    
    products.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.name}`);
      console.log(`  Payment Terms (raw):`, product.payment_terms);
      console.log(`  Payment Terms (type):`, typeof product.payment_terms);
      console.log(`  Payment Terms (is array):`, Array.isArray(product.payment_terms));
      
      if (product.payment_terms) {
        console.log(`  Payment Terms (length):`, product.payment_terms.length);
        product.payment_terms.forEach((term, i) => {
          console.log(`    ${i + 1}. ${term}`);
        });
      } else {
        console.log(`  ❌ No payment terms found!`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkProductPaymentTerms().catch(console.error);
