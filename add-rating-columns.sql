-- Add rating and review columns to users table if they don't exist
-- This script is safe to run multiple times

-- Add rating column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'rating'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;
END $$;

-- Add total_reviews column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'total_reviews'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add response_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'response_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN response_time TEXT;
    END IF;
END $$;

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- Add some sample data for testing
INSERT INTO public.reviews (reviewer_id, reviewee_id, rating, comment) 
SELECT 
    u1.id as reviewer_id,
    u2.id as reviewee_id,
    4 as rating,
    'Great seller, fast response!' as comment
FROM public.users u1, public.users u2 
WHERE u1.id != u2.id 
AND u2.user_type = 'farmer'
LIMIT 3
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
