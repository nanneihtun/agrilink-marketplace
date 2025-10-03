-- Revert RLS policies to a simpler, working setup
-- This should restore document upload functionality

-- 1. Disable RLS temporarily on both tables to restore functionality
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests DISABLE ROW LEVEL SECURITY;

-- 2. Re-enable RLS with simple policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create simple, working RLS policies
-- For users table - allow all authenticated users to do everything
DROP POLICY IF EXISTS "Allow all authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated users to update users" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated users to insert users" ON public.users;
DROP POLICY IF EXISTS "Admin can update verification status" ON public.users;
DROP POLICY IF EXISTS "Users can update own verification status" ON public.users;

CREATE POLICY "Allow authenticated users to read users" ON public.users
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update users" ON public.users
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert users" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- For verification_requests table - allow all authenticated users to do everything
DROP POLICY IF EXISTS "Allow all authenticated users to insert verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Allow all authenticated users to read verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Allow all authenticated users to update verification requests" ON public.verification_requests;

CREATE POLICY "Allow authenticated users to insert verification requests" ON public.verification_requests
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read verification requests" ON public.verification_requests
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update verification requests" ON public.verification_requests
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);
