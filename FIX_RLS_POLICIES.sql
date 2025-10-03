-- Fix RLS policies for messages table
-- This script fixes the Row Level Security policies that are preventing message insertion

-- First, let's check the current policies
-- You can run this in Supabase SQL editor to see current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'messages';

-- Drop existing policies for messages table
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;

-- Create new, more permissive policies for messages table

-- Policy 1: Users can read messages in conversations they participate in
CREATE POLICY "Users can read messages in their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Policy 2: Users can insert messages in conversations they participate in
CREATE POLICY "Users can create messages in their conversations" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Policy 3: Users can update their own messages
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (
  auth.uid() = sender_id
);

-- Policy 4: Users can delete their own messages (optional)
CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (
  auth.uid() = sender_id
);

-- Also fix conversations table policies if needed
DROP POLICY IF EXISTS "Users can read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

-- Create conversations policies
CREATE POLICY "Users can read own conversations" ON public.conversations
FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (
  auth.uid() = buyer_id
);

CREATE POLICY "Users can update own conversations" ON public.conversations
FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- Enable RLS on both tables (if not already enabled)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
-- You can run this to check:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('messages', 'conversations')
-- ORDER BY tablename, policyname;
