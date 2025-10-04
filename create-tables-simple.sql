-- Simple analytics tables - Copy and paste this in Supabase SQL Editor

-- 1. Create profile_views table
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  viewer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create inquiries table  
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  inquiry_type TEXT DEFAULT 'message',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create product_views table
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  viewer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add some sample data for farmerindi1@gmail.com (Aung Min)
-- Profile views
INSERT INTO profile_views (viewed_user_id, viewed_at) VALUES
('72c8f83d-1496-48f4-ab23-40be1aa8284d', NOW() - INTERVAL '5 days'),
('72c8f83d-1496-48f4-ab23-40be1aa8284d', NOW() - INTERVAL '3 days'),
('72c8f83d-1496-48f4-ab23-40be1aa8284d', NOW() - INTERVAL '1 day'),
('72c8f83d-1496-48f4-ab23-40be1aa8284d', NOW() - INTERVAL '2 hours');

-- Inquiries (using his product IDs)
INSERT INTO inquiries (product_id, buyer_id, seller_id, inquiry_type, created_at) VALUES
((SELECT id FROM products WHERE seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d' LIMIT 1), 
 '976f68ab-f21f-4fdb-88c2-97a59ad2d301', 
 '72c8f83d-1496-48f4-ab23-40be1aa8284d', 
 'message', NOW() - INTERVAL '4 days'),

((SELECT id FROM products WHERE seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d' LIMIT 1), 
 '32530366-436d-4bbb-80c3-51ef8cc60348', 
 '72c8f83d-1496-48f4-ab23-40be1aa8284d', 
 'chat', NOW() - INTERVAL '2 days');

-- Product views
INSERT INTO product_views (product_id, viewed_at) VALUES
((SELECT id FROM products WHERE seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d' LIMIT 1), NOW() - INTERVAL '5 days'),
((SELECT id FROM products WHERE seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d' LIMIT 1), NOW() - INTERVAL '3 days'),
((SELECT id FROM products WHERE seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d' LIMIT 1), NOW() - INTERVAL '1 day');

-- 5. Enable RLS (Row Level Security)
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- 6. Create simple policies
CREATE POLICY "Anyone can view profile views" ON profile_views FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profile views" ON profile_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view product views" ON product_views FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product views" ON product_views FOR INSERT WITH CHECK (true);

-- 7. Verify the data
SELECT 
  'Profile Views' as metric,
  COUNT(*) as count
FROM profile_views 
WHERE viewed_user_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d'

UNION ALL

SELECT 
  'Inquiries' as metric,
  COUNT(*) as count
FROM inquiries 
WHERE seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d'

UNION ALL

SELECT 
  'Product Views' as metric,
  COUNT(*) as count
FROM product_views pv
JOIN products p ON p.id = pv.product_id
WHERE p.seller_id = '72c8f83d-1496-48f4-ab23-40be1aa8284d';
