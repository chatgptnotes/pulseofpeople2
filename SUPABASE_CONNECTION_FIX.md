# Supabase Connection Fix for Render Deployment

## Problem
Your Render deployment is showing this error:
```
OperationalError at /admin/login/
connection to server at "db.iiefjgytmxrjbctfqxni.supabase.co" (IPv6), port 5432 failed: Network is unreachable
```

## Root Cause
The Django settings.py file had a hardcoded fallback database host pointing to an old Supabase project (`db.iwtgbseaoztjbnvworyq.supabase.com`), and was missing important PostgreSQL connection options for production environments like Render.

## What Was Fixed

### 1. Updated Django Settings (backend/config/settings.py)
**Changes made:**
- Fixed fallback `DB_HOST` from old project ID to current: `db.iiefjgytmxrjbctfqxni.supabase.co`
- Changed default `DB_SSLMODE` from `prefer` to `require` (more secure)
- Added connection pooling: `CONN_MAX_AGE=600` (reuse connections for 10 minutes)
- Added connection health checks: `CONN_HEALTH_CHECKS=True`
- Added connection timeout: `connect_timeout=30` seconds
- Added application name for debugging: `application_name='pulseofpeople_django'`
- Added search path option: `options='-c search_path=public'`

### 2. Updated Environment Documentation
- Added detailed comments to `RENDER_ENV_VALUES.txt`
- Enhanced `RENDER_ENV_SETUP.md` with comprehensive troubleshooting guide
- Added specific solutions for IPv6 network issues

## How to Deploy the Fix to Render

### Step 1: Verify Your Supabase Project is Active

1. Go to https://supabase.com/dashboard
2. Find your project: `iiefjgytmxrjbctfqxni`
3. Make sure it's **NOT PAUSED** (if paused, click "Restore" or "Unpause")
4. Go to **Settings → Database**
5. Verify the database password is: `pulseofpeople`
   - If you're not sure, reset the password and update Render env vars

### Step 2: Verify Render Environment Variables

Go to: https://dashboard.render.com/web/srv-ctksacu8ii6s73b56tg0/env

**CRITICAL: Verify these exact values:**

| Variable | Value | Notes |
|----------|-------|-------|
| `USE_SQLITE` | `False` | Must be False for PostgreSQL |
| `DB_HOST` | `db.iiefjgytmxrjbctfqxni.supabase.co` | Direct connection |
| `DB_PORT` | `5432` | Standard PostgreSQL port |
| `DB_USER` | `postgres` | NOT `postgres.iiefjgytmxrjbctfqxni` |
| `DB_NAME` | `postgres` | Default database name |
| `DB_PASSWORD` | `pulseofpeople` | Your Supabase DB password |
| `DB_SSLMODE` | `require` | Force SSL for security |

**If any variable is missing or wrong, update it and save.**

### Step 3: Deploy Updated Code to Render

From your local terminal:

```bash
cd "/Users/apple/1 imo backups/pulseofproject python"

# Add and commit the changes
git add backend/config/settings.py RENDER_ENV_VALUES.txt RENDER_ENV_SETUP.md
git commit -m "fix: Update Supabase connection settings for Render deployment

- Fix hardcoded fallback DB_HOST (old project ID)
- Add connection pooling (CONN_MAX_AGE=600)
- Add connection health checks
- Add 30-second connection timeout
- Update environment variable documentation
- Add troubleshooting guide for IPv6 issues

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to Render
git push origin main
```

### Step 4: Monitor Deployment

1. Go to Render Dashboard → Logs tab
2. Watch the deployment progress
3. Look for these success messages:
   - `Build successful`
   - `Starting service...`
   - `Booting worker with pid`
   - No database connection errors

### Step 5: Test the Deployment

Once deployed, test these URLs:

1. **Admin Login:**
   - https://pulseofpeople2-1.onrender.com/admin/
   - Should show Django admin login page
   - Try logging in with your superuser credentials

2. **API Endpoints:**
   - https://pulseofpeople2-1.onrender.com/api/

## Alternative Solutions (If Direct Connection Still Fails)

### Option 1: Use Supabase Connection Pooler

If the direct connection still doesn't work due to IPv6/network issues:

**Update these Render environment variables:**
```
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
```

**Important:** Connection pooling mode may have compatibility issues with some Django features (like database-level locks, advisory locks, etc.).

### Option 2: Switch to SQLite for Testing

If you just want to get the app running quickly (not recommended for production):

**Update Render environment variable:**
```
USE_SQLITE=True
```

**Note:** SQLite doesn't persist data when Render restarts your service, so this is only for testing.

## Verification Checklist

- [ ] Supabase project `iiefjgytmxrjbctfqxni` is active (not paused)
- [ ] Database password verified in Supabase dashboard
- [ ] All Render environment variables match the values in Step 2
- [ ] Code pushed to GitHub/Git repository
- [ ] Render automatic deployment triggered
- [ ] Deployment logs show no errors
- [ ] Admin page loads at https://pulseofpeople2-1.onrender.com/admin/
- [ ] Can log in to admin panel successfully

## Common Errors and Solutions

### Error: "Tenant or user not found"
**Solution:** Make sure `DB_USER=postgres` (NOT `postgres.iiefjgytmxrjbctfqxni`)

### Error: "password authentication failed"
**Solution:** Reset database password in Supabase and update `DB_PASSWORD` in Render

### Error: "SSL connection required"
**Solution:** Make sure `DB_SSLMODE=require`

### Error: "timeout connecting to database"
**Solution:** Check if Supabase project is paused or experiencing downtime

## Need More Help?

1. **Check Render Logs:**
   - Dashboard → Your Service → Logs tab
   - Look for specific error messages

2. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → Database
   - Look for connection attempts from Render

3. **Verify Network Connectivity:**
   - Render's shell: `ping db.iiefjgytmxrjbctfqxni.supabase.co`
   - Check if Supabase is reachable

## Version Info

- Fix applied: 2025-11-14
- Django version: 5.2.7
- PostgreSQL (Supabase): PostgreSQL 15.x
- Render region: (check your dashboard)
- Supabase region: ap-southeast-1

---

**Next Steps After Fix:**
Once deployed successfully, increment version to v1.8 in your app footer.
