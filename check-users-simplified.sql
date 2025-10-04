-- Query to check the users_simplified table and its relationship
-- Run this in Supabase SQL Editor

-- 1. Check if users_simplified table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'users_simplified'
ORDER BY ordinal_position;

-- 2. Check if users_simplified is a view or materialized view
SELECT 
    table_name, 
    table_type
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name = 'users_simplified';

-- 3. Check foreign key constraints on users_simplified table
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
AND tc.table_name = 'users_simplified'
ORDER BY tc.constraint_name;

-- 4. Check the definition of the users_simplified table/view
SELECT 
    view_definition
FROM 
    information_schema.views 
WHERE 
    table_schema = 'public' 
    AND table_name = 'users_simplified';

-- 5. Check if there are any functions that create users_simplified entries
SELECT 
    routine_name,
    routine_definition
FROM 
    information_schema.routines 
WHERE 
    routine_schema = 'public' 
    AND routine_definition LIKE '%users_simplified%';
