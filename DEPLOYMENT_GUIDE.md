# Deployment Guide - Pulse of People CRM

## Prerequisites
- GitHub account
- Render.com account (or Heroku/Railway)
- Supabase PostgreSQL database (already configured)

---

## Backend Deployment (Django API)

### Option 1: Deploy on Render.com

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/chatgptnotes/pulseofpeople2`
   - Select the repository

3. **Configure Service**:
   ```
   Name: pulseofpeople-backend
   Region: Singapore (or nearest)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
   Start Command: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```

4. **Add Environment Variables**:
   ```
   SECRET_KEY=<generate-a-random-secret-key>
   DEBUG=False
   ALLOWED_HOSTS=your-app-name.onrender.com

   # Database (Supabase)
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=pulseofpeople
   DB_HOST=db.iiefjgytmxrjbctfqxni.supabase.co
   DB_PORT=5432
   DB_SSLMODE=require
   USE_SQLITE=False

   # Supabase Auth
   SUPABASE_URL=https://iiefjgytmxrjbctfqxni.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWZqZ3l0bXhyamJjdGZxeG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTc2MjAsImV4cCI6MjA3ODU5MzYyMH0.sH9hdbkKT2D7T28-eDPd5_waHvINb487ChUyyg18YUE
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWZqZ3l0bXhyamJjdGZxeG5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAxNzYyMCwiZXhwIjoyMDc4NTkzNjIwfQ.UuDQ0_nCxsK2A_2HgABaT7e38QVD3DPpc6rb6YLA4AQ

   # CORS (will update after frontend deployment)
   CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-url.vercel.app
   ```

5. **Deploy**: Click "Create Web Service"

---

### Option 2: Deploy on Railway.app

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select repository and backend folder
4. Add same environment variables as above
5. Deploy

---

## Frontend Deployment (React + Vite)

### Option 1: Deploy on Vercel

1. **Go to Vercel**: https://vercel.com

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import from GitHub: `pulseofpeople2`
   - Select repository

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: pulseofprojectfrontendonly
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   ```
   VITE_DJANGO_API_URL=https://your-backend-url.onrender.com/api
   VITE_SUPABASE_URL=https://iiefjgytmxrjbctfqxni.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWZqZ3l0bXhyamJjdGZxeG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTc2MjAsImV4cCI6MjA3ODU5MzYyMH0.sH9hdbkKT2D7T28-eDPd5_waHvINb487ChUyyg18YUE
   ```

5. **Deploy**: Click "Deploy"

---

### Option 2: Deploy on Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select repository
4. Configure:
   ```
   Base directory: pulseofprojectfrontendonly
   Build command: npm run build
   Publish directory: pulseofprojectfrontendonly/dist
   ```
5. Add same environment variables
6. Deploy

---

## Post-Deployment Steps

### 1. Update Backend CORS Settings

After frontend is deployed, update backend environment variable:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://your-frontend-url.netlify.app
```

### 2. Update Frontend API URL

Make sure frontend `.env` has correct backend URL:
```
VITE_DJANGO_API_URL=https://your-backend-url.onrender.com/api
```

### 3. Run Database Migrations

SSH into your Render service or use Render Shell:
```bash
python manage.py migrate
python manage.py collectstatic --no-input
```

### 4. Create Superuser (if needed)

```bash
python manage.py createsuperuser
```

Or use the existing test credentials:
- Username: `superadmin`
- Password: `admin123`

---

## Testing Deployment

### Test Backend API
```bash
curl https://your-backend-url.onrender.com/api/health/
```

Expected response:
```json
{"status": "healthy", "message": "API is running"}
```

### Test Frontend
Open: `https://your-frontend-url.vercel.app`

Try logging in with:
- Username: `superadmin`
- Password: `admin123`

---

## Troubleshooting

### Backend Issues

**Build Failed: "gunicorn: command not found"**
- ✅ Fixed! We added gunicorn to requirements.txt

**Static files not loading**
- ✅ Fixed! We added whitenoise middleware

**Database connection error**
- Check Supabase credentials in environment variables
- Verify DB_SSLMODE=require is set

### Frontend Issues

**API calls failing (CORS)**
- Update CORS_ALLOWED_ORIGINS in backend with frontend URL
- Redeploy backend after updating

**Environment variables not working**
- Make sure all variables start with `VITE_`
- Rebuild and redeploy frontend

---

## URLs After Deployment

- **Backend API**: https://your-app-name.onrender.com
- **Frontend App**: https://your-app-name.vercel.app
- **Admin Panel**: https://your-app-name.onrender.com/admin
- **API Docs**: https://your-app-name.onrender.com/api/

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**:

1. Change all default passwords
2. Generate new SECRET_KEY for Django
3. Set DEBUG=False in production
4. Use environment-specific credentials
5. Enable HTTPS only
6. Set up proper backup system
7. Monitor error logs

---

## Monitoring & Maintenance

### Logs
- **Render**: Dashboard → Service → Logs
- **Vercel**: Dashboard → Deployments → View Logs

### Database Backups
Supabase provides automatic backups. To create manual backup:
```bash
pg_dump "postgresql://postgres:pulseofpeople@db.iiefjgytmxrjbctfqxni.supabase.co:5432/postgres" > backup.sql
```

---

**Deployment Complete! 🎉**

Your multi-party CRM platform is now live and accessible worldwide!
