# Test Credentials - Supabase Migration

**Last Updated:** 2025-11-13

---

## Application URLs

### Backend
- **API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin/
- **API Documentation:** http://localhost:8000/api/

### Frontend
- **Application:** http://localhost:5174/
- **Network Access:** http://192.168.1.5:5174/

---

## Database Credentials

### Supabase PostgreSQL
```
Project: pulseofpeople_backend_frontend
Project ID: iiefjgytmxrjbctfqxni
Host: db.iiefjgytmxrjbctfqxni.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: pulseofpeople
```

### Supabase Dashboard
- **URL:** https://supabase.com/dashboard/project/iiefjgytmxrjbctfqxni
- **Project URL:** https://iiefjgytmxrjbctfqxni.supabase.co

---

## User Accounts

### Superadmin Users

#### Primary Superadmin
```
Username: superadmin
Password: admin123
Email: superadmin@pulseofpeople.com
Role: superadmin
Organization: Pulse of People
```

#### Secondary Superadmin
```
Username: Superadmins
Password: admin123
Email: superadmin@gmail.com
Role: superadmin
Organization: None
```

### Admin User
```
Username: admin
Password: admin123
Email: admin@gmail.com
Role: admin
Organization: Pulse of People
```

### Regular User
```
Username: user
Password: user123
Email: user@pulseofpeople.com
Role: user
Organization: Pulse of People
```

---

## Quick Login Test

### Using curl
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "superadmin", "password": "admin123"}'
```

### Using the Frontend
1. Go to http://localhost:5174/
2. Login with:
   - Username: `superadmin`
   - Password: `admin123`

---

## Sample Data Available

### Organizations
- **Pulse of People** (1 organization)

### Electoral Data
- **3 Constituencies:**
  - Mumbai North (MH-01) - 1.5M voters
  - Delhi Central (DL-01) - 800K voters
  - Bangalore South (KA-01) - 1.2M voters

- **15 Polling Booths** (across all constituencies)

### Campaigns
- **2 Active Campaigns:**
  - Campaign Mumbai North 2025 (Target: 50K voters, Reached: 15K)
  - Campaign Delhi Central 2025 (Target: 50K voters, Reached: 15K)

### Voters
- **90 Voter Records** with complete demographics and sentiment data

### System Data
- **22 Permissions** (RBAC system)
- **77 Role Permissions** (role mappings)
- **3 Notifications**

---

## API Testing

### Run Full Test Suite
```bash
cd backend
./test_api.sh
```

### Individual Endpoint Tests

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "superadmin", "password": "admin123"}'
```

#### Get Campaigns (requires token)
```bash
TOKEN="YOUR_TOKEN_HERE"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/campaigns/
```

#### Get Constituencies
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/constituencies/
```

#### Get Voters
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/voters/
```

---

## Database Access

### Direct PostgreSQL Connection
```bash
psql "postgresql://postgres:pulseofpeople@db.iiefjgytmxrjbctfqxni.supabase.co:5432/postgres?sslmode=require"
```

### Using Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select project: `pulseofpeople_backend_frontend`
3. Navigate to Table Editor or SQL Editor

---

## Important Notes

1. **All data has been migrated from SQLite to Supabase PostgreSQL**
2. **Passwords were reset after migration for testing purposes**
3. **Original SQLite database (`db.sqlite3`) is still available as backup**
4. **Backend is configured to use Supabase (`USE_SQLITE=False`)**

---

## Troubleshooting

### Cannot login?
- Verify backend is running: http://localhost:8000
- Check credentials match exactly (case-sensitive)
- Try password reset: `cd backend && python3 reset_passwords.py`

### Backend not responding?
- Check if server is running: `lsof -ti:8000`
- Restart: `cd backend && python3 manage.py runserver 0.0.0.0:8000`

### Database connection issues?
- Verify `.env` has `USE_SQLITE=False`
- Check database credentials in `.env`
- Test connection: `python3 manage.py check --database default`

---

## Security Reminder

⚠️ **These are test/development credentials**
- Change all passwords before production deployment
- Never commit `.env` file to version control
- Use strong passwords for production
- Enable 2FA on Supabase dashboard

---

**Generated:** 2025-11-13
**Version:** 1.8
