-- Debug RLS policies and authentication
-- Run this to check what's happening with RLS

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('messages', 'conversations');

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, policyname;

-- Check current user context
SELECT auth.uid() as current_user_id;

-- Test if we can read messages
SELECT COUNT(*) as message_count FROM public.messages;

-- Test if we can read conversations  
SELECT COUNT(*) as conversation_count FROM public.conversations;

-- Try to insert a test message (this will show the exact error)
-- INSERT INTO public.messages (conversation_id, sender_id, content) 
-- VALUES ('test-conversation-id', auth.uid(), 'test message');
