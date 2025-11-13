# Supabase Database Setup

## Files

- `migrations/00_complete_schema.sql` - Complete database schema (35 tables)
- `migrations/01_rls_policies.sql` - Row Level Security policies

## Quick Setup

### 1. Run Migrations in Supabase Dashboard

Go to SQL Editor and run these files in order:

1. Copy/paste `00_complete_schema.sql` → Run
2. Copy/paste `01_rls_policies.sql` → Run

### 2. Create First Superadmin User

In Supabase Dashboard → Authentication → Add User, then run:

```sql
INSERT INTO users (auth_user_id, email, username, first_name, last_name, role)
VALUES (
    'YOUR_AUTH_USER_ID',  -- From Authentication page
    'your-email@example.com',
    'superadmin',
    'Admin',
    'User',
    'superadmin'
);
```

### 3. Verify Setup

```sql
-- Check tables (should return 35)
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Check your user
SELECT id, email, username, role FROM users;
```

Done! Your database is ready.
