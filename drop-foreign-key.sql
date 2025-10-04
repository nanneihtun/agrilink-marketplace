-- Script to drop the problematic foreign key constraint
-- Run this in Supabase SQL Editor

-- 1. First, let's identify the exact constraint name
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
AND (tc.constraint_name LIKE '%users_simplified%' OR ccu.table_name = 'users_simplified')
ORDER BY tc.constraint_name;

-- 2. Drop the foreign key constraint (replace 'constraint_name' with actual name from step 1)
-- Uncomment and modify the line below with the actual constraint name:

-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_simplified_id_fkey;

-- 3. Alternative: Drop all foreign key constraints related to users_simplified
-- This will drop any constraint that references users_simplified table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
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
END $$;

-- 4. Also drop any triggers related to users_simplified
DROP TRIGGER IF EXISTS update_users_simplified_updated_at ON users;

-- 5. Drop the users_simplified table if it exists (optional)
-- Uncomment the line below if you want to completely remove the users_simplified table:
-- DROP TABLE IF EXISTS users_simplified CASCADE;

-- 6. Verify the constraints are gone
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
AND (tc.constraint_name LIKE '%users_simplified%' OR ccu.table_name = 'users_simplified')
ORDER BY tc.constraint_name;
