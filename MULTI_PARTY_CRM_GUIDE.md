# Multi-Party Political CRM - Complete Implementation Guide

**Date:** 2025-11-13
**Version:** 2.0 - Hierarchical User Management System

---

## System Overview

**7-Level User Hierarchy for Political Campaign Management**

```
SuperAdmin (Platform Owner)
    └── Party 1 (BJP), Party 2 (Congress), Party 3 (AAP), etc.
        └── State Admin (Delhi, Maharashtra, etc.)
            └── Zone Admin (North Delhi, Mumbai, etc.)
                └── District Admin (North Delhi District 1, etc.)
                    └── Constituency Admin (New Delhi, etc.)
                        └── Booth Admin (Booth #123, etc.)
                            └── Analyst (Read-only War Room Observer)
```

---

## Authentication Levels

### Level 1: SuperAdmin
**Role:** Platform owner (You)
**Capabilities:**
- Create unlimited political parties (Organizations)
- Create State Admins for each party
- View all parties' data
- Platform-wide analytics
- System configuration

### Level 2: State Admin
**Role:** State/Party head
**Capabilities:**
- Create Zone Admins for their state
- View all zones, districts, constituencies, booths in state
- State-wide campaign management
- State-level analytics

### Level 3: Zone Admin
**Role:** Zonal incharge
**Capabilities:**
- Create District Admins for their zone
- View all districts, constituencies, booths in zone
- Zone-wide campaign management

### Level 4: District Admin
**Role:** District president
**Capabilities:**
- Create Constituency Admins for their district
- View all constituencies and booths in district
- District-wide voter management

### Level 5: Constituency Admin
**Role:** Constituency incharge
**Capabilities:**
- Create Booth Admins for their constituency
- Manage constituency-level campaigns
- Constituency voter database

### Level 6: Booth Admin
**Role:** Booth agent/field worker
**Capabilities:**
- Create Analysts (observers)
- Manage booth-level voter data
- Mark voter interactions
- Booth-level sentiment tracking

### Level 7: Analyst
**Role:** War room analyst (Read-only)
**Capabilities:**
- Read-only dashboard
- View analytics based on assigned level
- Export reports
- Real-time data visualization

---

## Database Structure

### Political Parties (Organizations)
**Seeded Test Parties:**
1. BJP - Bharatiya Janata Party (bjp)
2. INC - Indian National Congress (inc)
3. AAP - Aam Aadmi Party (aap)
4. TMC - Trinamool Congress (tmc)
5. SP - Samajwadi Party (sp)

### Geographic Hierarchy
**10 States Created:**
- Delhi (5 zones, 10 districts)
- Maharashtra (5 zones, 10 districts)
- Punjab (5 zones, 10 districts)
- Uttar Pradesh (5 zones, 10 districts)
- Karnataka (5 zones, 10 districts)
- Gujarat, West Bengal, Tamil Nadu, Rajasthan, Madhya Pradesh

**Total Seeded Data:**
- 10 States
- 50+ Zones
- 100+ Districts
- 5 Political Parties

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### 1. SuperAdmin APIs

#### Create Party
```bash
POST /api/superadmin/parties/create/
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
    "name": "New Party Name",
    "slug": "new-party",
    "party_name": "New Political Party",
    "party_symbol": "Symbol",
    "party_color": "#FF0000",
    "subscription_tier": "pro",
    "max_users": 500
}
```

#### Create State Admin
```bash
POST /api/superadmin/users/create-state-admin/
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
    "username": "bjp_delhi_admin",
    "email": "bjp.delhi@example.com",
    "password": "SecurePass123",
    "first_name": "Delhi",
    "last_name": "BJP Admin",
    "party_id": 1,
    "state_id": 1
}
```

### 2. State Admin APIs

#### Create Zone Admin
```bash
POST /api/state-admin/users/create-zone-admin/
Authorization: Bearer {state_admin_token}
Content-Type: application/json

{
    "username": "north_delhi_admin",
    "email": "north.delhi@example.com",
    "password": "SecurePass123",
    "first_name": "North Delhi",
    "last_name": "Admin",
    "zone_id": 1
}
```

### 3. Zone Admin APIs

#### Create District Admin
```bash
POST /api/zone-admin/users/create-district-admin/
Authorization: Bearer {zone_admin_token}
Content-Type: application/json

{
    "username": "district_admin_1",
    "email": "district1@example.com",
    "password": "SecurePass123",
    "first_name": "District 1",
    "last_name": "Admin",
    "district_id": 1
}
```

### 4. District Admin APIs

#### Create Constituency Admin
```bash
POST /api/district-admin/users/create-constituency-admin/
Authorization: Bearer {district_admin_token}
Content-Type: application/json

{
    "username": "constituency_admin_1",
    "email": "constituency1@example.com",
    "password": "SecurePass123",
    "first_name": "Constituency",
    "last_name": "Admin",
    "constituency_id": 1
}
```

### 5. Constituency Admin APIs

#### Create Booth Admin
```bash
POST /api/constituency-admin/users/create-booth-admin/
Authorization: Bearer {constituency_admin_token}
Content-Type: application/json

{
    "username": "booth_agent_123",
    "email": "booth123@example.com",
    "password": "SecurePass123",
    "first_name": "Booth 123",
    "last_name": "Agent",
    "booth_id": 1
}
```

### 6. Booth Admin APIs

#### Create Analyst
```bash
POST /api/booth-admin/users/create-analyst/
Authorization: Bearer {booth_admin_token}
Content-Type: application/json

{
    "username": "analyst_1",
    "email": "analyst1@example.com",
    "password": "SecurePass123",
    "first_name": "War Room",
    "last_name": "Analyst"
}
```

### List My Team
```bash
GET /api/users/my-team/
Authorization: Bearer {any_admin_token}
```

---

## Testing Guide

### Step 1: Login as SuperAdmin
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "superadmin",
    "password": "admin123"
  }'
```

Save the `access` token from response.

### Step 2: Get Party IDs
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/organizations/
```

### Step 3: Get State IDs
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/states/
```

### Step 4: Create State Admin for BJP Delhi
```bash
curl -X POST http://localhost:8000/api/superadmin/users/create-state-admin/ \
  -H "Authorization: Bearer {superadmin_token}" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "bjp_delhi_admin",
    "email": "bjp.delhi@example.com",
    "password": "Delhi@123",
    "first_name": "BJP Delhi",
    "last_name": "State Admin",
    "party_id": 1,
    "state_id": 1
  }'
```

### Step 5: Login as State Admin
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "bjp_delhi_admin",
    "password": "Delhi@123"
  }'
```

### Step 6: Get Zones in Delhi
```bash
curl -H "Authorization: Bearer {state_admin_token}" \
  http://localhost:8000/api/zones/?state=1
```

### Step 7: Create Zone Admin
```bash
curl -X POST http://localhost:8000/api/state-admin/users/create-zone-admin/ \
  -H "Authorization: Bearer {state_admin_token}" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "north_delhi_zone",
    "email": "north.delhi@bjp.com",
    "password": "NorthDelhi@123",
    "first_name": "North Delhi",
    "last_name": "Zone Admin",
    "zone_id": 1
  }'
```

---

## Data Isolation Rules

### Party-Level Isolation
- BJP data is **completely isolated** from Congress data
- Each party has its own user hierarchy
- No cross-party data sharing

### Geographic Filtering
- State Admin sees **only their state's data**
- Zone Admin sees **only their zone's data**
- District Admin sees **only their district's data**
- And so on down to booth level

### Hierarchical Access
- Upper levels can see lower levels' data
- Lower levels **cannot** see upper levels' data
- Example: State Admin can see all zones, districts, booths in their state

---

## Current Test Credentials

### SuperAdmin
```
Username: superadmin
Password: admin123
Role: superadmin
Access: All parties, all states
```

### Example State Admin (After Creation)
```
Username: bjp_delhi_admin
Password: Delhi@123
Role: state_admin
Party: BJP
State: Delhi
Access: All zones/districts in Delhi for BJP
```

---

## Frontend Implementation (Next Steps)

### Required UI Components

1. **SuperAdmin Dashboard**
   - Create Party form
   - Party list with stats
   - Create State Admin form
   - All parties analytics

2. **State Admin Dashboard**
   - Create Zone Admin form
   - Zone list
   - State-wide analytics
   - Campaign management

3. **Zone/District/Constituency/Booth Dashboards**
   - Similar hierarchy
   - Create next-level user form
   - Geographic data visualization
   - Team management

4. **Analyst Dashboard**
   - Read-only charts
   - Export functionality
   - Real-time updates

### Role-Based Navigation
```jsx
const roleRoutes = {
  superadmin: '/superadmin/dashboard',
  state_admin: '/state-admin/dashboard',
  zone_admin: '/zone-admin/dashboard',
  district_admin: '/district-admin/dashboard',
  constituency_admin: '/constituency-admin/dashboard',
  booth_admin: '/booth-admin/dashboard',
  analyst: '/analyst/dashboard'
};
```

---

## Summary of Changes

### Backend Models
✅ Updated `Organization` model with party fields
✅ Added `State`, `Zone`, `District` models
✅ Updated `UserProfile` with 7 new roles
✅ Added geographic assignment fields
✅ Added `created_by` tracking

### Backend APIs
✅ Created 7 user creation endpoints (hierarchical)
✅ Added party creation endpoint
✅ Added team listing endpoint

### Database
✅ Migrated all changes to Supabase PostgreSQL
✅ Seeded 10 states with zones and districts
✅ Seeded 5 test political parties

### Testing
✅ All APIs tested and working
✅ Hierarchical validation working
✅ Party isolation working

---

## Next Implementation Phase

### Frontend (Estimated: 3-4 hours)
1. Create 7 role-based dashboard components
2. Build user creation forms for each role
3. Add geographic data dropdowns
4. Implement party switcher (if user has multiple parties)
5. Add team management UI
6. Create analytics dashboards

### Additional Features (Optional)
1. Bulk user upload (CSV)
2. User role change/transfer
3. Activity logs and audit trail
4. Email notifications on user creation
5. Mobile app for field workers

---

## Support & Contact

**Backend API:** http://localhost:8000
**Frontend:** http://localhost:5174 (when started)

**Test the system:**
```bash
# Start backend
cd backend
python manage.py runserver 0.0.0.0:8000

# Start frontend
cd pulseofprojectfrontendonly
npm run dev
```

---

**Implementation Complete!** ✅
**Version:** 2.0 - Multi-Party Political CRM
**Date:** 2025-11-13
