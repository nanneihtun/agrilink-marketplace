-- AgriLink Database Schema for Supabase
-- This file contains all the necessary tables for the agricultural marketplace

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'trader', 'buyer', 'admin')),
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'business')),
  location TEXT NOT NULL,
  region TEXT,
  phone TEXT,
  business_name TEXT,
  business_description TEXT,
  experience TEXT,
  verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  quality_certifications TEXT[],
  farming_methods TEXT[],
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  response_time TEXT,
  storefront_image TEXT,
  website TEXT,
  facebook TEXT,
  instagram TEXT,
  telegram TEXT,
  business_hours TEXT,
  specialties TEXT[],
  policies JSONB,
  verification_status TEXT DEFAULT 'not_started' CHECK (verification_status IN ('not_started', 'in_progress', 'under_review', 'verified', 'rejected')),
  verification_submitted BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  business_details_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('farmer', 'trader')),
  seller_name TEXT NOT NULL,
  image TEXT,
  images TEXT[],
  quantity TEXT NOT NULL,
  minimum_order TEXT,
  available_quantity TEXT,
  delivery_options TEXT[],
  payment_terms TEXT[],
  category TEXT,
  description TEXT,
  additional_notes TEXT,
  price_change DECIMAL(5,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, buyer_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved products table (for buyers to track products)
CREATE TABLE public.saved_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  saved_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_when_saved DECIMAL(12,2) NOT NULL,
  price_alert BOOLEAN DEFAULT TRUE,
  stock_alert BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, product_id)
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewee_id, product_id)
);

-- Offers table (for detailed offer management)
CREATE TABLE public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(50),
  description TEXT,
  delivery_terms TEXT,
  delivery_location VARCHAR(255),
  valid_until TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
  notes TEXT,
  -- Transaction tracking fields
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  shipping_status VARCHAR(20) DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'shipped', 'delivered')),
  tracking_number VARCHAR(100),
  delivery_address TEXT,
  payment_method VARCHAR(50),
  -- Timestamps for each stage
  accepted_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals/Transactions table (for completed offers)
CREATE TABLE public.deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  offer_price DECIMAL(12,2),
  original_price DECIMAL(12,2),
  quantity TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'completed', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  delivery_address TEXT,
  delivery_notes TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction tracking table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'disputed')),
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'received')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_location ON public.products(location);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created_at ON public.products(created_at);

CREATE INDEX idx_chats_buyer_id ON public.chats(buyer_id);
CREATE INDEX idx_chats_seller_id ON public.chats(seller_id);
CREATE INDEX idx_chats_product_id ON public.chats(product_id);

CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

CREATE INDEX idx_saved_products_user_id ON public.saved_products(user_id);
CREATE INDEX idx_saved_products_product_id ON public.saved_products(product_id);

CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);

CREATE INDEX idx_deals_buyer_id ON public.deals(buyer_id);
CREATE INDEX idx_deals_seller_id ON public.deals(seller_id);
CREATE INDEX idx_deals_product_id ON public.deals(product_id);
CREATE INDEX idx_deals_chat_id ON public.deals(chat_id);
CREATE INDEX idx_deals_status ON public.deals(status);

CREATE INDEX idx_transactions_deal_id ON public.transactions(deal_id);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can read all users, update only their own
CREATE POLICY "Users can read all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Chats policies
CREATE POLICY "Users can read own chats" ON public.chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own chats" ON public.chats FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages policies
CREATE POLICY "Users can read messages in their chats" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "Users can create messages in their chats" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);

-- Saved products policies
CREATE POLICY "Users can manage own saved products" ON public.saved_products FOR ALL USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Deals policies
CREATE POLICY "Users can read own deals" ON public.deals FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own deals" ON public.deals FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Transactions policies
CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, user_type, account_type, location, region)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'location', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'region', 'Unknown')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
