-- Check existing phone-related constraints and indexes
-- This will show what's already in place

-- Check for unique constraints on phone column
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname LIKE '%phone%';

-- Check for indexes on phone column
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname LIKE '%phone%';

-- Check if there are any duplicate phone numbers
SELECT 
    phone, 
    COUNT(*) as count
FROM users 
WHERE phone IS NOT NULL 
GROUP BY phone 
HAVING COUNT(*) > 1;

-- Show sample phone numbers in the database
SELECT 
    id, 
    name, 
    phone, 
    phone_verified,
    created_at
FROM users 
WHERE phone IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;
