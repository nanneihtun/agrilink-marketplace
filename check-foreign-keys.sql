-- Query to check all foreign key constraints in the database
-- Run this in Supabase SQL Editor

-- 1. Check all foreign key constraints for the users table
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
AND tc.table_name = 'users'
ORDER BY tc.constraint_name;

-- 2. Check if there's a users_simplified table or view
SELECT 
    table_name, 
    table_type
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name LIKE '%users%'
ORDER BY table_name;

-- 3. Check all foreign key constraints that reference users table
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
AND ccu.table_name = 'users'
ORDER BY tc.constraint_name;

-- 4. Check for any triggers on the users table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM 
    information_schema.triggers 
WHERE 
    event_object_table = 'users'
ORDER BY trigger_name;
