-- Create detailed products for all 12 users
-- Based on the comprehensive product table provided

-- First, let's clear any existing products for these users
DELETE FROM products WHERE seller_email IN (
    'farmerindi1@gmail.com', 'farmerindi2@gmail.com', 'farmerbiz1@gmail.com', 'farmerbiz2@gmail.com',
    'traderindi1@gmail.com', 'traderindi2@gmail.com', 'traderbiz1@gmail.com', 'traderbiz2@gmail.com',
    'buyerindi1@gmail.com', 'buyerindi2@gmail.com', 'buyerbiz1@gmail.com', 'buyerbiz2@gmail.com'
);

-- FARMERS PRODUCTS
-- Aung Min (farmerindi1@gmail.com) - Individual, Unverified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('farmerindi1@gmail.com', 'Jasmine Rice', 'Rice & Grains', 'Fragrant long-grain jasmine rice', '25kg bag', 90000, 80, 1, 'Ayeyarwady', 'Pathein', 'Pickup, Regional, Nationwide', 'Cash, Mobile, Bank', 'Harvested Oct 2024'),
('farmerindi1@gmail.com', 'Dry Red Onion', 'Vegetables', 'Sun-dried red onions, long storage', '20kg sack', 38000, 60, 2, 'Magway', 'Pakokku', 'Pickup, Regional', 'Cash, Mobile', 'Ventilated storage');

-- Thida Win (farmerindi2@gmail.com) - Individual, Verified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('farmerindi2@gmail.com', 'Fresh Tomato', 'Vegetables', 'Vine-ripened tomatoes, sweet', '10kg basket', 12000, 120, 2, 'Mandalay', 'Pyin Oo Lwin', 'Local, Express', 'Cash, Bank', 'Fresh, harvested 3 days'),
('farmerindi2@gmail.com', 'Shan Apple', 'Fruits', 'Highland apples, sweet & crunchy', '10kg crate', 25000, 50, 1, 'Shan', 'Taunggyi', 'Regional, Express', 'Mobile, Cash', 'Harvested Nov 2024');

-- Green Valley Farm (farmerbiz1@gmail.com) - Business, Unverified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('farmerbiz1@gmail.com', 'Peanut Oil', 'Cooking Oil', 'Cold-pressed, no additives', '1L bottle', 6800, 200, 5, 'Mandalay', 'Amarapura', 'Pickup, Regional', 'Mobile, Bank', 'Best before Apr 2025'),
('farmerbiz1@gmail.com', 'Green Grapes', 'Fruits', 'Seedless grapes from Meiktila', '5kg box', 18000, 70, 2, 'Mandalay', 'Meiktila', 'Local, Express', 'Cash, Mobile', 'Refrigerated');

-- Golden Harvest (farmerbiz2@gmail.com) - Business, Verified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('farmerbiz2@gmail.com', 'Premium Rice', 'Rice & Grains', 'High-grade rice, contract farmers', '50kg bag', 160000, 150, 2, 'Ayeyarwady', 'Hinthada', 'Pickup, Nationwide', '30/70 Bank', 'Certified quality'),
('farmerbiz2@gmail.com', 'Bulk Tomato', 'Vegetables', 'Bulk wholesale supply', '50kg sack', 55000, 90, 2, 'Bago', 'Pyay', 'Regional, Nationwide', 'Bank, Cash', 'Ventilated crates');

-- TRADERS PRODUCTS
-- Ko Myint (traderindi1@gmail.com) - Individual, Unverified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('traderindi1@gmail.com', 'Peanut Oil', 'Cooking Oil', 'Cold-pressed, Mandalay origin', '1L bottle', 6500, 150, 5, 'Mandalay', 'Amarapura', 'Pickup, Regional', 'Cash, Mobile', 'Fresh batch'),
('traderindi1@gmail.com', 'Shan Apple', 'Fruits', 'Highland apples, sweet taste', '10kg crate', 24000, 40, 1, 'Shan', 'Taunggyi', 'Regional, Express', 'Cash, Bank', 'Crisp texture');

-- Daw Hla (traderindi2@gmail.com) - Individual, Verified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('traderindi2@gmail.com', 'Dry Red Onion', 'Vegetables', 'Local onions, long shelf life', '20kg sack', 37000, 50, 1, 'Magway', 'Pakokku', 'Regional, Pickup', 'Mobile, Cash', 'Sun-dried'),
('traderindi2@gmail.com', 'Fresh Grapes', 'Fruits', 'Sweet seedless grapes', '5kg box', 19000, 60, 2, 'Mandalay', 'Meiktila', 'Local, Express', 'Cash, Mobile', 'Refrigerated');

-- Myanmar Trade Hub (traderbiz1@gmail.com) - Business, Unverified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('traderbiz1@gmail.com', 'Jasmine Rice', 'Rice & Grains', 'Fragrant rice, Ayeyarwady', '25kg bag', 92000, 100, 2, 'Ayeyarwady', 'Pathein', 'Pickup, Nationwide', 'Bank, Mobile', 'Polished'),
('traderbiz1@gmail.com', 'Peanut Oil', 'Cooking Oil', 'Pure peanut oil', '1L bottle', 7000, 250, 10, 'Mandalay', 'Amarapura', 'Pickup, Regional', 'Bank, Mobile', 'Bottled 2025');

-- AgriConnect (traderbiz2@gmail.com) - Business, Verified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('traderbiz2@gmail.com', 'Fresh Tomato', 'Vegetables', 'Wholesale tomato', '50kg sack', 54000, 70, 1, 'Bago', 'Pyay', 'Regional, Nationwide', 'Bank, Cash', 'Bulk'),
('traderbiz2@gmail.com', 'Fresh Grapes', 'Fruits', 'Green grapes', '5kg box', 18500, 100, 2, 'Mandalay', 'Meiktila', 'Local, Express', 'Cash, Mobile', 'Keep cool');

-- BUYERS PRODUCTS
-- Min Ko (buyerindi1@gmail.com) - Individual, Unverified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('buyerindi1@gmail.com', 'Jasmine Rice', 'Rice & Grains', 'For household use', '10kg bag', 40000, 20, 1, 'Yangon', 'Insein', 'Pickup, Delivery', 'Cash, Mobile', 'Small packaging'),
('buyerindi1@gmail.com', 'Shan Apple', 'Fruits', 'Family basket of apples', '5kg box', 15000, 15, 1, 'Shan', 'Taunggyi', 'Regional', 'Cash, Mobile', 'Fresh batch');

-- Daw Nwe (buyerindi2@gmail.com) - Individual, Verified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('buyerindi2@gmail.com', 'Dry Red Onion', 'Vegetables', 'Everyday cooking onion', '10kg sack', 20000, 25, 1, 'Magway', 'Pakokku', 'Local', 'Cash, Mobile', 'Fresh'),
('buyerindi2@gmail.com', 'Fresh Tomato', 'Vegetables', 'Red tomato', '5kg basket', 8000, 30, 1, 'Mandalay', 'Pyin Oo Lwin', 'Local', 'Cash, Mobile', 'Harvested 2024');

-- Fresh Market Chain (buyerbiz1@gmail.com) - Business, Unverified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('buyerbiz1@gmail.com', 'Peanut Oil', 'Cooking Oil', 'Bulk purchase peanut oil', '1L bottle', 6500, 300, 20, 'Mandalay', 'Amarapura', 'Regional, Pickup', 'Bank, Cash', 'Wholesale'),
('buyerbiz1@gmail.com', 'Fresh Grapes', 'Fruits', 'Green grapes', '5kg box', 17500, 80, 5, 'Mandalay', 'Meiktila', 'Regional', 'Cash, Bank', 'For resale');

-- Premium Groceries (buyerbiz2@gmail.com) - Business, Verified
INSERT INTO products (seller_email, name, category, description, package_size, price_mmk, stock, min_order, region, city, delivery_options, payment_terms, notes) VALUES
('buyerbiz2@gmail.com', 'Jasmine Rice', 'Rice & Grains', 'Retail packaged rice', '25kg bag', 95000, 60, 1, 'Ayeyarwady', 'Hinthada', 'Nationwide', 'Bank, Cash', 'For supermarkets'),
('buyerbiz2@gmail.com', 'Shan Apple', 'Fruits', 'Premium apples', '10kg crate', 26000, 40, 1, 'Shan', 'Taunggyi', 'Nationwide', 'Bank, Cash', 'Premium grade');

-- Verify all products were created
SELECT 
    p.seller_email,
    u.name as seller_name,
    u.user_type,
    u.verified,
    p.name as product_name,
    p.category,
    p.price_mmk,
    p.stock
FROM products p
JOIN users u ON p.seller_email = u.email
WHERE p.seller_email LIKE '%@gmail.com'
ORDER BY u.user_type, u.verified, p.seller_email, p.name;
