/**
 * Service to fetch demo credentials from the database
 * These are real users from public.users table
 */

import { supabase } from '../lib/supabase';

export interface DemoCredential {
  email: string;
  role: string;
  displayName: string;
  password: string; // This will be a uniform password we set
}

/**
 * Fetch demo users from the database
 * Returns one user per role for display on login page
 */
export async function fetchDemoCredentials(): Promise<DemoCredential[]> {
  try {
    // Fetch users grouped by role - get one sample per role
    const { data, error } = await supabase
      .from('users')
      .select('email, role, first_name, last_name, username')
      .in('role', ['superadmin', 'admin', 'manager', 'analyst'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[DemoCredentials] Error fetching users:', error);
      return getHardcodedFallback();
    }

    if (!data || data.length === 0) {
      console.warn('[DemoCredentials] No users found in database');
      return getHardcodedFallback();
    }

    // Group by role and get first user from each role
    const roleMap = new Map<string, any>();
    data.forEach(user => {
      if (!roleMap.has(user.role)) {
        roleMap.set(user.role, user);
      }
    });

    // Convert to DemoCredential format
    const credentials: DemoCredential[] = [];
    const uniformPassword = 'password'; // ALL users have password "password"

    // Define role order
    const roleOrder = ['superadmin', 'admin', 'manager', 'analyst'];

    roleOrder.forEach(role => {
      const user = roleMap.get(role);
      if (user) {
        const displayName = user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : user.username || role;

        credentials.push({
          email: user.email,
          role: user.role,
          displayName,
          password: uniformPassword
        });
      }
    });

    return credentials;

  } catch (error) {
    console.error('[DemoCredentials] Unexpected error:', error);
    return getHardcodedFallback();
  }
}

/**
 * Fallback credentials if database query fails
 * These should match what we set up in the database
 */
function getHardcodedFallback(): DemoCredential[] {
  return [
    {
      email: 'superadmin@tvk.com',
      role: 'superadmin',
      displayName: 'Vijay Thalapathy',
      password: 'password'
    },
    {
      email: 'shanthi.sundaram.admin1@tvk.com',
      role: 'admin',
      displayName: 'Shanthi Sundaram',
      password: 'password'
    },
    {
      email: 'ganesh.velu.chennai@tvk.com',
      role: 'manager',
      displayName: 'Ganesh Velu',
      password: 'password'
    },
    {
      email: 'ganesh.pandian.annanagar@tvk.com',
      role: 'analyst',
      displayName: 'Ganesh Pandian',
      password: 'password'
    }
  ];
}
