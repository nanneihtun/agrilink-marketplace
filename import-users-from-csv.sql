-- Import users from CSV file
-- Run this in Supabase SQL Editor

-- First, let's check if we need to clear existing test users
DELETE FROM users WHERE email LIKE '%@example.com' OR email LIKE '%@gmail.com';

-- Import from CSV (you'll need to upload the CSV file first)
-- Note: You'll need to use the Supabase Dashboard to upload the CSV file
-- and then use this COPY command

-- Alternative: Manual INSERT statements from CSV data
-- This is safer and more reliable than CSV import

-- Farmers (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed, business_name, business_description) VALUES
('farmerindi1@gmail.com', 'Aung Min', 'farmer', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456789', false, false, 'not_started', false, false, null, null),
('farmerindi2@gmail.com', 'Thida Win', 'farmer', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456790', true, true, 'verified', true, false, null, null),
('farmerbiz1@gmail.com', 'Green Valley Farm', 'farmer', 'business', 'Sagaing Region, Monywa', 'Sagaing Region', '+959123456791', false, false, 'not_started', false, true, 'Green Valley Farm', 'Organic farming specializing in rice and vegetables'),
('farmerbiz2@gmail.com', 'Golden Harvest Co.', 'farmer', 'business', 'Bago Region, Bago', 'Bago Region', '+959123456792', true, true, 'verified', true, true, 'Golden Harvest Co.', 'Large-scale agricultural production and export');

-- Traders (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed, business_name, business_description) VALUES
('traderindi1@gmail.com', 'Ko Myint', 'trader', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456793', false, false, 'not_started', false, false, null, null),
('traderindi2@gmail.com', 'Daw Hla', 'trader', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456794', true, true, 'verified', true, false, null, null),
('traderbiz1@gmail.com', 'Myanmar Trade Hub', 'trader', 'business', 'Yangon Region, Yangon', 'Yangon Region', '+959123456795', false, false, 'not_started', false, true, 'Myanmar Trade Hub', 'Agricultural commodity trading and distribution'),
('traderbiz2@gmail.com', 'AgriConnect Trading', 'trader', 'business', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456796', true, true, 'verified', true, true, 'AgriConnect Trading', 'Premium agricultural products export and import');

-- Buyers (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed, business_name, business_description) VALUES
('buyerindi1@gmail.com', 'Min Ko', 'buyer', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456797', false, false, 'not_started', false, false, null, null),
('buyerindi2@gmail.com', 'Daw Nwe', 'buyer', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456798', true, true, 'verified', true, false, null, null),
('buyerbiz1@gmail.com', 'Fresh Market Chain', 'buyer', 'business', 'Yangon Region, Yangon', 'Yangon Region', '+959123456799', false, false, 'not_started', false, true, 'Fresh Market Chain', 'Retail chain specializing in fresh agricultural products'),
('buyerbiz2@gmail.com', 'Premium Groceries Ltd', 'buyer', 'business', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456800', true, true, 'verified', true, true, 'Premium Groceries Ltd', 'High-end grocery stores and wholesale distribution');

-- Verify the import
SELECT 
    email, 
    name, 
    user_type, 
    account_type, 
    verified, 
    phone_verified,
    verification_status,
    business_name
FROM users 
WHERE email LIKE '%@gmail.com'
ORDER BY user_type, account_type, verified;
