-- Comprehensive script to drop ALL users_simplified related constraints
-- Run this in Supabase SQL Editor

-- 1. Find and drop ALL foreign key constraints related to users_simplified
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Drop constraints that reference users_simplified
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE constraint_type = 'FOREIGN KEY' 
        AND (tc.constraint_name LIKE '%users_simplified%' OR ccu.table_name = 'users_simplified')
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: % from table: %', constraint_record.constraint_name, constraint_record.table_name;
    END LOOP;
    
    -- Also drop constraints on users table that might reference users_simplified
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'users'
        AND tc.constraint_name LIKE '%simplified%'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: % from table: %', constraint_record.constraint_name, constraint_record.table_name;
    END LOOP;
END $$;

-- 2. Drop all triggers related to users_simplified
DROP TRIGGER IF EXISTS update_users_simplified_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_sync_users_simplified ON users;

-- 3. Drop any functions related to users_simplified
DROP FUNCTION IF EXISTS sync_users_simplified() CASCADE;

-- 4. Drop the users_simplified table if it exists
DROP TABLE IF EXISTS users_simplified CASCADE;

-- 5. Verify all constraints are gone
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
AND (tc.constraint_name LIKE '%simplified%' OR ccu.table_name LIKE '%simplified%')
ORDER BY tc.constraint_name;

-- 6. Test user creation
INSERT INTO users (email, name, user_type, account_type, location, region, phone, verified, phone_verified, verification_status, verification_submitted, business_details_completed) 
VALUES ('test-success@example.com', 'Test Success', 'farmer', 'individual', 'Test Location', 'Test Region', '+959999999998', false, false, 'not_started', false, false)
RETURNING id, email, name;
