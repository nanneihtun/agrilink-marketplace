-- Safe script to add rating columns and fix foreign key issues
-- This script handles the case where there might be table naming issues

-- First, let's check what tables exist and fix any naming issues
-- Add rating column if it doesn't exist (check both users and users_backup)
DO $$ 
BEGIN
    -- Check if users table exists and add rating column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'rating'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.users ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
        END IF;
    END IF;
    
    -- Check if users_backup table exists and add rating column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_backup' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users_backup' 
            AND column_name = 'rating'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.users_backup ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Add total_reviews column
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'total_reviews'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.users ADD COLUMN total_reviews INTEGER DEFAULT 0;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_backup' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users_backup' 
            AND column_name = 'total_reviews'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.users_backup ADD COLUMN total_reviews INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Add response_time column
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'response_time'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.users ADD COLUMN response_time TEXT;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_backup' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users_backup' 
            AND column_name = 'response_time'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.users_backup ADD COLUMN response_time TEXT;
        END IF;
    END IF;
END $$;

-- Drop existing reviews table if it has wrong foreign key references
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create reviews table with correct foreign key references
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- Add some sample data for testing (only if users exist)
DO $$
DECLARE
    user_count INTEGER;
    farmer_count INTEGER;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO user_count FROM public.users;
    
    -- Count farmers
    SELECT COUNT(*) INTO farmer_count FROM public.users WHERE user_type = 'farmer';
    
    -- Only add sample data if we have users
    IF user_count > 0 AND farmer_count > 0 THEN
        -- Add sample reviews
        INSERT INTO public.reviews (reviewer_id, reviewee_id, rating, comment) 
        SELECT 
            u1.id as reviewer_id,
            u2.id as reviewee_id,
            (4 + (random() * 2)::int) as rating, -- Random rating between 4-5
            CASE 
                WHEN (random() * 3)::int = 0 THEN 'Great seller, fast response!'
                WHEN (random() * 3)::int = 1 THEN 'Excellent quality products!'
                ELSE 'Very reliable and professional!'
            END as comment
        FROM public.users u1, public.users u2 
        WHERE u1.id != u2.id 
        AND u2.user_type = 'farmer'
        LIMIT 5
        ON CONFLICT DO NOTHING;
        
        -- Update user ratings based on reviews
        UPDATE public.users 
        SET 
            rating = COALESCE((
                SELECT ROUND(AVG(rating)::numeric, 1) 
                FROM public.reviews 
                WHERE reviewee_id = users.id
            ), 0),
            total_reviews = COALESCE((
                SELECT COUNT(*) 
                FROM public.reviews 
                WHERE reviewee_id = users.id
            ), 0)
        WHERE id IN (
            SELECT DISTINCT reviewee_id FROM public.reviews
        );
    END IF;
END $$;
