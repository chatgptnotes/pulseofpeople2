/**
 * Script to create realistic users for Tamil Nadu political campaign dashboard
 * Creates users with proper roles, districts, constituencies, and realistic details
 *
 * Requirements:
 * - 1 Superadmin
 * - 5 Admins
 * - 10 Managers (one per district)
 * - 10 Analysts (one per constituency)
 *
 * All passwords: "password"
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

const supabaseUrl = 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Database connection
const dbClient = new Client({
  host: 'db.eepwbydlfecosaqdysho.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'pulseofpeople@1',
});

// Uniform password
const UNIFORM_PASSWORD = 'password';

// Realistic Tamil names
const tamilFirstNames = {
  male: ['Rajesh', 'Kumar', 'Selvam', 'Murugan', 'Karthik', 'Vijay', 'Ashok', 'Senthil', 'Ramesh', 'Ganesh', 'Suresh', 'Prakash', 'Dinesh', 'Mahesh', 'Venkat'],
  female: ['Priya', 'Lakshmi', 'Kavitha', 'Malini', 'Radha', 'Deepa', 'Meena', 'Anjali', 'Divya', 'Sangeetha', 'Revathi', 'Geetha', 'Vani', 'Shanthi', 'Bharathi']
};

const tamilLastNames = ['Kumar', 'Raj', 'Murugan', 'Krishnan', 'Selvam', 'Pandian', 'Raman', 'Sundaram', 'Subramanian', 'Natarajan', 'Velu', 'Saravanan', 'Senthil', 'Mohan', 'Chandran'];

function getRandomName() {
  const isMale = Math.random() > 0.5;
  const firstNames = isMale ? tamilFirstNames.male : tamilFirstNames.female;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = tamilLastNames[Math.floor(Math.random() * tamilLastNames.length)];
  const age = 25 + Math.floor(Math.random() * 40); // Age between 25-65

  return { firstName, lastName, age, gender: isMale ? 'male' : 'female' };
}

function createEmail(firstName, lastName, role, identifier = '') {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const suffix = identifier ? `.${identifier.toLowerCase().replace(/\s+/g, '')}` : '';
  return `${base}${suffix}@tvk.com`;
}

async function cleanExistingUsers() {
  console.log('\n🗑️  Cleaning existing users...\n');

  try {
    // Clean public.users first (due to foreign key constraints)
    const deletePublicUsers = await dbClient.query('DELETE FROM public.users WHERE 1=1 RETURNING id');
    console.log(`   ✅ Deleted ${deletePublicUsers.rowCount} users from public.users`);

    // Clean auth tables
    await dbClient.query('TRUNCATE auth.sessions, auth.refresh_tokens, auth.mfa_factors, auth.mfa_challenges CASCADE');
    console.log(`   ✅ Cleaned auth session tables`);

    await dbClient.query('DELETE FROM auth.identities WHERE 1=1');
    console.log(`   ✅ Cleaned auth.identities`);

    const deleteAuthUsers = await dbClient.query('DELETE FROM auth.users WHERE 1=1 RETURNING id');
    console.log(`   ✅ Deleted ${deleteAuthUsers.rowCount} users from auth.users`);

    console.log('\n✨ Database cleaned successfully!\n');
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    throw error;
  }
}

async function getDistrictsAndConstituencies() {
  try {
    // Get districts
    const districtsQuery = await dbClient.query(`
      SELECT d.id, d.name
      FROM public.districts d
      WHERE d.state_id = (SELECT id FROM public.states WHERE name = 'Tamil Nadu' LIMIT 1)
      ORDER BY d.name
    `);

    // Get constituencies with their districts
    const constituenciesQuery = await dbClient.query(`
      SELECT c.id, c.name, c.district_id, d.name as district_name
      FROM public.constituencies c
      JOIN public.districts d ON c.district_id = d.id
      WHERE d.state_id = (SELECT id FROM public.states WHERE name = 'Tamil Nadu' LIMIT 1)
      ORDER BY d.name, c.name
    `);

    return {
      districts: districtsQuery.rows,
      constituencies: constituenciesQuery.rows
    };
  } catch (error) {
    console.error('❌ Error fetching geography data:', error.message);
    throw error;
  }
}

async function createAuthUser(email, password, metadata) {
  try {
    // Use direct SQL to insert into auth.users
    const userId = await dbClient.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1,
        crypt($2, gen_salt('bf')),
        now(),
        null,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider":"email","providers":["email"]}'::jsonb,
        $3::jsonb,
        null,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
        false,
        null
      ) RETURNING id
    `, [email, password, JSON.stringify(metadata)]);

    const authUserId = userId.rows[0].id;

    // Create identity
    await dbClient.query(`
      INSERT INTO auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1::text,
        $2::uuid,
        $3::jsonb,
        'email',
        now(),
        now(),
        now()
      )
    `, [authUserId, authUserId, JSON.stringify({
      sub: authUserId,
      email: email,
      email_verified: true,
      phone_verified: false
    })]);

    return authUserId;
  } catch (error) {
    console.error(`❌ Error creating auth user ${email}:`, error.message);
    throw error;
  }
}

async function createPublicUser(authUserId, userData) {
  try {
    // Calculate date of birth from age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - userData.age;
    const dateOfBirth = `${birthYear}-01-01`;

    // The trigger handle_new_user() already created a basic user record
    // We just need to UPDATE it with our detailed information
    await dbClient.query(`
      UPDATE public.users
      SET
        role = $2,
        first_name = $3,
        last_name = $4,
        username = $5,
        date_of_birth = $6::date,
        assigned_state_id = (SELECT id FROM public.states WHERE name = 'Tamil Nadu' LIMIT 1),
        assigned_district_id = $7::uuid,
        constituency = $8,
        is_active = true,
        updated_at = now()
      WHERE auth_user_id = $1::uuid
    `, [
      authUserId,
      userData.role,
      userData.firstName,
      userData.lastName,
      userData.username,
      dateOfBirth,
      userData.districtId || null,
      userData.constituency || null
    ]);
  } catch (error) {
    console.error(`❌ Error updating public user ${userData.email}:`, error.message);
    throw error;
  }
}

async function createUser(userData) {
  const metadata = {
    name: `${userData.firstName} ${userData.lastName}`,
    age: userData.age,
    gender: userData.gender
  };

  const authUserId = await createAuthUser(userData.email, UNIFORM_PASSWORD, metadata);
  await createPublicUser(authUserId, { ...userData, id: authUserId });

  return authUserId;
}

async function main() {
  console.log('🚀 Creating realistic users for Tamil Nadu Campaign Dashboard\n');
  console.log(`📍 Target: ${supabaseUrl}`);
  console.log(`🔑 Password for all users: "${UNIFORM_PASSWORD}"\n`);

  try {
    // Connect to database
    await dbClient.connect();
    console.log('✅ Connected to database\n');

    // Clean existing users
    await cleanExistingUsers();

    // Get geography data
    console.log('📊 Fetching districts and constituencies...\n');
    const { districts, constituencies } = await getDistrictsAndConstituencies();
    console.log(`   Found ${districts.length} districts`);
    console.log(`   Found ${constituencies.length} constituencies\n`);

    const createdUsers = [];

    // 1. CREATE SUPERADMIN
    console.log('👑 Creating Superadmin...\n');
    const superadmin = {
      email: 'superadmin@tvk.com',
      firstName: 'Vijay',
      lastName: 'Thalapathy',
      username: 'superadmin',
      role: 'superadmin',
      age: 50,
      gender: 'male',
      districtId: null,
      constituency: null
    };
    await createUser(superadmin);
    createdUsers.push(superadmin);
    console.log(`   ✅ ${superadmin.email} - ${superadmin.firstName} ${superadmin.lastName}`);

    // 2. CREATE 5 ADMINS
    console.log('\n👨‍💼 Creating 5 Admins...\n');
    for (let i = 1; i <= 5; i++) {
      const name = getRandomName();
      const admin = {
        email: createEmail(name.firstName, name.lastName, 'admin', `admin${i}`),
        firstName: name.firstName,
        lastName: name.lastName,
        username: `admin${i}`,
        role: 'admin',
        age: name.age,
        gender: name.gender,
        districtId: null,
        constituency: null
      };
      await createUser(admin);
      createdUsers.push(admin);
      console.log(`   ✅ ${admin.email} - ${admin.firstName} ${admin.lastName} (${admin.age}yo, ${admin.gender})`);
    }

    // 3. CREATE MANAGERS (one per district)
    console.log('\n👔 Creating Managers (one per district)...\n');
    for (const district of districts) {
      const name = getRandomName();
      const manager = {
        email: createEmail(name.firstName, name.lastName, 'manager', district.name),
        firstName: name.firstName,
        lastName: name.lastName,
        username: `manager.${district.name.toLowerCase().replace(/\s+/g, '')}`,
        role: 'manager',
        age: name.age,
        gender: name.gender,
        districtId: district.id,
        constituency: null
      };
      await createUser(manager);
      createdUsers.push(manager);
      console.log(`   ✅ ${manager.email} - ${manager.firstName} ${manager.lastName} (${district.name}, ${manager.age}yo)`);
    }

    // 4. CREATE ANALYSTS (one per constituency)
    console.log('\n📊 Creating Analysts (one per constituency)...\n');
    for (const constituency of constituencies) {
      const name = getRandomName();
      const analyst = {
        email: createEmail(name.firstName, name.lastName, 'analyst', constituency.name),
        firstName: name.firstName,
        lastName: name.lastName,
        username: `analyst.${constituency.name.toLowerCase().replace(/\s+/g, '')}`,
        role: 'analyst',
        age: name.age,
        gender: name.gender,
        districtId: constituency.district_id,
        constituency: constituency.name  // Use name instead of ID
      };
      await createUser(analyst);
      createdUsers.push(analyst);
      console.log(`   ✅ ${analyst.email} - ${analyst.firstName} ${analyst.lastName} (${constituency.name}, ${analyst.age}yo)`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Total users created: ${createdUsers.length}`);
    console.log(`   - Superadmins: 1`);
    console.log(`   - Admins: 5`);
    console.log(`   - Managers: ${districts.length}`);
    console.log(`   - Analysts: ${constituencies.length}`);
    console.log('='.repeat(80));

    console.log('\n🔑 All users have the password: "password"\n');

    console.log('📝 Sample Credentials by Role:\n');
    console.log(`   SUPERADMIN: ${createdUsers.find(u => u.role === 'superadmin').email}`);
    console.log(`   ADMIN:      ${createdUsers.find(u => u.role === 'admin').email}`);
    console.log(`   MANAGER:    ${createdUsers.find(u => u.role === 'manager').email}`);
    console.log(`   ANALYST:    ${createdUsers.find(u => u.role === 'analyst').email}`);

    console.log('\n✨ All users created successfully!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

main();
