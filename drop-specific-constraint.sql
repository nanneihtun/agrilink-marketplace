-- Script to drop the specific foreign key constraint
-- Run this in Supabase SQL Editor

-- 1. Drop the specific foreign key constraint
ALTER TABLE users_simplified DROP CONSTRAINT IF EXISTS users_simplified_id_fkey1;

-- 2. Drop the trigger that was causing issues
DROP TRIGGER IF EXISTS update_users_simplified_updated_at ON users;

-- 3. Drop the users_simplified table entirely (since it's not needed)
DROP TABLE IF EXISTS users_simplified CASCADE;

-- 4. Verify the constraint is gone
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
AND tc.constraint_name LIKE '%users_simplified%'
ORDER BY tc.constraint_name;

-- 5. Test creating a user (optional - you can try this after running the above)
-- INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed) 
-- VALUES ('test@example.com', 'Test User', 'farmer', 'individual', 'Test Location', 'Test Region', '+959999999999', false, false, 'not_started', false, false);
