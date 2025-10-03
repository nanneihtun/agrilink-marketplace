-- Add verification columns to users table
-- This script adds the missing verification fields for persistent storage

-- Add verification_status column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_status TEXT DEFAULT 'not_started' 
        CHECK (verification_status IN ('not_started', 'in_progress', 'under_review', 'verified', 'rejected'));
    END IF;
END $$;

-- Add verification_documents column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_documents'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_documents JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add verification_submitted column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_submitted'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_submitted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add phone_verified_at column
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

-- Add verified_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verified_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add agri_link_verification_requested_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'agri_link_verification_requested_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN agri_link_verification_requested_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add business_details_completed column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'business_details_completed'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_details_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing users with default values
UPDATE public.users 
SET 
    verification_status = COALESCE(verification_status, 'not_started'),
    verification_documents = COALESCE(verification_documents, '{}'::JSONB),
    verification_submitted = COALESCE(verification_submitted, FALSE),
    business_details_completed = COALESCE(business_details_completed, FALSE)
WHERE verification_status IS NULL 
   OR verification_documents IS NULL 
   OR verification_submitted IS NULL
   OR business_details_completed IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON public.users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_verification_submitted ON public.users(verification_submitted);

-- Add comments for documentation
COMMENT ON COLUMN public.users.verification_status IS 'Current verification status: not_started, in_progress, under_review, verified, rejected';
COMMENT ON COLUMN public.users.verification_documents IS 'JSONB object containing uploaded verification documents';
COMMENT ON COLUMN public.users.verification_submitted IS 'Whether user has submitted verification request';
COMMENT ON COLUMN public.users.phone_verified_at IS 'Timestamp when phone verification was completed';
COMMENT ON COLUMN public.users.verified_at IS 'Timestamp when full verification was completed';
COMMENT ON COLUMN public.users.agri_link_verification_requested_at IS 'Timestamp when AgriLink verification was requested';
COMMENT ON COLUMN public.users.business_details_completed IS 'Whether business details have been completed';
