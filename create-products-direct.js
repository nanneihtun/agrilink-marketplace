// Script to create products directly using Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MjE5MiwiZXhwIjoyMDc0OTE4MTkyfQ.1vRnkxy9XWqI5n3KDdFxVcWk_yhwzvfFUqGsnwG_nTE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Product data
const products = [
  // Aung Min (farmerindi1@gmail.com)
  { seller_email: 'farmerindi1@gmail.com', name: 'Jasmine Rice', category: 'Rice & Grains', description: 'Fragrant long-grain jasmine rice', package_size: '25kg bag', price_mmk: 90000, stock: 80, min_order: 1, region: 'Ayeyarwady', city: 'Pathein', delivery_options: 'Pickup, Regional, Nationwide', payment_terms: 'Cash, Mobile, Bank', notes: 'Harvested Oct 2024' },
  { seller_email: 'farmerindi1@gmail.com', name: 'Dry Red Onion', category: 'Vegetables', description: 'Sun-dried red onions, long storage', package_size: '20kg sack', price_mmk: 38000, stock: 60, min_order: 2, region: 'Magway', city: 'Pakokku', delivery_options: 'Pickup, Regional', payment_terms: 'Cash, Mobile', notes: 'Ventilated storage' },
  
  // Thida Win (farmerindi2@gmail.com)
  { seller_email: 'farmerindi2@gmail.com', name: 'Fresh Tomato', category: 'Vegetables', description: 'Vine-ripened tomatoes, sweet', package_size: '10kg basket', price_mmk: 12000, stock: 120, min_order: 2, region: 'Mandalay', city: 'Pyin Oo Lwin', delivery_options: 'Local, Express', payment_terms: 'Cash, Bank', notes: 'Fresh, harvested 3 days' },
  { seller_email: 'farmerindi2@gmail.com', name: 'Shan Apple', category: 'Fruits', description: 'Highland apples, sweet & crunchy', package_size: '10kg crate', price_mmk: 25000, stock: 50, min_order: 1, region: 'Shan', city: 'Taunggyi', delivery_options: 'Regional, Express', payment_terms: 'Mobile, Cash', notes: 'Harvested Nov 2024' },
  
  // Green Valley Farm (farmerbiz1@gmail.com)
  { seller_email: 'farmerbiz1@gmail.com', name: 'Peanut Oil', category: 'Cooking Oil', description: 'Cold-pressed, no additives', package_size: '1L bottle', price_mmk: 6800, stock: 200, min_order: 5, region: 'Mandalay', city: 'Amarapura', delivery_options: 'Pickup, Regional', payment_terms: 'Mobile, Bank', notes: 'Best before Apr 2025' },
  { seller_email: 'farmerbiz1@gmail.com', name: 'Green Grapes', category: 'Fruits', description: 'Seedless grapes from Meiktila', package_size: '5kg box', price_mmk: 18000, stock: 70, min_order: 2, region: 'Mandalay', city: 'Meiktila', delivery_options: 'Local, Express', payment_terms: 'Cash, Mobile', notes: 'Refrigerated' },
  
  // Golden Harvest (farmerbiz2@gmail.com)
  { seller_email: 'farmerbiz2@gmail.com', name: 'Premium Rice', category: 'Rice & Grains', description: 'High-grade rice, contract farmers', package_size: '50kg bag', price_mmk: 160000, stock: 150, min_order: 2, region: 'Ayeyarwady', city: 'Hinthada', delivery_options: 'Pickup, Nationwide', payment_terms: '30/70 Bank', notes: 'Certified quality' },
  { seller_email: 'farmerbiz2@gmail.com', name: 'Bulk Tomato', category: 'Vegetables', description: 'Bulk wholesale supply', package_size: '50kg sack', price_mmk: 55000, stock: 90, min_order: 2, region: 'Bago', city: 'Pyay', delivery_options: 'Regional, Nationwide', payment_terms: 'Bank, Cash', notes: 'Ventilated crates' },
  
  // Ko Myint (traderindi1@gmail.com)
  { seller_email: 'traderindi1@gmail.com', name: 'Peanut Oil', category: 'Cooking Oil', description: 'Cold-pressed, Mandalay origin', package_size: '1L bottle', price_mmk: 6500, stock: 150, min_order: 5, region: 'Mandalay', city: 'Amarapura', delivery_options: 'Pickup, Regional', payment_terms: 'Cash, Mobile', notes: 'Fresh batch' },
  { seller_email: 'traderindi1@gmail.com', name: 'Shan Apple', category: 'Fruits', description: 'Highland apples, sweet taste', package_size: '10kg crate', price_mmk: 24000, stock: 40, min_order: 1, region: 'Shan', city: 'Taunggyi', delivery_options: 'Regional, Express', payment_terms: 'Cash, Bank', notes: 'Crisp texture' },
  
  // Daw Hla (traderindi2@gmail.com)
  { seller_email: 'traderindi2@gmail.com', name: 'Dry Red Onion', category: 'Vegetables', description: 'Local onions, long shelf life', package_size: '20kg sack', price_mmk: 37000, stock: 50, min_order: 1, region: 'Magway', city: 'Pakokku', delivery_options: 'Regional, Pickup', payment_terms: 'Mobile, Cash', notes: 'Sun-dried' },
  { seller_email: 'traderindi2@gmail.com', name: 'Fresh Grapes', category: 'Fruits', description: 'Sweet seedless grapes', package_size: '5kg box', price_mmk: 19000, stock: 60, min_order: 2, region: 'Mandalay', city: 'Meiktila', delivery_options: 'Local, Express', payment_terms: 'Cash, Mobile', notes: 'Refrigerated' },
  
  // Myanmar Trade Hub (traderbiz1@gmail.com)
  { seller_email: 'traderbiz1@gmail.com', name: 'Jasmine Rice', category: 'Rice & Grains', description: 'Fragrant rice, Ayeyarwady', package_size: '25kg bag', price_mmk: 92000, stock: 100, min_order: 2, region: 'Ayeyarwady', city: 'Pathein', delivery_options: 'Pickup, Nationwide', payment_terms: 'Bank, Mobile', notes: 'Polished' },
  { seller_email: 'traderbiz1@gmail.com', name: 'Peanut Oil', category: 'Cooking Oil', description: 'Pure peanut oil', package_size: '1L bottle', price_mmk: 7000, stock: 250, min_order: 10, region: 'Mandalay', city: 'Amarapura', delivery_options: 'Pickup, Regional', payment_terms: 'Bank, Mobile', notes: 'Bottled 2025' },
  
  // AgriConnect (traderbiz2@gmail.com)
  { seller_email: 'traderbiz2@gmail.com', name: 'Fresh Tomato', category: 'Vegetables', description: 'Wholesale tomato', package_size: '50kg sack', price_mmk: 54000, stock: 70, min_order: 1, region: 'Bago', city: 'Pyay', delivery_options: 'Regional, Nationwide', payment_terms: 'Bank, Cash', notes: 'Bulk' },
  { seller_email: 'traderbiz2@gmail.com', name: 'Fresh Grapes', category: 'Fruits', description: 'Green grapes', package_size: '5kg box', price_mmk: 18500, stock: 100, min_order: 2, region: 'Mandalay', city: 'Meiktila', delivery_options: 'Local, Express', payment_terms: 'Cash, Mobile', notes: 'Keep cool' },
  
  // Min Ko (buyerindi1@gmail.com)
  { seller_email: 'buyerindi1@gmail.com', name: 'Jasmine Rice', category: 'Rice & Grains', description: 'For household use', package_size: '10kg bag', price_mmk: 40000, stock: 20, min_order: 1, region: 'Yangon', city: 'Insein', delivery_options: 'Pickup, Delivery', payment_terms: 'Cash, Mobile', notes: 'Small packaging' },
  { seller_email: 'buyerindi1@gmail.com', name: 'Shan Apple', category: 'Fruits', description: 'Family basket of apples', package_size: '5kg box', price_mmk: 15000, stock: 15, min_order: 1, region: 'Shan', city: 'Taunggyi', delivery_options: 'Regional', payment_terms: 'Cash, Mobile', notes: 'Fresh batch' },
  
  // Daw Nwe (buyerindi2@gmail.com)
  { seller_email: 'buyerindi2@gmail.com', name: 'Dry Red Onion', category: 'Vegetables', description: 'Everyday cooking onion', package_size: '10kg sack', price_mmk: 20000, stock: 25, min_order: 1, region: 'Magway', city: 'Pakokku', delivery_options: 'Local', payment_terms: 'Cash, Mobile', notes: 'Fresh' },
  { seller_email: 'buyerindi2@gmail.com', name: 'Fresh Tomato', category: 'Vegetables', description: 'Red tomato', package_size: '5kg basket', price_mmk: 8000, stock: 30, min_order: 1, region: 'Mandalay', city: 'Pyin Oo Lwin', delivery_options: 'Local', payment_terms: 'Cash, Mobile', notes: 'Harvested 2024' },
  
  // Fresh Market Chain (buyerbiz1@gmail.com)
  { seller_email: 'buyerbiz1@gmail.com', name: 'Peanut Oil', category: 'Cooking Oil', description: 'Bulk purchase peanut oil', package_size: '1L bottle', price_mmk: 6500, stock: 300, min_order: 20, region: 'Mandalay', city: 'Amarapura', delivery_options: 'Regional, Pickup', payment_terms: 'Bank, Cash', notes: 'Wholesale' },
  { seller_email: 'buyerbiz1@gmail.com', name: 'Fresh Grapes', category: 'Fruits', description: 'Green grapes', package_size: '5kg box', price_mmk: 17500, stock: 80, min_order: 5, region: 'Mandalay', city: 'Meiktila', delivery_options: 'Regional', payment_terms: 'Cash, Bank', notes: 'For resale' },
  
  // Premium Groceries (buyerbiz2@gmail.com)
  { seller_email: 'buyerbiz2@gmail.com', name: 'Jasmine Rice', category: 'Rice & Grains', description: 'Retail packaged rice', package_size: '25kg bag', price_mmk: 95000, stock: 60, min_order: 1, region: 'Ayeyarwady', city: 'Hinthada', delivery_options: 'Nationwide', payment_terms: 'Bank, Cash', notes: 'For supermarkets' },
  { seller_email: 'buyerbiz2@gmail.com', name: 'Shan Apple', category: 'Fruits', description: 'Premium apples', package_size: '10kg crate', price_mmk: 26000, stock: 40, min_order: 1, region: 'Shan', city: 'Taunggyi', delivery_options: 'Nationwide', payment_terms: 'Bank, Cash', notes: 'Premium grade' }
];

async function createProducts() {
  console.log('🚀 Creating 24 products for all users...\n');
  
  // First, clear existing products
  console.log('🧹 Clearing existing products...');
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .in('seller_email', [
      'farmerindi1@gmail.com', 'farmerindi2@gmail.com', 'farmerbiz1@gmail.com', 'farmerbiz2@gmail.com',
      'traderindi1@gmail.com', 'traderindi2@gmail.com', 'traderbiz1@gmail.com', 'traderbiz2@gmail.com',
      'buyerindi1@gmail.com', 'buyerindi2@gmail.com', 'buyerbiz1@gmail.com', 'buyerbiz2@gmail.com'
    ]);
  
  if (deleteError) {
    console.error('❌ Error clearing products:', deleteError);
    return;
  }
  
  console.log('✅ Existing products cleared\n');
  
  // Insert new products
  console.log('📦 Creating new products...');
  const { data, error } = await supabase
    .from('products')
    .insert(products);
  
  if (error) {
    console.error('❌ Error creating products:', error);
    return;
  }
  
  console.log('✅ All 24 products created successfully!\n');
  
  // Verify products
  console.log('🔍 Verifying products...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('products')
    .select(`
      seller_email,
      name,
      category,
      price_mmk,
      stock,
      users!inner(name, user_type, verified)
    `)
    .in('seller_email', [
      'farmerindi1@gmail.com', 'farmerindi2@gmail.com', 'farmerbiz1@gmail.com', 'farmerbiz2@gmail.com',
      'traderindi1@gmail.com', 'traderindi2@gmail.com', 'traderbiz1@gmail.com', 'traderbiz2@gmail.com',
      'buyerindi1@gmail.com', 'buyerindi2@gmail.com', 'buyerbiz1@gmail.com', 'buyerbiz2@gmail.com'
    ]);
  
  if (verifyError) {
    console.error('❌ Error verifying products:', verifyError);
    return;
  }
  
  console.log('📊 Products created:');
  verifyData.forEach(product => {
    console.log(`  ${product.users.name} (${product.users.user_type}): ${product.name} - ${product.price_mmk} MMK`);
  });
  
  console.log(`\n🎉 Total products created: ${verifyData.length}`);
}

// Run the script
createProducts().catch(console.error);
