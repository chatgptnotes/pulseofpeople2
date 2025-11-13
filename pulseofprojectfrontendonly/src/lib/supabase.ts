import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for now to bypass .env loading issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';

console.log('[Supabase] Initializing client...');
console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Key exists:', !!supabaseAnonKey);

// Create Supabase client with proper configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pulse-of-people-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'pulse-of-people-web',
    },
  },
});

console.log('[Supabase] ✓ Client initialized successfully');

export { supabase };
export default supabase;