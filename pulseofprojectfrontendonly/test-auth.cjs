const { createClient } = require('@supabase/supabase-js');

// Use the correct Supabase credentials from .env
const supabaseUrl = 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testing Supabase Authentication...\n');

  // Test 1: Try to sign up a test user
  console.log('1️⃣ Creating test user...');
  const testEmail = 'test@pulseofpeople.com';
  const testPassword = 'TestPassword123!';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log('✅ Test user already exists');
    } else {
      console.error('❌ Sign up error:', signUpError.message);
    }
  } else {
    console.log('✅ Test user created successfully');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
  }

  // Test 2: Try to sign in with test user
  console.log('\n2️⃣ Testing login...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('❌ Sign in error:', signInError.message);
    console.log('\n📝 Possible issues:');
    console.log('   - Email confirmation required (check Supabase settings)');
    console.log('   - Incorrect password');
    console.log('   - User not found');
  } else {
    console.log('✅ Login successful!');
    console.log('   User ID:', signInData.user?.id);
    console.log('   Email:', signInData.user?.email);
    console.log('   Token:', signInData.session?.access_token?.substring(0, 50) + '...');
  }

  // Test 3: Check if user exists in database
  console.log('\n3️⃣ Checking users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('email, full_name, role')
    .limit(5);

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
  } else {
    console.log(`✅ Found ${users.length} users in database:`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} - ${user.full_name} (${user.role})`);
    });
  }

  // Test 4: Sign out
  console.log('\n4️⃣ Testing sign out...');
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error('❌ Sign out error:', signOutError.message);
  } else {
    console.log('✅ Sign out successful');
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST CREDENTIALS:');
  console.log('Email: test@pulseofpeople.com');
  console.log('Password: TestPassword123!');
  console.log('='.repeat(60));
}

testAuth().catch(console.error);
