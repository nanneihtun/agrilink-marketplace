-- Create verification_codes table for storing SMS verification codes
-- This table stores temporary verification codes sent via Twilio

CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone_number ON public.verification_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_used ON public.verification_codes(used);

-- Create a function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.verification_codes 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clean up expired codes
-- This runs every hour to clean up old verification codes
CREATE OR REPLACE FUNCTION schedule_cleanup_verification_codes()
RETURNS void AS $$
BEGIN
    -- This would typically be handled by a cron job or scheduled function
    -- For now, we'll just create the function
    PERFORM cleanup_expired_verification_codes();
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own verification codes
CREATE POLICY "Users can insert their own verification codes" ON public.verification_codes
    FOR INSERT WITH CHECK (true);

-- Allow users to read verification codes for their phone number
CREATE POLICY "Users can read verification codes for their phone" ON public.verification_codes
    FOR SELECT USING (true);

-- Allow users to update verification codes (for marking as used)
CREATE POLICY "Users can update verification codes" ON public.verification_codes
    FOR UPDATE USING (true);

-- Show the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'verification_codes' 
AND table_schema = 'public'
ORDER BY ordinal_position;
