-- Add unique phone number constraint to users table
-- This ensures phone numbers are unique across all users

-- Option 1: Strict unique constraint (no NULLs allowed)
-- ALTER TABLE users ADD CONSTRAINT unique_phone UNIQUE (phone);

-- Option 2: Allow NULL phones but unique non-NULL phones (recommended)
CREATE UNIQUE INDEX idx_users_phone_unique ON users (phone) WHERE phone IS NOT NULL;

-- Show the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname LIKE '%phone%';

-- Show the unique index was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname LIKE '%phone%';