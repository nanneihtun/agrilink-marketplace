-- Updated SQL schema to match frontend Product interface exactly
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sellerId UUID REFERENCES users_simplified(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT,
  sellerType TEXT CHECK (sellerType IN ('farmer', 'trader')) DEFAULT 'farmer',
  sellerName TEXT,
  image TEXT, -- Single image for backward compatibility
  images TEXT[], -- Multiple images support
  quantity TEXT NOT NULL, -- Available quantity (e.g., "100 bags", "50 kg")
  minimumOrder TEXT DEFAULT '1 unit', -- Minimum order requirement
  availableQuantity TEXT, -- Total available stock description  
  deliveryOptions TEXT[] DEFAULT '{"Pickup"}', -- Available delivery methods
  paymentTerms TEXT[] DEFAULT '{"Cash on delivery"}', -- Accepted payment methods
  category TEXT DEFAULT 'agriculture',
  description TEXT,
  additionalNotes TEXT, -- Extra notes or special conditions
  priceChange DECIMAL(5,2) DEFAULT 0, -- Percentage change in price from last week
  lastUpdated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sellerId ON products(sellerId);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);
CREATE INDEX IF NOT EXISTS idx_products_sellerType ON products(sellerType);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = sellerId);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = sellerId);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = sellerId);

-- Create trigger to update updated_at and lastUpdated timestamps
CREATE OR REPLACE FUNCTION update_product_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.lastUpdated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_products_timestamps
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_timestamps();
