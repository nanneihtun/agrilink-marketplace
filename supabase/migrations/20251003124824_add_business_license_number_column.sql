-- Add business_license_number column to users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'business_license_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_license_number TEXT;
    END IF;
END $$;
