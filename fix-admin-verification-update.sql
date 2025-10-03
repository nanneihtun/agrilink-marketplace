-- Fix admin verification status update permissions
-- Allow admin users to update verification status of other users

-- First, ensure admin user has admin role in metadata
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@agrilink.com';

-- Create policy for admin users to update verification status
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

-- Alternative: Allow users to update their own verification status
-- (This might be simpler and more secure)
DROP POLICY IF EXISTS "Users can update own verification status" ON public.users;

CREATE POLICY "Users can update own verification status" ON public.users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
