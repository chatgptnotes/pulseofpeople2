const { createClient } = require('@supabase/supabase-js');

// Use the correct Supabase credentials from .env
const supabaseUrl = 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test users matching the Login page credentials
const testUsers = [
  { email: 'testadmin@tvk.com', password: 'Admin@2024', name: 'Test Super Admin', role: 'superadmin' },
  { email: 'admin1@tvk.com', password: 'Admin@2024', name: 'Admin User', role: 'admin' },
  { email: 'manager@tvk.com', password: 'Manager@2024', name: 'Manager User', role: 'manager' },
  { email: 'analyst@tvk.com', password: 'Analyst@2024', name: 'Analyst User', role: 'analyst' },
  { email: 'user@tvk.com', password: 'User@2024', name: 'Regular User', role: 'user' },
  { email: 'volunteer1@tvk.com', password: 'Volunteer@2024', name: 'Volunteer Worker', role: 'volunteer' },
  { email: 'viewer@tvk.com', password: 'Viewer@2024', name: 'Viewer User', role: 'viewer' },
  { email: 'vijay@tvk.com', password: 'Vijay@2026', name: 'Vijay VIP Demo', role: 'admin' },
];

async function createAuthUsers() {
  console.log('🔧 Creating Supabase Auth accounts for existing users...\n');

  for (const user of testUsers) {
    console.log(`Creating auth for: ${user.email}`);

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.name,
          role: user.role,
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`  ✅ Auth account already exists`);
      } else {
        console.log(`  ❌ Error: ${authError.message}`);
        continue;
      }
    } else {
      console.log(`  ✅ Auth account created`);
    }

    // Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', user.email)
      .single();

    if (checkError || !existingUser) {
      console.log(`  ℹ️  No user record in database yet`);
    } else {
      console.log(`  ✅ User record exists in database`);
    }

    console.log('');
  }

  console.log('='.repeat(70));
  console.log('✅ AUTHENTICATION SETUP COMPLETE');
  console.log('='.repeat(70));
  console.log('\nYou can now login with any of these accounts:\n');
  testUsers.forEach(u => {
    console.log(`📧 ${u.email}`);
    console.log(`🔑 ${u.password}`);
    console.log(`👤 Role: ${u.role}\n`);
  });
  console.log('='.repeat(70));
}

createAuthUsers().catch(console.error);
