-- Add all missing fields to users table to match frontend forms
-- This script adds fields that are used in registration and profile editing

-- Add business hours field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'business_hours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_hours TEXT;
    END IF;
END $$;

-- Add phone field (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Add email field (if not exists - should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
    END IF;
END $$;

-- Add website field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'website'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN website TEXT;
    END IF;
END $$;

-- Add facebook field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'facebook'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN facebook TEXT;
    END IF;
END $$;

-- Add instagram field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'instagram'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN instagram TEXT;
    END IF;
END $$;

-- Add telegram field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'telegram'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN telegram TEXT;
    END IF;
END $$;

-- Add tiktok field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'tiktok'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN tiktok TEXT;
    END IF;
END $$;

-- Add specialties field (array)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'specialties'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN specialties TEXT[];
    END IF;
END $$;

-- Add policies field (JSONB)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'policies'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN policies JSONB;
    END IF;
END $$;

-- Add description field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add storefront_image field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'storefront_image'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN storefront_image TEXT;
    END IF;
END $$;

-- Add joined_date field (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'joined_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add years_active field (computed field for display)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'years_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN years_active INTEGER;
    END IF;
END $$;

-- Update existing users with default values for new fields
UPDATE public.users 
SET 
    business_hours = COALESCE(business_hours, '9 AM - 6 PM, Mon-Sat'),
    specialties = COALESCE(specialties, ARRAY[]::TEXT[]),
    policies = COALESCE(policies, '{}'::JSONB),
    joined_date = COALESCE(joined_date, created_at),
    years_active = COALESCE(years_active, EXTRACT(YEAR FROM AGE(NOW(), COALESCE(joined_date, created_at)))::INTEGER)
WHERE business_hours IS NULL 
   OR specialties IS NULL 
   OR policies IS NULL 
   OR joined_date IS NULL 
   OR years_active IS NULL;

-- Create a function to automatically update years_active when joined_date changes
CREATE OR REPLACE FUNCTION update_years_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.years_active = EXTRACT(YEAR FROM AGE(NOW(), NEW.joined_date))::INTEGER;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update years_active
DROP TRIGGER IF EXISTS trigger_update_years_active ON public.users;
CREATE TRIGGER trigger_update_years_active
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_years_active();

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
