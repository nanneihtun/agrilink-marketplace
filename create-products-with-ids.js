// Script to create products using correct table structure
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MjE5MiwiZXhwIjoyMDc0OTE4MTkyfQ.1vRnkxy9XWqI5n3KDdFxVcWk_yhwzvfFUqGsnwG_nTE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createProducts() {
  console.log('🚀 Creating products for all users...\n');
  
  // First, get all user IDs
  console.log('👥 Getting user IDs...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, user_type, verified')
    .in('email', [
      'farmerindi1@gmail.com', 'farmerindi2@gmail.com', 'farmerbiz1@gmail.com', 'farmerbiz2@gmail.com',
      'traderindi1@gmail.com', 'traderindi2@gmail.com', 'traderbiz1@gmail.com', 'traderbiz2@gmail.com',
      'buyerindi1@gmail.com', 'buyerindi2@gmail.com', 'buyerbiz1@gmail.com', 'buyerbiz2@gmail.com'
    ]);
  
  if (usersError) {
    console.error('❌ Error getting users:', usersError);
    return;
  }
  
  console.log(`✅ Found ${users.length} users`);
  users.forEach(user => {
    console.log(`  ${user.email} (${user.name}) - ID: ${user.id}`);
  });
  
  // Create a map of email to user data
  const userMap = {};
  users.forEach(user => {
    userMap[user.email] = user;
  });
  
  // Product data with user IDs
  const products = [
    // Aung Min (farmerindi1@gmail.com)
    { seller_id: userMap['farmerindi1@gmail.com']?.id, name: 'Jasmine Rice', category: 'Rice & Grains', description: 'Fragrant long-grain jasmine rice', price: 90000, unit: '25kg bag', location: 'Pathein, Ayeyarwady', region: 'Ayeyarwady', seller_type: 'farmer', seller_name: 'Aung Min', quantity: '80 bags', minimum_order: '1 bag', available_quantity: '80 bags', delivery_options: ['Pickup', 'Regional', 'Nationwide'], payment_terms: ['Cash', 'Mobile', 'Bank'], additional_notes: 'Harvested Oct 2024' },
    { seller_id: userMap['farmerindi1@gmail.com']?.id, name: 'Dry Red Onion', category: 'Vegetables', description: 'Sun-dried red onions, long storage', price: 38000, unit: '20kg sack', location: 'Pakokku, Magway', region: 'Magway', seller_type: 'farmer', seller_name: 'Aung Min', quantity: '60 sacks', minimum_order: '2 sacks', available_quantity: '60 sacks', delivery_options: ['Pickup', 'Regional'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Ventilated storage' },
    
    // Thida Win (farmerindi2@gmail.com)
    { seller_id: userMap['farmerindi2@gmail.com']?.id, name: 'Fresh Tomato', category: 'Vegetables', description: 'Vine-ripened tomatoes, sweet', price: 12000, unit: '10kg basket', location: 'Pyin Oo Lwin, Mandalay', region: 'Mandalay', seller_type: 'farmer', seller_name: 'Thida Win', quantity: '120 baskets', minimum_order: '2 baskets', available_quantity: '120 baskets', delivery_options: ['Local', 'Express'], payment_terms: ['Cash', 'Bank'], additional_notes: 'Fresh, harvested 3 days' },
    { seller_id: userMap['farmerindi2@gmail.com']?.id, name: 'Shan Apple', category: 'Fruits', description: 'Highland apples, sweet & crunchy', price: 25000, unit: '10kg crate', location: 'Taunggyi, Shan', region: 'Shan', seller_type: 'farmer', seller_name: 'Thida Win', quantity: '50 crates', minimum_order: '1 crate', available_quantity: '50 crates', delivery_options: ['Regional', 'Express'], payment_terms: ['Mobile', 'Cash'], additional_notes: 'Harvested Nov 2024' },
    
    // Green Valley Farm (farmerbiz1@gmail.com)
    { seller_id: userMap['farmerbiz1@gmail.com']?.id, name: 'Peanut Oil', category: 'Cooking Oil', description: 'Cold-pressed, no additives', price: 6800, unit: '1L bottle', location: 'Amarapura, Mandalay', region: 'Mandalay', seller_type: 'farmer', seller_name: 'Green Valley Farm', quantity: '200 bottles', minimum_order: '5 bottles', available_quantity: '200 bottles', delivery_options: ['Pickup', 'Regional'], payment_terms: ['Mobile', 'Bank'], additional_notes: 'Best before Apr 2025' },
    { seller_id: userMap['farmerbiz1@gmail.com']?.id, name: 'Green Grapes', category: 'Fruits', description: 'Seedless grapes from Meiktila', price: 18000, unit: '5kg box', location: 'Meiktila, Mandalay', region: 'Mandalay', seller_type: 'farmer', seller_name: 'Green Valley Farm', quantity: '70 boxes', minimum_order: '2 boxes', available_quantity: '70 boxes', delivery_options: ['Local', 'Express'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Refrigerated' },
    
    // Golden Harvest (farmerbiz2@gmail.com)
    { seller_id: userMap['farmerbiz2@gmail.com']?.id, name: 'Premium Rice', category: 'Rice & Grains', description: 'High-grade rice, contract farmers', price: 160000, unit: '50kg bag', location: 'Hinthada, Ayeyarwady', region: 'Ayeyarwady', seller_type: 'farmer', seller_name: 'Golden Harvest Co.', quantity: '150 bags', minimum_order: '2 bags', available_quantity: '150 bags', delivery_options: ['Pickup', 'Nationwide'], payment_terms: ['30/70 Bank'], additional_notes: 'Certified quality' },
    { seller_id: userMap['farmerbiz2@gmail.com']?.id, name: 'Bulk Tomato', category: 'Vegetables', description: 'Bulk wholesale supply', price: 55000, unit: '50kg sack', location: 'Pyay, Bago', region: 'Bago', seller_type: 'farmer', seller_name: 'Golden Harvest Co.', quantity: '90 sacks', minimum_order: '2 sacks', available_quantity: '90 sacks', delivery_options: ['Regional', 'Nationwide'], payment_terms: ['Bank', 'Cash'], additional_notes: 'Ventilated crates' },
    
    // Ko Myint (traderindi1@gmail.com)
    { seller_id: userMap['traderindi1@gmail.com']?.id, name: 'Peanut Oil', category: 'Cooking Oil', description: 'Cold-pressed, Mandalay origin', price: 6500, unit: '1L bottle', location: 'Amarapura, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'Ko Myint', quantity: '150 bottles', minimum_order: '5 bottles', available_quantity: '150 bottles', delivery_options: ['Pickup', 'Regional'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Fresh batch' },
    { seller_id: userMap['traderindi1@gmail.com']?.id, name: 'Shan Apple', category: 'Fruits', description: 'Highland apples, sweet taste', price: 24000, unit: '10kg crate', location: 'Taunggyi, Shan', region: 'Shan', seller_type: 'trader', seller_name: 'Ko Myint', quantity: '40 crates', minimum_order: '1 crate', available_quantity: '40 crates', delivery_options: ['Regional', 'Express'], payment_terms: ['Cash', 'Bank'], additional_notes: 'Crisp texture' },
    
    // Daw Hla (traderindi2@gmail.com)
    { seller_id: userMap['traderindi2@gmail.com']?.id, name: 'Dry Red Onion', category: 'Vegetables', description: 'Local onions, long shelf life', price: 37000, unit: '20kg sack', location: 'Pakokku, Magway', region: 'Magway', seller_type: 'trader', seller_name: 'Daw Hla', quantity: '50 sacks', minimum_order: '1 sack', available_quantity: '50 sacks', delivery_options: ['Regional', 'Pickup'], payment_terms: ['Mobile', 'Cash'], additional_notes: 'Sun-dried' },
    { seller_id: userMap['traderindi2@gmail.com']?.id, name: 'Fresh Grapes', category: 'Fruits', description: 'Sweet seedless grapes', price: 19000, unit: '5kg box', location: 'Meiktila, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'Daw Hla', quantity: '60 boxes', minimum_order: '2 boxes', available_quantity: '60 boxes', delivery_options: ['Local', 'Express'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Refrigerated' },
    
    // Myanmar Trade Hub (traderbiz1@gmail.com)
    { seller_id: userMap['traderbiz1@gmail.com']?.id, name: 'Jasmine Rice', category: 'Rice & Grains', description: 'Fragrant rice, Ayeyarwady', price: 92000, unit: '25kg bag', location: 'Pathein, Ayeyarwady', region: 'Ayeyarwady', seller_type: 'trader', seller_name: 'Myanmar Trade Hub', quantity: '100 bags', minimum_order: '2 bags', available_quantity: '100 bags', delivery_options: ['Pickup', 'Nationwide'], payment_terms: ['Bank', 'Mobile'], additional_notes: 'Polished' },
    { seller_id: userMap['traderbiz1@gmail.com']?.id, name: 'Peanut Oil', category: 'Cooking Oil', description: 'Pure peanut oil', price: 7000, unit: '1L bottle', location: 'Amarapura, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'Myanmar Trade Hub', quantity: '250 bottles', minimum_order: '10 bottles', available_quantity: '250 bottles', delivery_options: ['Pickup', 'Regional'], payment_terms: ['Bank', 'Mobile'], additional_notes: 'Bottled 2025' },
    
    // AgriConnect (traderbiz2@gmail.com)
    { seller_id: userMap['traderbiz2@gmail.com']?.id, name: 'Fresh Tomato', category: 'Vegetables', description: 'Wholesale tomato', price: 54000, unit: '50kg sack', location: 'Pyay, Bago', region: 'Bago', seller_type: 'trader', seller_name: 'AgriConnect Trading', quantity: '70 sacks', minimum_order: '1 sack', available_quantity: '70 sacks', delivery_options: ['Regional', 'Nationwide'], payment_terms: ['Bank', 'Cash'], additional_notes: 'Bulk' },
    { seller_id: userMap['traderbiz2@gmail.com']?.id, name: 'Fresh Grapes', category: 'Fruits', description: 'Green grapes', price: 18500, unit: '5kg box', location: 'Meiktila, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'AgriConnect Trading', quantity: '100 boxes', minimum_order: '2 boxes', available_quantity: '100 boxes', delivery_options: ['Local', 'Express'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Keep cool' },
    
    // Min Ko (buyerindi1@gmail.com) - Note: Buyers can also sell
    { seller_id: userMap['buyerindi1@gmail.com']?.id, name: 'Jasmine Rice', category: 'Rice & Grains', description: 'For household use', price: 40000, unit: '10kg bag', location: 'Insein, Yangon', region: 'Yangon', seller_type: 'trader', seller_name: 'Min Ko', quantity: '20 bags', minimum_order: '1 bag', available_quantity: '20 bags', delivery_options: ['Pickup', 'Delivery'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Small packaging' },
    { seller_id: userMap['buyerindi1@gmail.com']?.id, name: 'Shan Apple', category: 'Fruits', description: 'Family basket of apples', price: 15000, unit: '5kg box', location: 'Taunggyi, Shan', region: 'Shan', seller_type: 'trader', seller_name: 'Min Ko', quantity: '15 boxes', minimum_order: '1 box', available_quantity: '15 boxes', delivery_options: ['Regional'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Fresh batch' },
    
    // Daw Nwe (buyerindi2@gmail.com)
    { seller_id: userMap['buyerindi2@gmail.com']?.id, name: 'Dry Red Onion', category: 'Vegetables', description: 'Everyday cooking onion', price: 20000, unit: '10kg sack', location: 'Pakokku, Magway', region: 'Magway', seller_type: 'trader', seller_name: 'Daw Nwe', quantity: '25 sacks', minimum_order: '1 sack', available_quantity: '25 sacks', delivery_options: ['Local'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Fresh' },
    { seller_id: userMap['buyerindi2@gmail.com']?.id, name: 'Fresh Tomato', category: 'Vegetables', description: 'Red tomato', price: 8000, unit: '5kg basket', location: 'Pyin Oo Lwin, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'Daw Nwe', quantity: '30 baskets', minimum_order: '1 basket', available_quantity: '30 baskets', delivery_options: ['Local'], payment_terms: ['Cash', 'Mobile'], additional_notes: 'Harvested 2024' },
    
    // Fresh Market Chain (buyerbiz1@gmail.com)
    { seller_id: userMap['buyerbiz1@gmail.com']?.id, name: 'Peanut Oil', category: 'Cooking Oil', description: 'Bulk purchase peanut oil', price: 6500, unit: '1L bottle', location: 'Amarapura, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'Fresh Market Chain', quantity: '300 bottles', minimum_order: '20 bottles', available_quantity: '300 bottles', delivery_options: ['Regional', 'Pickup'], payment_terms: ['Bank', 'Cash'], additional_notes: 'Wholesale' },
    { seller_id: userMap['buyerbiz1@gmail.com']?.id, name: 'Fresh Grapes', category: 'Fruits', description: 'Green grapes', price: 17500, unit: '5kg box', location: 'Meiktila, Mandalay', region: 'Mandalay', seller_type: 'trader', seller_name: 'Fresh Market Chain', quantity: '80 boxes', minimum_order: '5 boxes', available_quantity: '80 boxes', delivery_options: ['Regional'], payment_terms: ['Cash', 'Bank'], additional_notes: 'For resale' },
    
    // Premium Groceries (buyerbiz2@gmail.com)
    { seller_id: userMap['buyerbiz2@gmail.com']?.id, name: 'Jasmine Rice', category: 'Rice & Grains', description: 'Retail packaged rice', price: 95000, unit: '25kg bag', location: 'Hinthada, Ayeyarwady', region: 'Ayeyarwady', seller_type: 'trader', seller_name: 'Premium Groceries Ltd', quantity: '60 bags', minimum_order: '1 bag', available_quantity: '60 bags', delivery_options: ['Nationwide'], payment_terms: ['Bank', 'Cash'], additional_notes: 'For supermarkets' },
    { seller_id: userMap['buyerbiz2@gmail.com']?.id, name: 'Shan Apple', category: 'Fruits', description: 'Premium apples', price: 26000, unit: '10kg crate', location: 'Taunggyi, Shan', region: 'Shan', seller_type: 'trader', seller_name: 'Premium Groceries Ltd', quantity: '40 crates', minimum_order: '1 crate', available_quantity: '40 crates', delivery_options: ['Nationwide'], payment_terms: ['Bank', 'Cash'], additional_notes: 'Premium grade' }
  ].filter(product => product.seller_id); // Filter out products without valid seller_id
  
  console.log(`\n📦 Creating ${products.length} products...`);
  
  // Clear existing products first
  const userIds = users.map(user => user.id);
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .in('seller_id', userIds);
  
  if (deleteError) {
    console.error('❌ Error clearing products:', deleteError);
    return;
  }
  
  console.log('✅ Existing products cleared');
  
  // Insert new products
  const { data, error } = await supabase
    .from('products')
    .insert(products);
  
  if (error) {
    console.error('❌ Error creating products:', error);
    return;
  }
  
  console.log('✅ All products created successfully!\n');
  
  // Verify products
  const { data: verifyData, error: verifyError } = await supabase
    .from('products')
    .select(`
      seller_id,
      name,
      category,
      price,
      quantity,
      users!inner(name, user_type, verified, email)
    `)
    .in('seller_id', userIds);
  
  if (verifyError) {
    console.error('❌ Error verifying products:', verifyError);
    return;
  }
  
  console.log('📊 Products created:');
  verifyData.forEach(product => {
    console.log(`  ${product.users.name} (${product.users.user_type}): ${product.name} - ${product.price} MMK`);
  });
  
  console.log(`\n🎉 Total products created: ${verifyData.length}`);
}

// Run the script
createProducts().catch(console.error);
