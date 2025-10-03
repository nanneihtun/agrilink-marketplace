-- Add accountType column to users table
-- This script adds the missing accountType field that's causing the 400 error

-- Add accountType field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'accountType'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN accountType TEXT;
    END IF;
END $$;

-- Add any other missing fields that might be referenced in the frontend
-- Add account_type field (alternative naming)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'account_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN account_type TEXT;
    END IF;
END $$;

-- Add verification_status field if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Add verification_documents field if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_documents'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_documents JSONB;
    END IF;
END $$;

-- Update existing users with default values
UPDATE public.users 
SET 
    accountType = COALESCE(accountType, 'personal'),
    account_type = COALESCE(account_type, 'personal'),
    verification_status = COALESCE(verification_status, 'pending'),
    verification_documents = COALESCE(verification_documents, '{}'::JSONB)
WHERE accountType IS NULL 
   OR account_type IS NULL 
   OR verification_status IS NULL 
   OR verification_documents IS NULL;

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('accountType', 'account_type', 'verification_status', 'verification_documents')
ORDER BY column_name;
