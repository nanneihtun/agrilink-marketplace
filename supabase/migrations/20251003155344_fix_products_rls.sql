-- Fix RLS policies for products table to allow creation and reading

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products (for marketplace display)
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own products
CREATE POLICY "Allow users to update own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Allow users to delete their own products
CREATE POLICY "Allow users to delete own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- Allow admin users to do everything
CREATE POLICY "Allow admin full access to products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );
