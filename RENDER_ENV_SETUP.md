# Render Environment Variables Setup Guide

## Step-by-Step Instructions

### 1. Go to Render Dashboard
- Open: https://dashboard.render.com/web/srv-ctksacu8ii6s73b56tg0/env
- Or: Dashboard → Your Service → Environment tab

### 2. Add These Environment Variables

Click "Add Environment Variable" button and add each one:

#### Required Variables:

**ALLOWED_HOSTS**
```
pulseofpeople2-1.onrender.com,.onrender.com,localhost,127.0.0.1
```

**DEBUG**
```
False
```

**SECRET_KEY**
```
django-insecure-render-production-key-$(openssl rand -hex 32)
```
(Or let Render auto-generate)

**USE_SQLITE**
```
False
```

#### Database Variables (Supabase):

**DB_NAME**
```
postgres
```

**DB_USER**
```
postgres
```

**DB_PASSWORD**
```
[Your Supabase Password - check screenshot]
```

**DB_HOST**
```
db.iiefjgytmxrjbctfqxni.supabase.co
```

**DB_PORT**
```
5432
```

**DB_SSLMODE**
```
require
```

#### Supabase API Keys:

**SUPABASE_URL**
```
https://iiefjgytmxrjbctfqxni.supabase.co
```

**SUPABASE_ANON_KEY**
```
[Check your Supabase dashboard → Settings → API]
```

**SUPABASE_JWT_SECRET**
```
[Check your Supabase dashboard → Settings → API]
```

#### CORS Settings:

**CORS_ALLOWED_ORIGINS**
```
https://pulseofpeople2-1.onrender.com,http://localhost:5173,http://127.0.0.1:5173
```

**CSRF_TRUSTED_ORIGINS**
```
https://pulseofpeople2-1.onrender.com,http://localhost:5173
```

### 3. After Adding All Variables

1. Click "Save Changes" button
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete
4. Your backend will be live at: https://pulseofpeople2-1.onrender.com

### 4. Test Your Deployment

Visit these URLs to verify:
- Health check: https://pulseofpeople2-1.onrender.com/api/health/ (if exists)
- Admin: https://pulseofpeople2-1.onrender.com/admin/
- API: https://pulseofpeople2-1.onrender.com/api/

## Quick Copy-Paste Format

```
ALLOWED_HOSTS=pulseofpeople2-1.onrender.com,.onrender.com,localhost,127.0.0.1
DEBUG=False
USE_SQLITE=False
DB_NAME=postgres
DB_USER=postgres
DB_HOST=db.iiefjgytmxrjbctfqxni.supabase.co
DB_PORT=5432
DB_SSLMODE=require
CORS_ALLOWED_ORIGINS=https://pulseofpeople2-1.onrender.com,http://localhost:5173
CSRF_TRUSTED_ORIGINS=https://pulseofpeople2-1.onrender.com
```

## Troubleshooting

### Error: "Network is unreachable" or "Connection to server failed"

**Symptoms:**
- Can't connect to Supabase from Render
- IPv6 address shown in error
- OperationalError at /admin/login/

**Root Cause:** Render's network can't reach Supabase over IPv6

**Solution:**
1. **Verify Supabase Project is Active:**
   - Go to https://supabase.com/dashboard
   - Check project `iiefjgytmxrjbctfqxni` is not paused
   - If paused, click "Restore" or "Unpause"

2. **Verify Database Password:**
   - Go to Supabase Dashboard → Settings → Database
   - Reset password if needed
   - Update `DB_PASSWORD` in Render environment variables

3. **Check Connection String:**
   - Go to Supabase → Settings → Database → Connection String
   - Use "Direct Connection" (not "Connection Pooling")
   - Format should be: `db.iiefjgytmxrjbctfqxni.supabase.co`
   - Port should be: `5432`

4. **Verify Render Environment Variables Match:**
   ```
   DB_HOST=db.iiefjgytmxrjbctfqxni.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_NAME=postgres
   DB_SSLMODE=require
   USE_SQLITE=False
   ```

5. **Alternative: Use Connection Pooler (if direct fails):**
   - Change `DB_HOST` to: `aws-0-ap-southeast-1.pooler.supabase.com`
   - Change `DB_PORT` to: `6543`
   - Note: May have compatibility issues with some Django features

### Error: "Tenant or user not found"

**Solution:**
- Use `DB_USER=postgres` (NOT `postgres.iiefjgytmxrjbctfqxni`)
- Use direct connection, not pooler

### Other Common Issues

**If still getting errors:**
1. Check Render logs: Dashboard → Logs tab
2. Verify all environment variables are saved (no typos)
3. Trigger manual deploy: Dashboard → Manual Deploy button
4. Wait for build to complete (green checkmark)
5. Check Supabase database logs for connection attempts

**Database Migration Issues:**
1. Run migrations manually from Render shell:
   ```bash
   python manage.py migrate
   ```
2. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

## Screenshots Location
- Supabase credentials: Project Settings → Database → Connection string
- Supabase API keys: Project Settings → API → Project API keys

## Recent Updates (v1.8 - 2025-11-14)
- Fixed hardcoded fallback DB_HOST in settings.py
- Added connection pooling with CONN_MAX_AGE=600
- Added connection health checks
- Added 30-second connection timeout
- Fixed IPv6 network unreachability issue
