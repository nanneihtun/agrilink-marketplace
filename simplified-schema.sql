-- SIMPLIFIED AgriLink Database Schema
-- Start with essential columns only, add more as needed

-- Essential users table with only registration form fields
CREATE TABLE IF NOT EXISTS public.users_simplified (
  -- Core identity
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  -- Registration form fields
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'trader', 'buyer', 'admin')),
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'business')),
  location TEXT NOT NULL,
  region TEXT,
  phone TEXT,
  
  -- Optional business info (for business accounts)
  business_name TEXT,
  business_description TEXT,
  
  -- Basic status
  verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for simplified table
ALTER TABLE public.users_simplified ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles (for marketplace)
CREATE POLICY "Users can read all profiles simplified" ON public.users_simplified 
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can create own profile simplified" ON public.users_simplified 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile simplified" ON public.users_simplified 
  FOR UPDATE USING (auth.uid() = id);
