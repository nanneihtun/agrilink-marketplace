-- Script to create all 12 users with different combinations
-- Run this in Supabase SQL Editor

-- Farmers (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed, business_name, business_description) VALUES
('farmer1@example.com', 'Aung Min', 'farmer', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456789', false, false, 'not_started', false, false, null, null),
('farmer2@example.com', 'Thida Win', 'farmer', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456790', true, true, 'verified', true, false, null, null),
('farmer3@example.com', 'Green Valley Farm', 'farmer', 'business', 'Sagaing Region, Monywa', 'Sagaing Region', '+959123456791', false, false, 'not_started', false, true, 'Green Valley Farm', 'Organic farming specializing in rice and vegetables'),
('farmer4@example.com', 'Golden Harvest Co.', 'farmer', 'business', 'Bago Region, Bago', 'Bago Region', '+959123456792', true, true, 'verified', true, true, 'Golden Harvest Co.', 'Large-scale agricultural production and export');

-- Traders (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed, business_name, business_description) VALUES
('trader1@example.com', 'Ko Myint', 'trader', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456793', false, false, 'not_started', false, false, null, null),
('trader2@example.com', 'Daw Hla', 'trader', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456794', true, true, 'verified', true, false, null, null),
('trader3@example.com', 'Myanmar Trade Hub', 'trader', 'business', 'Yangon Region, Yangon', 'Yangon Region', '+959123456795', false, false, 'not_started', false, true, 'Myanmar Trade Hub', 'Agricultural commodity trading and distribution'),
('trader4@example.com', 'AgriConnect Trading', 'trader', 'business', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456796', true, true, 'verified', true, true, 'AgriConnect Trading', 'Premium agricultural products export and import');

-- Buyers (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed, business_name, business_description) VALUES
('buyer1@example.com', 'Min Ko', 'buyer', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456797', false, false, 'not_started', false, false, null, null),
('buyer2@example.com', 'Daw Nwe', 'buyer', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456798', true, true, 'verified', true, false, null, null),
('buyer3@example.com', 'Fresh Market Chain', 'buyer', 'business', 'Yangon Region, Yangon', 'Yangon Region', '+959123456799', false, false, 'not_started', false, true, 'Fresh Market Chain', 'Retail chain specializing in fresh agricultural products'),
('buyer4@example.com', 'Premium Groceries Ltd', 'buyer', 'business', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456800', true, true, 'verified', true, true, 'Premium Groceries Ltd', 'High-end grocery stores and wholesale distribution');

-- Verify all users were created
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
WHERE email LIKE '%@example.com'
ORDER BY user_type, account_type, verified;
