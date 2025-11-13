/**
 * Test Script: Verify Supabase Migrations
 * Run this after applying Phase 1 and Phase 2 migrations
 *
 * Usage:
 *   cd frontend
 *   npx tsx test-migration.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load from environment variables - DO NOT hardcode credentials
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.test}`);
  if (result.message) {
    console.log(`   ${result.message}`);
  }
  if (result.data) {
    console.log(`   Data:`, result.data);
  }
  console.log('');
}

async function runTests() {
  console.log('🧪 Testing Supabase Migration...\n');
  console.log('================================================\n');

  // ============================================================================
  // PHASE 1 TESTS: Core Entities
  // ============================================================================

  console.log('📋 PHASE 1: Core Entities\n');

  // Test 1: Organizations table
  try {
    const { data, error, count } = await supabase
      .from('organizations')
      .select('*', { count: 'exact' });

    if (error) throw error;

    logResult({
      test: 'Organizations table',
      passed: (count || 0) >= 3,
      message: `Found ${count} organizations (expected: 3)`,
      data: data?.map(o => ({ name: o.name, slug: o.slug }))
    });
  } catch (error: any) {
    logResult({
      test: 'Organizations table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 2: Users table
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (error) throw error;

    const roleCount = data?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logResult({
      test: 'Users table',
      passed: (count || 0) >= 8,
      message: `Found ${count} users (expected: 8)`,
      data: roleCount
    });
  } catch (error: any) {
    logResult({
      test: 'Users table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 3: User Permissions table
  try {
    const { data, error, count } = await supabase
      .from('user_permissions')
      .select('*', { count: 'exact' });

    if (error) throw error;

    logResult({
      test: 'User Permissions table',
      passed: (count || 0) >= 7,
      message: `Found ${count} permissions (expected: 7)`,
      data: data?.map(p => p.permission_key)
    });
  } catch (error: any) {
    logResult({
      test: 'User Permissions table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 4: Audit Logs table (should exist but be empty initially)
  try {
    const { error } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1);

    logResult({
      test: 'Audit Logs table',
      passed: !error,
      message: error ? `Error: ${error.message}` : 'Table exists and is queryable'
    });
  } catch (error: any) {
    logResult({
      test: 'Audit Logs table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // ============================================================================
  // PHASE 2 TESTS: Geography & Territory
  // ============================================================================

  console.log('================================================\n');
  console.log('🗺️  PHASE 2: Geography & Territory\n');

  // Test 5: Constituencies table
  try {
    const { data, error, count } = await supabase
      .from('constituencies')
      .select('*', { count: 'exact' });

    if (error) throw error;

    logResult({
      test: 'Constituencies table',
      passed: (count || 0) >= 5,
      message: `Found ${count} constituencies (expected: 5)`,
      data: data?.map(c => ({ name: c.name, state: c.state }))
    });
  } catch (error: any) {
    logResult({
      test: 'Constituencies table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 6: Wards table
  try {
    const { data, error, count } = await supabase
      .from('wards')
      .select('*', { count: 'exact' });

    if (error) throw error;

    logResult({
      test: 'Wards table',
      passed: (count || 0) >= 3,
      message: `Found ${count} wards (expected: 3)`,
      data: data?.map(w => ({ name: w.name, code: w.code }))
    });
  } catch (error: any) {
    logResult({
      test: 'Wards table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 7: Polling Booths table
  try {
    const { data, error, count } = await supabase
      .from('polling_booths')
      .select('*', { count: 'exact' });

    if (error) throw error;

    const boothsWithCoordinates = data?.filter(b => b.latitude && b.longitude).length || 0;

    logResult({
      test: 'Polling Booths table',
      passed: (count || 0) >= 10,
      message: `Found ${count} booths (expected: 10), ${boothsWithCoordinates} with coordinates`,
      data: {
        total: count,
        withCoordinates: boothsWithCoordinates,
        totalVoters: data?.reduce((sum, b) => sum + (b.total_voters || 0), 0)
      }
    });
  } catch (error: any) {
    logResult({
      test: 'Polling Booths table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 8: Voters table (should exist but be empty initially)
  try {
    const { error } = await supabase
      .from('voters')
      .select('id')
      .limit(1);

    logResult({
      test: 'Voters table',
      passed: !error,
      message: error ? `Error: ${error.message}` : 'Table exists and is queryable (ready for data)'
    });
  } catch (error: any) {
    logResult({
      test: 'Voters table',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // ============================================================================
  // FUNCTION TESTS
  // ============================================================================

  console.log('================================================\n');
  console.log('⚙️  FUNCTION TESTS\n');

  // Test 9: RPC function - get_user_permissions
  try {
    const { data, error } = await supabase
      .rpc('get_user_permissions', {
        p_user_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' // Manager user from sample data
      });

    if (error) throw error;

    logResult({
      test: 'Function: get_user_permissions',
      passed: Array.isArray(data) && data.length >= 4,
      message: `Returned ${data?.length || 0} permissions for manager (expected: 4)`,
      data: data?.map((p: any) => p.permission_key)
    });
  } catch (error: any) {
    logResult({
      test: 'Function: get_user_permissions',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 10: RPC function - find_booths_near
  try {
    const { data, error } = await supabase
      .rpc('find_booths_near', {
        p_latitude: 13.0827,
        p_longitude: 80.2707,
        p_radius_meters: 10000 // 10km radius
      });

    if (error) throw error;

    logResult({
      test: 'Function: find_booths_near',
      passed: Array.isArray(data),
      message: `Found ${data?.length || 0} booths near Chennai (13.0827°N, 80.2707°E)`,
      data: data?.slice(0, 3).map((b: any) => ({
        name: b.booth_name,
        distance: Math.round(b.distance_meters) + 'm'
      }))
    });
  } catch (error: any) {
    logResult({
      test: 'Function: find_booths_near',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // Test 11: RPC function - get_constituency_stats
  try {
    const { data: constituencies } = await supabase
      .from('constituencies')
      .select('id')
      .limit(1);

    if (constituencies && constituencies.length > 0) {
      const { data, error } = await supabase
        .rpc('get_constituency_stats', {
          p_constituency_id: constituencies[0].id
        });

      if (error) throw error;

      logResult({
        test: 'Function: get_constituency_stats',
        passed: data !== null,
        message: 'Constituency statistics function works',
        data: data?.[0]
      });
    } else {
      throw new Error('No constituencies found');
    }
  } catch (error: any) {
    logResult({
      test: 'Function: get_constituency_stats',
      passed: false,
      message: `Error: ${error.message}`
    });
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('================================================\n');
  console.log('📊 TEST SUMMARY\n');

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log(`✅ Passed: ${passedCount}/${totalCount} (${passRate}%)`);
  console.log(`❌ Failed: ${totalCount - passedCount}/${totalCount}\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED! Your Supabase migration is complete and working.\n');
    console.log('Next steps:');
    console.log('  1. Generate sample voter data (50,000+ records)');
    console.log('  2. Update frontend components to use real data');
    console.log('  3. Start building features with live database\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
    console.log('Common fixes:');
    console.log('  - Make sure you ran BOTH Phase 1 and Phase 2 migrations');
    console.log('  - Check that sample data was inserted correctly');
    console.log('  - Verify RLS policies are not blocking access\n');
  }

  console.log('================================================\n');
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});
