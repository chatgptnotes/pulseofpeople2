/**
 * Seed Test Users Script
 *
 * This script creates test users in Supabase for authentication testing
 * Run with: node scripts/seed-test-users.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_SECRET:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users to create
const testUsers = [
  {
    email: 'testadmin@tvk.com',
    password: 'Admin@2024',
    full_name: 'Super Admin',
    role: 'superadmin',
    is_super_admin: true,
    permissions: ['*'],
    status: 'active'
  },
  {
    email: 'admin1@tvk.com',
    password: 'Admin@2024',
    full_name: 'Vijay (Admin)',
    role: 'admin',
    is_super_admin: false,
    permissions: ['*'],
    status: 'active'
  },
  {
    email: 'manager@tvk.com',
    password: 'Manager@2024',
    full_name: 'District Manager',
    role: 'manager',
    is_super_admin: false,
    permissions: ['read', 'write', 'analytics'],
    status: 'active'
  },
  {
    email: 'analyst@tvk.com',
    password: 'Analyst@2024',
    full_name: 'Constituency Analyst',
    role: 'analyst',
    is_super_admin: false,
    permissions: ['read', 'analytics'],
    status: 'active'
  },
  {
    email: 'user@tvk.com',
    password: 'User@2024',
    full_name: 'Booth Agent',
    role: 'user',
    is_super_admin: false,
    permissions: ['read'],
    status: 'active'
  },
  {
    email: 'volunteer1@tvk.com',
    password: 'Volunteer@2024',
    full_name: 'Field Volunteer',
    role: 'volunteer',
    is_super_admin: false,
    permissions: ['read'],
    status: 'active'
  },
  {
    email: 'viewer@tvk.com',
    password: 'Viewer@2024',
    full_name: 'Read-Only Viewer',
    role: 'viewer',
    is_super_admin: false,
    permissions: ['read'],
    status: 'active'
  },
  {
    email: 'vijay@tvk.com',
    password: 'Vijay@2026',
    full_name: 'Thalapathy Vijay',
    role: 'admin',
    is_super_admin: true,
    permissions: ['*'],
    status: 'active'
  }
];

async function createUser(userData) {
  console.log(`\n📝 Creating user: ${userData.email}`);

  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  User already exists: ${userData.email}`);

        // Try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === userData.email);

        if (existingUser) {
          console.log(`   ✓ Found existing user ID: ${existingUser.id}`);

          // Update user profile in database
          const { error: updateError } = await supabase
            .from('users')
            .upsert({
              id: existingUser.id,
              email: userData.email,
              full_name: userData.full_name,
              role: userData.role,
              is_super_admin: userData.is_super_admin,
              permissions: userData.permissions,
              status: userData.status,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (updateError) {
            console.error(`   ❌ Failed to update profile: ${updateError.message}`);
          } else {
            console.log(`   ✓ Profile updated successfully`);
          }
        }
        return;
      }

      throw authError;
    }

    console.log(`   ✓ Auth user created: ${authData.user.id}`);

    // Step 2: Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_super_admin: userData.is_super_admin,
        permissions: userData.permissions,
        status: userData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`   ⚠️  Failed to create profile: ${profileError.message}`);
      // Continue even if profile creation fails
    } else {
      console.log(`   ✓ User profile created`);
    }

    console.log(`   ✅ User created successfully!`);
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   🔑 Password: ${userData.password}`);
    console.log(`   👤 Role: ${userData.role}`);

  } catch (error) {
    console.error(`   ❌ Error creating user ${userData.email}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting test users seed script...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

  // Test connection
  console.log('\n🔌 Testing Supabase connection...');
  const { data, error } = await supabase.from('users').select('count').limit(1);

  if (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    console.error('\nPlease check:');
    console.error('1. VITE_SUPABASE_URL is correct');
    console.error('2. VITE_SUPABASE_SERVICE_ROLE_SECRET is correct');
    console.error('3. The "users" table exists in your Supabase database');
    process.exit(1);
  }

  console.log('✅ Successfully connected to Supabase!\n');
  console.log('=' .repeat(60));
  console.log('Creating test users...');
  console.log('=' .repeat(60));

  // Create all test users
  for (const userData of testUsers) {
    await createUser(userData);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Seed script completed!');
  console.log('=' .repeat(60));
  console.log('\n📋 Test Credentials Summary:\n');

  testUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log('');
  });

  console.log('You can now login at: http://localhost:5173/login');
  console.log('Click "Show" on "Developer Test Credentials" to see all credentials\n');
}

// Run the script
main().catch(console.error);
