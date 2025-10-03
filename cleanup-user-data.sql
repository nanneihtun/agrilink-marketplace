-- Cleanup script to remove existing user data for testing
-- This will help resolve the "User already registered" error

-- First, let's see what users exist
SELECT id, email, name, user_type FROM public.users ORDER BY created_at DESC;

-- Delete the specific user that's causing the issue
DELETE FROM public.users WHERE email = 'nanneihtun@gmail.com';

-- Also clean up any related data
DELETE FROM public.products WHERE seller_id IN (
    SELECT id FROM public.users WHERE email = 'nanneihtun@gmail.com'
);

DELETE FROM public.reviews WHERE reviewer_id IN (
    SELECT id FROM public.users WHERE email = 'nanneihtun@gmail.com'
) OR reviewee_id IN (
    SELECT id FROM public.users WHERE email = 'nanneihtun@gmail.com'
);

-- Clean up any chat/message data
DELETE FROM public.messages WHERE sender_id IN (
    SELECT id FROM public.users WHERE email = 'nanneihtun@gmail.com'
);

DELETE FROM public.chats WHERE seller_id IN (
    SELECT id FROM public.users WHERE email = 'nanneihtun@gmail.com'
) OR buyer_id IN (
    SELECT id FROM public.users WHERE email = 'nanneihtun@gmail.com'
);

-- Verify the user is deleted
SELECT 'User cleanup completed' as status;
