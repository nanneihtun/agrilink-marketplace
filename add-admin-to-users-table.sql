-- Add admin user to users table
-- This script adds the admin user from auth.users to the public.users table

-- First, let's see what users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    phone_confirmed_at
FROM auth.users 
WHERE email = 'admin@agrilink.com';

-- Now let's add the admin user to the public.users table
-- We'll use the ID from auth.users
INSERT INTO public.users (
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
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    'AgriLink Admin',
    'admin',
    'individual',
    true,
    true,
    '+1234567890',
    'Yangon',
    'yangon',
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'admin@agrilink.com'
ON CONFLICT (id) DO UPDATE SET
    user_type = 'admin',
    verified = true,
    phone_verified = true,
    name = 'AgriLink Admin',
    updated_at = NOW();

-- Show the result
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
