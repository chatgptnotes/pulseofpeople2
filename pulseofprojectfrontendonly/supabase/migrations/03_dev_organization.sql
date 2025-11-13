-- Migration: Create Development Organization
-- Created: 2025-11-11
-- Description: Creates a development organization for testing without proper tenant setup

-- Insert development organization (only if it doesn't exist)
INSERT INTO organizations (
    id,
    name,
    slug,
    subscription_status,
    subscription_plan,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Development Organization',
    'dev-org',
    'active',
    'free',  -- Changed from 'trial' to 'free' (valid values: free, basic, pro, enterprise)
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the organization was created
SELECT id, name, slug, subscription_status
FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001';
