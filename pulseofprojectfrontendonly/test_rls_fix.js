#!/usr/bin/env node
/**
 * Test RLS Fix - Verify Supabase data access works
 * Run: node test_rls_fix.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwtgbseaoztjbnvworyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dGdic2Vhb3p0amJudndvcnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjAzOTksImV4cCI6MjA3NjczNjM5OX0.xA4B0XZJE_4MdjFCkw2yVsf4vlHmHfpeV6Bk5tG2T94';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n🧪 Testing Supabase RLS Fix\n');
console.log('='.repeat(60));

async function testDataAccess() {
  let allTestsPassed = true;

  // Test 1: Organizations
  console.log('\n📊 Test 1: Fetching Organizations...');
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, type')
    .limit(5);

  if (orgError) {
    console.error('❌ FAILED:', orgError.message);
    if (orgError.message.includes('infinite recursion')) {
      console.log('   → RLS fix has NOT been applied yet');
      console.log('   → Follow instructions in RLS_FIX_INSTRUCTIONS.md');
    }
    allTestsPassed = false;
  } else {
    console.log('✅ SUCCESS:', orgs?.length || 0, 'organizations found');
    if (orgs && orgs.length > 0) {
      console.log('   Sample:', orgs[0].name);
    }
  }

  // Test 2: Constituencies
  console.log('\n🗺️  Test 2: Fetching Constituencies...');
  const { data: constituencies, error: constError } = await supabase
    .from('constituencies')
    .select('id, name, code, voter_count')
    .limit(5);

  if (constError) {
    console.error('❌ FAILED:', constError.message);
    allTestsPassed = false;
  } else {
    console.log('✅ SUCCESS:', constituencies?.length || 0, 'constituencies found');
    if (constituencies && constituencies.length > 0) {
      console.log('   Sample:', constituencies[0].name);
    }
  }

  // Test 3: Wards
  console.log('\n🏘️  Test 3: Fetching Wards...');
  const { data: wards, error: wardsError } = await supabase
    .from('wards')
    .select('id, name, code, voter_count')
    .limit(5);

  if (wardsError) {
    console.error('❌ FAILED:', wardsError.message);
    allTestsPassed = false;
  } else {
    console.log('✅ SUCCESS:', wards?.length || 0, 'wards found');
    if (wards && wards.length > 0) {
      console.log('   Sample:', wards[0].name, '(' + wards[0].voter_count + ' voters)');
    }
  }

  // Test 4: Polling Booths
  console.log('\n📍 Test 4: Fetching Polling Booths...');
  const { data: booths, error: boothsError } = await supabase
    .from('polling_booths')
    .select('id, name, booth_number, total_voters')
    .limit(5);

  if (boothsError) {
    console.error('❌ FAILED:', boothsError.message);
    allTestsPassed = false;
  } else {
    console.log('✅ SUCCESS:', booths?.length || 0, 'polling booths found');
    if (booths && booths.length > 0) {
      console.log('   Sample:', booths[0].name, '(' + booths[0].total_voters + ' voters)');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('\n🎉 ALL TESTS PASSED! RLS fix is working correctly.\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please apply the RLS fix:\n');
    console.log('   1. Open: https://supabase.com/dashboard/project/iwtgbseaoztjbnvworyq/sql/new');
    console.log('   2. Copy SQL from: supabase/migrations/20251109120000_fix_rls_final.sql');
    console.log('   3. Paste and click "RUN"');
    console.log('   4. Run this test again: node test_rls_fix.js\n');
    console.log('   Or read: RLS_FIX_INSTRUCTIONS.md for detailed help\n');
  }

  process.exit(allTestsPassed ? 0 : 1);
}

testDataAccess();
