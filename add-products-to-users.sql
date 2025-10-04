-- Script to add products under each user account
-- Run this in Supabase SQL Editor

-- First, let's get the user IDs for reference
-- (You can run this query first to see the user IDs)
SELECT id, email, name, user_type, account_type FROM users WHERE email LIKE '%@example.com' ORDER BY user_type, account_type;

-- Products for Aung Min (farmer1@example.com) - Individual Unverified Farmer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Fresh Organic Rice',
    1800,
    'kg',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'],
    100,
    5,
    100,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Rice and Rice Products',
    'Premium organic rice grown using traditional methods. No pesticides or chemicals used. Perfect for daily consumption and special occasions.',
    'Harvested fresh, stored in proper conditions. Can be delivered within 24 hours.',
    true
FROM users u WHERE u.email = 'farmer1@example.com';

-- Products for Thida Win (farmer2@example.com) - Individual Verified Farmer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Fresh Mangoes - Sein Ta Lone',
    1200,
    'kg',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500',
    ARRAY['https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'],
    80,
    3,
    80,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Fruits',
    'Premium Sein Ta Lone mangoes, one of Myanmar most beloved fruit varieties. Sweet, aromatic, and perfect for eating fresh or making desserts.',
    'Picked at peak ripeness. Available in different sizes. Can be customized for bulk orders.',
    true
FROM users u WHERE u.email = 'farmer2@example.com';

-- Products for Green Valley Farm (farmer3@example.com) - Business Unverified Farmer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Organic Vegetables Mix',
    800,
    'basket',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
    ARRAY['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'],
    50,
    2,
    50,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Vegetables',
    'Fresh organic vegetable mix including tomatoes, onions, garlic, leafy greens, and seasonal produce. Grown using natural farming methods.',
    'Each basket contains 3-4kg of fresh vegetables. Harvested daily for maximum freshness. Can be customized based on preferences.',
    true
FROM users u WHERE u.email = 'farmer3@example.com';

-- Products for Golden Harvest Co. (farmer4@example.com) - Business Verified Farmer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Premium Jasmine Rice - Export Quality',
    2500,
    'bag',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'],
    200,
    10,
    200,
    ARRAY['Home delivery', 'Self pickup', 'Bulk delivery'],
    ARRAY['Cash on delivery', 'Bank transfer', 'Letter of credit'],
    'Rice and Rice Products',
    'Premium jasmine rice suitable for export. Large grains, excellent aroma, and perfect cooking quality. Grown using sustainable farming practices.',
    'Available in 25kg and 50kg bags. Can arrange bulk shipping. Quality certificates available. Minimum order 10 bags.',
    true
FROM users u WHERE u.email = 'farmer4@example.com';

-- Products for Ko Myint (trader1@example.com) - Individual Unverified Trader
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Mixed Agricultural Products',
    1500,
    'kg',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'],
    75,
    5,
    75,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Mixed Products',
    'Various agricultural products sourced from local farmers. Includes rice, beans, and seasonal produce. Fresh and good quality.',
    'Products may vary based on seasonal availability. Can source specific products upon request.',
    true
FROM users u WHERE u.email = 'trader1@example.com';

-- Products for Daw Hla (trader2@example.com) - Individual Verified Trader
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Premium Tea Leaves Collection',
    2000,
    'kg',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    ARRAY['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', 'https://images.unsplash.com/photo-1597318181409-cf1d0a2c0b8e?w=500'],
    60,
    2,
    60,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Tea and Beverages',
    'High-quality tea leaves from Myanmar highlands. Includes green tea, black tea, and specialty blends. Perfect for tea enthusiasts.',
    'Carefully selected and processed. Available in different grades. Can be customized for bulk orders.',
    true
FROM users u WHERE u.email = 'trader2@example.com';

-- Products for Myanmar Trade Hub (trader3@example.com) - Business Unverified Trader
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Agricultural Commodities - Bulk',
    3000,
    'ton',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'],
    10,
    1,
    10,
    ARRAY['Bulk delivery', 'Self pickup'],
    ARRAY['Bank transfer', 'Letter of credit'],
    'Bulk Commodities',
    'Large-scale agricultural commodities for wholesale and export. Includes rice, beans, and other staple crops. Quality guaranteed.',
    'Minimum order 1 ton. Can arrange shipping and logistics. Quality certificates and export documentation available.',
    true
FROM users u WHERE u.email = 'trader3@example.com';

-- Products for AgriConnect Trading (trader4@example.com) - Business Verified Trader
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Export Quality Agricultural Products',
    5000,
    'container',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'],
    5,
    1,
    5,
    ARRAY['Bulk delivery', 'Export shipping'],
    ARRAY['Bank transfer', 'Letter of credit', 'Documentary collection'],
    'Export Products',
    'Premium agricultural products for international markets. Includes rice, pulses, and specialty crops. All products meet international quality standards.',
    'Full container loads available. Complete export documentation and logistics support. Quality certificates and compliance documents included.',
    true
FROM users u WHERE u.email = 'trader4@example.com';

-- Products for Min Ko (buyer1@example.com) - Individual Unverified Buyer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Fresh Produce Collection',
    900,
    'kg',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
    ARRAY['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'],
    40,
    2,
    40,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Mixed Products',
    'Fresh produce collection for home consumption. Includes seasonal fruits and vegetables sourced from local farmers.',
    'Perfect for families. Can be customized based on preferences. Fresh daily delivery available.',
    true
FROM users u WHERE u.email = 'buyer1@example.com';

-- Products for Daw Nwe (buyer2@example.com) - Individual Verified Buyer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Premium Organic Selection',
    1500,
    'basket',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'],
    30,
    1,
    30,
    ARRAY['Home delivery', 'Self pickup'],
    ARRAY['Cash on delivery', 'Bank transfer'],
    'Premium Products',
    'Curated selection of premium organic products. Includes specialty items and seasonal delicacies from verified suppliers.',
    'Quality guaranteed. Can be customized for special occasions. Regular subscription available.',
    true
FROM users u WHERE u.email = 'buyer2@example.com';

-- Products for Fresh Market Chain (buyer3@example.com) - Business Unverified Buyer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Retail Fresh Products',
    1200,
    'kg',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
    ARRAY['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'],
    100,
    10,
    100,
    ARRAY['Bulk delivery', 'Self pickup'],
    ARRAY['Bank transfer', 'Cash on delivery'],
    'Retail Products',
    'Fresh products for retail distribution. Sourced from local farmers and suppliers. Perfect for grocery stores and markets.',
    'Bulk pricing available. Can arrange regular supply contracts. Quality control and packaging included.',
    true
FROM users u WHERE u.email = 'buyer3@example.com';

-- Products for Premium Groceries Ltd (buyer4@example.com) - Business Verified Buyer
INSERT INTO products (seller_id, name, price, unit, location, region, seller_type, seller_name, image, images, quantity, minimum_order, available_quantity, delivery_options, payment_terms, category, description, additional_notes, is_active)
SELECT 
    u.id,
    'Premium Grocery Collection',
    2000,
    'pallet',
    u.location,
    u.region,
    u.user_type,
    u.name,
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'],
    20,
    1,
    20,
    ARRAY['Bulk delivery', 'Wholesale delivery'],
    ARRAY['Bank transfer', 'Letter of credit'],
    'Wholesale Products',
    'Premium grocery collection for high-end retail stores. Includes organic and specialty products with proper packaging and labeling.',
    'Wholesale pricing. Complete packaging and branding services. Regular supply contracts available. Quality certificates included.',
    true
FROM users u WHERE u.email = 'buyer4@example.com';

-- Verify products were created for all 12 users
SELECT 
    p.name,
    p.price,
    p.unit,
    p.category,
    u.name as seller_name,
    u.user_type,
    u.account_type,
    u.verified
FROM products p
JOIN users u ON p.seller_id = u.id
WHERE u.email LIKE '%@example.com'
ORDER BY u.user_type, u.account_type, u.verified;
