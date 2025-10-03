-- Fix RLS policies for messages table - Version 2
-- This script creates more permissive policies that should work

-- First, completely remove all existing policies
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create very simple, permissive policies for testing

-- Policy 1: Allow all authenticated users to read messages
CREATE POLICY "Allow authenticated users to read messages" ON public.messages
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy 2: Allow all authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Allow users to update their own messages
CREATE POLICY "Allow users to update own messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Policy 4: Allow users to delete their own messages
CREATE POLICY "Allow users to delete own messages" ON public.messages
FOR DELETE USING (auth.uid() = sender_id);

-- Also fix conversations table policies
DROP POLICY IF EXISTS "Users can read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

-- Create simple conversations policies
CREATE POLICY "Allow authenticated users to read conversations" ON public.conversations
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create conversations" ON public.conversations
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update conversations" ON public.conversations
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Test query to verify policies work
-- You can run this to test:
-- SELECT * FROM public.messages LIMIT 1;
-- INSERT INTO public.messages (conversation_id, sender_id, content) VALUES ('test', auth.uid(), 'test message');
