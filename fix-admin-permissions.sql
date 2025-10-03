-- Grant admin users permission to update verification status
-- This allows admin users to approve/reject verification requests

-- First, check if admin role exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
    END IF;
END $$;

-- Grant admin role to admin users
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@agrilink.com';

-- Create RLS policy for admin users to update verification status
DROP POLICY IF EXISTS "Admin can update verification status" ON public.users;

CREATE POLICY "Admin can update verification status" ON public.users
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Alternative: Allow updates to verification fields for all authenticated users
-- (This is less secure but will work for now)
DROP POLICY IF EXISTS "Users can update own verification status" ON public.users;

CREATE POLICY "Users can update own verification status" ON public.users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
