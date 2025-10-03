-- Completely disable RLS on both tables to restore original functionality
-- This will allow document uploads and admin approvals to work as they did before

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests DISABLE ROW LEVEL SECURITY;
