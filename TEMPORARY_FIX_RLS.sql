-- TEMPORARY FIX: Disable RLS for testing
-- WARNING: This removes security - only use for testing!

-- Temporarily disable RLS on messages table
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on conversations table  
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- This will allow messages to be inserted without RLS restrictions
-- After testing, run FIX_RLS_POLICIES.sql to restore proper security
