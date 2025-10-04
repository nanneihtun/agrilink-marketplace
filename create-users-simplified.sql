-- First, let's check what the constraint is expecting
-- Run this to see the constraint details

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
AND tc.constraint_name LIKE '%users_simplified%';

-- If the above shows the constraint details, then create the users_simplified table
-- This is a simplified version of the users table that might be used for performance

CREATE TABLE IF NOT EXISTS users_simplified (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    user_type TEXT NOT NULL,
    account_type TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_users_simplified_email ON users_simplified(email);
CREATE INDEX IF NOT EXISTS idx_users_simplified_user_type ON users_simplified(user_type);

-- Create a trigger to automatically populate users_simplified when a user is created
CREATE OR REPLACE FUNCTION sync_users_simplified()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO users_simplified (id, email, name, user_type, account_type, verified, phone_verified, created_at, updated_at)
        VALUES (NEW.id, NEW.email, NEW.name, NEW.user_type, NEW.account_type, NEW.verified, NEW.phone_verified, NEW.created_at, NEW.updated_at);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE users_simplified 
        SET 
            email = NEW.email,
            name = NEW.name,
            user_type = NEW.user_type,
            account_type = NEW.account_type,
            verified = NEW.verified,
            phone_verified = NEW.phone_verified,
            updated_at = NEW.updated_at
        WHERE id = NEW.id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM users_simplified WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_sync_users_simplified ON users;
CREATE TRIGGER trigger_sync_users_simplified
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_users_simplified();

-- Populate users_simplified with existing users
INSERT INTO users_simplified (id, email, name, user_type, account_type, verified, phone_verified, created_at, updated_at)
SELECT id, email, name, user_type, account_type, verified, phone_verified, created_at, updated_at
FROM users
ON CONFLICT (id) DO NOTHING;
