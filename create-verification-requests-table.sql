-- Create verification_requests table for storing admin verification requests
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'trader', 'buyer')),
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'business')),
  request_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  verification_documents JSONB,
  business_info JSONB,
  phone_verified BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON verification_requests(submitted_at);

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verification requests
CREATE POLICY "Users can insert own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification requests (for status updates)
CREATE POLICY "Users can update own verification requests" ON verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin'
    )
  );

-- Admins can update all verification requests
CREATE POLICY "Admins can update all verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin'
    )
  );

-- Admins can delete verification requests
CREATE POLICY "Admins can delete verification requests" ON verification_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin'
    )
  );
