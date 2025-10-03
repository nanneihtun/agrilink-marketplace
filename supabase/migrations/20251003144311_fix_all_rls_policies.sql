-- Fix RLS policies for both users and verification_requests tables
-- This will allow proper data access and document persistence

-- 1. Fix users table RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated users to update users" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated users to insert users" ON public.users;

-- Allow all authenticated users to read users table
CREATE POLICY "Allow all authenticated users to read users" ON public.users
FOR SELECT 
TO authenticated
USING (true);

-- Allow all authenticated users to update users table
CREATE POLICY "Allow all authenticated users to update users" ON public.users
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to insert into users table
CREATE POLICY "Allow all authenticated users to insert users" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 2. Fix verification_requests table RLS policies
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
