# Database Migration Required - Voter Calls Feature

## URGENT: You Need to Run a Missing Migration

The error you're seeing (`"Could not find the table 'public.voter_calls'"`) is because the database migration for the Voter Sentiment Analysis feature **was never run**.

The migration file exists but needs to be executed manually in Supabase.

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **Pulse of People**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Migration #1 - Create Tables

**File**: `supabase/migrations/02_voter_calls_schema.sql`

1. Open the file on your computer
2. Copy all contents (Cmd+A, Cmd+C)
3. In Supabase SQL Editor, click **+ New query**
4. Paste and click **Run** (Cmd+Enter)
5. Wait for "Success" message

### Step 3: Run Migration #2 - Create Dev Organization

**File**: `supabase/migrations/03_dev_organization.sql`

1. Open the file on your computer
2. Copy all contents (Cmd+A, Cmd+C)
3. In Supabase SQL Editor, click **+ New query**
4. Paste and click **Run** (Cmd+Enter)
5. You should see 1 row returned showing the dev organization

**Why this is needed**: In development mode without a tenant, the system uses a special "Development Organization" to store data. This creates that organization in the database.

### Step 4: Verify Everything Created

Run this verification query:
```sql
-- Check if all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'voter_calls',
  'call_campaigns',
  'call_sentiment_analysis',
  'call_csv_uploads'
)
ORDER BY table_name;
```

You should see **4 tables** returned:
- call_campaigns
- call_csv_uploads
- call_sentiment_analysis
- voter_calls

**Also verify the dev organization exists:**
```sql
SELECT id, name, slug FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001';
```

You should see: `Development Organization`

---

## What These Migrations Create

### Migration #1: Creates **4 new tables** for the Voter Sentiment Analysis feature:

### 1. `voter_calls` (MAIN TABLE - Currently Missing)
Stores individual call records and transcripts
- call_id (ElevenLabs conversation ID)
- phone_number
- voter_name
- transcript (Tamil text)
- duration, timestamps, etc.

### 2. `call_campaigns`
Stores bulk calling campaign information
- campaign_name
- target_count
- status tracking

### 3. `call_sentiment_analysis`
Stores sentiment analysis results
- previous_govt_sentiment
- tvk_sentiment
- key_issues
- voting_intention

### 4. `call_csv_uploads`
Tracks CSV file uploads for bulk calling
- file_name
- upload progress
- processing status

### Migration #2: Creates Development Organization

A special organization record for testing without proper tenant setup:
- ID: `00000000-0000-0000-0000-000000000001`
- Name: "Development Organization"
- Allows you to test the calling feature without setting up full multi-tenant infrastructure

---

## Why Did This Happen?

When the Voter Sentiment Analysis feature was added (Nov 11, 2025), new migration files were created:
- `02_voter_calls_schema.sql` - Database tables for calls
- `03_dev_organization.sql` - Development organization

However, only the first two migrations were run during initial setup:
- ✅ `00_complete_schema.sql` - Core tables (run during initial setup)
- ✅ `01_rls_policies.sql` - Security policies (run during initial setup)
- ❌ `02_voter_calls_schema.sql` - **NEVER RUN** (tables missing)
- ❌ `03_dev_organization.sql` - **NEVER RUN** (dev org missing)

---

## After Running the Migration

Once you've successfully run the migration:

1. **Refresh your browser** on the Voter Sentiment Analysis page
2. **Try the "RESET" button** to clear the stuck call
3. **Initiate a new test call**
4. The Supabase errors will be gone
5. Calls will be saved to the database correctly

---

## Troubleshooting

### Error: "relation already exists"
If you see this error, it means some tables were partially created. Run this cleanup first:
```sql
DROP TABLE IF EXISTS call_csv_uploads CASCADE;
DROP TABLE IF EXISTS call_sentiment_analysis CASCADE;
DROP TABLE IF EXISTS call_campaigns CASCADE;
DROP TABLE IF EXISTS voter_calls CASCADE;
```
Then run the migration again.

### Error: "permission denied"
Make sure you're logged in as the database owner or have admin privileges.

### Tables still not showing
1. Clear Supabase cache: Dashboard → Settings → Clear Cache
2. Refresh the page
3. Verify using the SQL query in Step 5

---

## Migration File Locations

Full paths to the migration files:

**Migration #1** (Tables):
```
/Users/apple/Downloads/PulseOfPeople_frontendOnly/pulseofpeoplefrontendonly/supabase/migrations/02_voter_calls_schema.sql
```

**Migration #2** (Dev Organization):
```
/Users/apple/Downloads/PulseOfPeople_frontendOnly/pulseofpeoplefrontendonly/supabase/migrations/03_dev_organization.sql
```

---

## Need Help?

If you encounter any issues:
1. Check Supabase SQL Editor for error messages
2. Verify your Supabase project URL matches the one in `.env`
3. Make sure you have admin access to the database

Once the migration is run successfully, all the Supabase errors will disappear!
