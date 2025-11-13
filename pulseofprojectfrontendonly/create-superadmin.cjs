#!/usr/bin/env node

/**
 * Create Superadmin User Script
 * Creates both auth user and profile in one command
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SERVICE_ROLE_KEY = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_SECRET=(.*)/)?.[1]?.trim();

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase admin client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SUPERADMIN_USER = {
  email: 'admin@pulseofpeople.com',
  password: 'Admin@123456',
  username: 'superadmin',
  firstName: 'Admin',
  lastName: 'User',
  role: 'superadmin'
};

async function createSuperadmin() {
  console.log('🚀 Creating Superadmin User');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Create auth user
    console.log('📝 Step 1: Creating authentication user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_USER.email,
      password: SUPERADMIN_USER.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: `${SUPERADMIN_USER.firstName} ${SUPERADMIN_USER.lastName}`,
        role: SUPERADMIN_USER.role
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') ||
          authError.message.includes('already exists') ||
          authError.message.includes('already been registered')) {
        console.log('   ⚠️  Auth user already exists, will try to create profile only...\n');

        // Try to get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error getting existing user:', listError.message);
          process.exit(1);
        }

        const existingUser = users.find(u => u.email === SUPERADMIN_USER.email);
        if (!existingUser) {
          console.error('❌ Could not find existing user');
          process.exit(1);
        }

        // Step 2: Create profile for existing user
        console.log('📝 Step 2: Creating user profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            auth_user_id: existingUser.id,
            email: SUPERADMIN_USER.email,
            username: SUPERADMIN_USER.username,
            first_name: SUPERADMIN_USER.firstName,
            last_name: SUPERADMIN_USER.lastName,
            role: SUPERADMIN_USER.role
          })
          .select()
          .single();

        if (profileError) {
          if (profileError.message.includes('duplicate') || profileError.message.includes('already exists')) {
            console.log('   ⚠️  Profile already exists\n');
            console.log('✅ User is fully set up! Try logging in.\n');
          } else {
            console.error('❌ Error creating profile:', profileError.message);
            process.exit(1);
          }
        } else {
          console.log('   ✅ Profile created successfully\n');
        }
      } else {
        console.error('❌ Error creating auth user:', authError.message);
        process.exit(1);
      }
    } else {
      console.log('   ✅ Auth user created successfully');
      console.log(`   📧 User ID: ${authData.user.id}\n`);

      // Step 2: Create user profile
      console.log('📝 Step 2: Creating user profile in database...');
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          email: SUPERADMIN_USER.email,
          username: SUPERADMIN_USER.username,
          first_name: SUPERADMIN_USER.firstName,
          last_name: SUPERADMIN_USER.lastName,
          role: SUPERADMIN_USER.role
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
        console.log('\n⚠️  Auth user was created but profile failed.');
        console.log('   You may need to manually link them or delete the auth user and retry.\n');
        process.exit(1);
      }

      console.log('   ✅ Profile created successfully\n');
    }

    // Success!
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅  SUPERADMIN USER CREATED!  ✅ ✅ ✅\n');
    console.log('🎉 You can now login at: http://localhost:5173/login\n');
    console.log('📝 Login Credentials:');
    console.log(`   📧 Email:    ${SUPERADMIN_USER.email}`);
    console.log(`   🔑 Password: ${SUPERADMIN_USER.password}`);
    console.log(`   👤 Role:     ${SUPERADMIN_USER.role}\n`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
createSuperadmin();
