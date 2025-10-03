-- Fix RLS policies for verification_requests table
-- Allow users to insert their own verification requests
-- Allow admins to read and update all verification requests

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can read own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can read all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Allow all authenticated users to insert verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Allow all authenticated users to read verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Allow all authenticated users to update verification requests" ON public.verification_requests;

-- Allow all authenticated users to insert verification requests
CREATE POLICY "Allow all authenticated users to insert verification requests" ON public.verification_requests
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to read verification requests
CREATE POLICY "Allow all authenticated users to read verification requests" ON public.verification_requests
FOR SELECT 
TO authenticated
USING (true);

-- Allow all authenticated users to update verification requests
CREATE POLICY "Allow all authenticated users to update verification requests" ON public.verification_requests
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);
