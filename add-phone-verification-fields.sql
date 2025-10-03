-- Add phone verification fields to users table
-- This script adds fields needed for Twilio phone verification

-- Add phone_verified field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone_verified'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add phone_verified_at field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone_verified_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add verification_attempts field to track failed attempts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_attempts'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_attempts INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add last_verification_attempt field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_verification_attempt'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN last_verification_attempt TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create index for phone verification queries
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON public.users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('phone', 'phone_verified', 'phone_verified_at', 'verification_attempts', 'last_verification_attempt')
ORDER BY column_name;
