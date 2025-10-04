-- SQL script to create 12 users with different combinations
-- Run this in Supabase SQL Editor

-- Farmers (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed) VALUES
('farmer1@example.com', 'Aung Min', 'farmer', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456789', false, false, 'not_started', false, false),
('farmer2@example.com', 'Thida Win', 'farmer', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456790', true, true, 'verified', true, false),
('farmer3@example.com', 'Green Valley Farm', 'farmer', 'business', 'Sagaing Region, Monywa', 'Sagaing Region', '+959123456791', false, false, 'not_started', false, true),
('farmer4@example.com', 'Golden Harvest Co.', 'farmer', 'business', 'Bago Region, Bago', 'Bago Region', '+959123456792', true, true, 'verified', true, true);

-- Traders (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed) VALUES
('trader1@example.com', 'Ko Myint', 'trader', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456793', false, false, 'not_started', false, false),
('trader2@example.com', 'Daw Hla', 'trader', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456794', true, true, 'verified', true, false),
('trader3@example.com', 'Myanmar Trade Hub', 'trader', 'business', 'Yangon Region, Yangon', 'Yangon Region', '+959123456795', false, false, 'not_started', false, true),
('trader4@example.com', 'AgriConnect Trading', 'trader', 'business', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456796', true, true, 'verified', true, true);

-- Buyers (4 users)
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed) VALUES
('buyer1@example.com', 'Min Ko', 'buyer', 'individual', 'Yangon Region, Yangon', 'Yangon Region', '+959123456797', false, false, 'not_started', false, false),
('buyer2@example.com', 'Daw Nwe', 'buyer', 'individual', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456798', true, true, 'verified', true, false),
('buyer3@example.com', 'Fresh Market Chain', 'buyer', 'business', 'Yangon Region, Yangon', 'Yangon Region', '+959123456799', false, false, 'not_started', false, true),
('buyer4@example.com', 'Premium Groceries Ltd', 'buyer', 'business', 'Mandalay Region, Mandalay', 'Mandalay Region', '+959123456800', true, true, 'verified', true, true);

-- Update business details for business accounts
UPDATE users SET 
  business_name = 'Green Valley Farm',
  business_description = 'Organic farming specializing in rice and vegetables'
WHERE email = 'farmer3@example.com';

UPDATE users SET 
  business_name = 'Golden Harvest Co.',
  business_description = 'Large-scale agricultural production and export'
WHERE email = 'farmer4@example.com';

UPDATE users SET 
  business_name = 'Myanmar Trade Hub',
  business_description = 'Agricultural commodity trading and distribution'
WHERE email = 'trader3@example.com';

UPDATE users SET 
  business_name = 'AgriConnect Trading',
  business_description = 'Premium agricultural products export and import'
WHERE email = 'trader4@example.com';

UPDATE users SET 
  business_name = 'Fresh Market Chain',
  business_description = 'Retail chain specializing in fresh agricultural products'
WHERE email = 'buyer3@example.com';

UPDATE users SET 
  business_name = 'Premium Groceries Ltd',
  business_description = 'High-end grocery stores and wholesale distribution'
WHERE email = 'buyer4@example.com';
