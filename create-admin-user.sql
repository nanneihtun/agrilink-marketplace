-- Create admin user for AgriLink verification management
-- This script creates an admin account that can view and manage verification requests

-- Insert admin user into users table
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
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Fixed admin ID for easy reference
    'admin@agrilink.com',
    'AgriLink Admin',
    'admin', -- Special admin user type
    'individual',
    true, -- Admin is pre-verified
    true, -- Admin phone is pre-verified
    '+1234567890', -- Admin phone number
    'Yangon',
    'yangon',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type,
    account_type = EXCLUDED.account_type,
    verified = EXCLUDED.verified,
    phone_verified = EXCLUDED.phone_verified,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    region = EXCLUDED.region,
    updated_at = NOW();

-- Add admin role to the user (if you have a roles system)
-- This is optional but good practice
DO $$ 
BEGIN
    -- Add admin role if roles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES ('00000000-0000-0000-0000-000000000001', 'admin', NOW())
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

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
WHERE id = '00000000-0000-0000-0000-000000000001';
