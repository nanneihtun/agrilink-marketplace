-- Simple RLS fix - most permissive policies
-- This should definitely work for testing

-- Disable RLS temporarily
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- Wait a moment, then re-enable with very simple policies
-- (Run this in a separate query after the above)

-- Re-enable RLS with simple policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies
CREATE POLICY "simple_read_messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "simple_insert_messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "simple_update_messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "simple_delete_messages" ON public.messages FOR DELETE USING (true);

CREATE POLICY "simple_read_conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "simple_insert_conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "simple_update_conversations" ON public.conversations FOR UPDATE USING (true);
CREATE POLICY "simple_delete_conversations" ON public.conversations FOR DELETE USING (true);
