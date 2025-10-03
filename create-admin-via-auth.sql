-- Alternative approach: Create admin user via Supabase Auth
-- This script creates an admin user that can be used with Supabase Auth

-- Method 1: Create user directly in auth.users (if you have access)
-- Note: This requires superuser privileges or RLS bypass

-- First, let's check if the user already exists
SELECT 
    id,
    email,
    user_type,
    verified
FROM public.users 
WHERE email = 'admin@agrilink.com';

-- If no user exists, we'll create one with a simple approach
-- This avoids foreign key constraint issues

-- Create admin user with minimal required fields
INSERT INTO public.users (
    email,
    name,
    user_type,
    verified,
    phone_verified,
    created_at,
    updated_at
) 
SELECT 
    'admin@agrilink.com',
    'AgriLink Admin',
    'admin',
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@agrilink.com'
);

-- Update the user to admin type if they already exist
UPDATE public.users 
SET 
    user_type = 'admin',
    verified = true,
    phone_verified = true,
    name = 'AgriLink Admin',
    updated_at = NOW()
WHERE email = 'admin@agrilink.com';

-- Show the final admin user
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
