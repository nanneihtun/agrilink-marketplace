-- Simple admin user creation script
-- This script creates an admin user without foreign key constraint issues

-- First, let's create the admin user with auto-generated UUID
INSERT INTO public.users (
    email,
    name,
    user_type,
    account_type,
    verified,
    phone_verified,
    phone,
    location,
    region,
    created_at,
    updated_at
) VALUES (
    'admin@agrilink.com',
    'AgriLink Admin',
    'admin',
    'individual',
    true,
    true,
    '+1234567890',
    'Yangon',
    'yangon',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type,
    account_type = EXCLUDED.account_type,
    verified = EXCLUDED.verified,
    phone_verified = EXCLUDED.phone_verified,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    region = EXCLUDED.region,
    updated_at = NOW();

-- Show the created admin user
SELECT 
    id,
    email,
    name,
    user_type,
    account_type,
    verified,
    phone_verified,
    phone,
    location,
    region,
    created_at
FROM public.users 
WHERE email = 'admin@agrilink.com';
