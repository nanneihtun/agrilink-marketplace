-- Add profile_image column to users table for permanent storage
-- Run this in Supabase Dashboard → SQL Editor

-- Add profile_image column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_image'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_image TEXT;
        RAISE NOTICE '✅ Added profile_image column to users table';
    ELSE
        RAISE NOTICE 'ℹ️ profile_image column already exists in users table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'profile_image';
