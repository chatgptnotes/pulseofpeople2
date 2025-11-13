/**
 * Script to create demo users with proper roles and uniform passwords
 * This will create test accounts for each role that can be displayed on the login page
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';
// Service role key needed to create users and update roles
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please provide the service role key to create users');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Uniform password for all demo accounts
const DEMO_PASSWORD = 'Demo@2024';

// Demo users to create
const demoUsers = [
  {
    email: 'superadmin@tvk.com',
    password: DEMO_PASSWORD,
    role: 'superadmin',
    first_name: 'Super',
    last_name: 'Admin',
    username: 'superadmin'
  },
  {
    email: 'admin@tvk.com',
    password: DEMO_PASSWORD,
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    username: 'admin'
  },
  {
    email: 'manager@tvk.com',
    password: DEMO_PASSWORD,
    role: 'manager',
    first_name: 'Manager',
    last_name: 'User',
    username: 'manager'
  },
  {
    email: 'analyst@tvk.com',
    password: DEMO_PASSWORD,
    role: 'analyst',
    first_name: 'Analyst',
    last_name: 'User',
    username: 'analyst'
  },
  {
    email: 'user@tvk.com',
    password: DEMO_PASSWORD,
    role: 'user',
    first_name: 'Regular',
    last_name: 'User',
    username: 'user'
  },
  {
    email: 'volunteer@tvk.com',
    password: DEMO_PASSWORD,
    role: 'volunteer',
    first_name: 'Volunteer',
    last_name: 'User',
    username: 'volunteer'
  },
  {
    email: 'viewer@tvk.com',
    password: DEMO_PASSWORD,
    role: 'viewer',
    first_name: 'Viewer',
    last_name: 'User',
    username: 'viewer'
  },
  {
    email: 'vijay@tvk.com',
    password: 'Vijay@2026',
    role: 'superadmin',
    first_name: 'Vijay',
    last_name: '',
    username: 'vijay',
    is_vip: true
  }
];

async function createOrUpdateUser(userData) {
  console.log(`\n📝 Processing user: ${userData.email} (${userData.role})`);

  try {
    // Check if user exists in auth.users
    const { data: existingAuthUsers, error: authCheckError } = await supabase.auth.admin.listUsers();

    if (authCheckError) {
      console.error(`   ❌ Error checking auth users:`, authCheckError.message);
      return false;
    }

    const existingAuthUser = existingAuthUsers.users.find(u => u.email === userData.email);

    let authUserId;

    if (existingAuthUser) {
      console.log(`   ℹ️  Auth user already exists, updating password...`);

      // Update password
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingAuthUser.id,
        {
          password: userData.password,
          email_confirm: true
        }
      );

      if (updateError) {
        console.error(`   ❌ Error updating password:`, updateError.message);
        return false;
      }

      authUserId = existingAuthUser.id;
      console.log(`   ✅ Password updated for ${userData.email}`);
    } else {
      console.log(`   ℹ️  Creating new auth user...`);

      // Create new auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: `${userData.first_name} ${userData.last_name}`.trim()
        }
      });

      if (createError) {
        console.error(`   ❌ Error creating auth user:`, createError.message);
        return false;
      }

      authUserId = newUser.user.id;
      console.log(`   ✅ Auth user created: ${authUserId}`);
    }

    // Update or insert into public.users
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          status: 'active'
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error(`   ❌ Error updating public.users:`, updateError.message);
        return false;
      }

      console.log(`   ✅ Updated public.users with role: ${userData.role}`);
    } else {
      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: userData.email,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          status: 'active',
          permissions: []
        });

      if (insertError) {
        console.error(`   ❌ Error inserting into public.users:`, insertError.message);
        return false;
      }

      console.log(`   ✅ Created public.users record with role: ${userData.role}`);
    }

    console.log(`   ✅ Successfully processed ${userData.email}`);
    return true;

  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up demo users with uniform passwords\n');
  console.log(`📍 Target: ${supabaseUrl}`);
  console.log(`🔑 Uniform password: ${DEMO_PASSWORD}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const userData of demoUsers) {
    const success = await createOrUpdateUser(userData);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully processed: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Demo users are ready!');
    console.log('\n📝 Test Credentials:');
    demoUsers.forEach(user => {
      console.log(`   ${user.role.toUpperCase().padEnd(12)} - ${user.email} / ${user.password}`);
    });
  }
}

main().catch(console.error);
