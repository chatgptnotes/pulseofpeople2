#!/usr/bin/env node
/**
 * SIMPLE MASTER DATA SEEDER
 * Seeds only the essential master data matching actual Supabase schema
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Seed Tamil Nadu
async function seedTN() {
  console.log('🚀 Seeding Tamil Nadu Master Data\n');

  // 1. States
  console.log('1️⃣  States...');
  const states = [
    { name: 'Tamil Nadu', code: 'TN', capital: 'Chennai', region: 'South India', total_districts: 38, total_constituencies: 234 },
    { name: 'Puducherry', code: 'PY', capital: 'Puducherry', region: 'South India', total_districts: 4, total_constituencies: 30 }
  ];

  for (const state of states) {
    const { error } = await supabase.from('states').upsert([state], { onConflict: 'code' });
    if (error) console.error(`  ❌ ${error.message}`);
    else console.log(`  ✅ ${state.name}`);
  }

  // 2. Get state IDs
  const { data: tnState } = await supabase.from('states').select('id').eq('code', 'TN').single();
  const { data: pyState } = await supabase.from('states').select('id').eq('code', 'PY').single();

  // 3. Districts (10 major ones for demo)
  console.log('\n2️⃣  Districts...');
  const districts = [
    { state_id: tnState.id, name: 'Chennai', code: 'TN-CH', headquarters: 'Chennai', population: 7088000, area_sq_km: 426 },
    { state_id: tnState.id, name: 'Coimbatore', code: 'TN-CO', headquarters: 'Coimbatore', population: 3458045, area_sq_km: 7649 },
    { state_id: tnState.id, name: 'Madurai', code: 'TN-MD', headquarters: 'Madurai', population: 3038252, area_sq_km: 3741 },
    { state_id: tnState.id, name: 'Salem', code: 'TN-SA', headquarters: 'Salem', population: 3482056, area_sq_km: 5245 },
    { state_id: tnState.id, name: 'Tiruchirappalli', code: 'TN-TR', headquarters: 'Tiruchirappalli', population: 2722290, area_sq_km: 4403 },
    { state_id: tnState.id, name: 'Tirunelveli', code: 'TN-TV', headquarters: 'Tirunelveli', population: 3077233, area_sq_km: 6823 },
    { state_id: tnState.id, name: 'Vellore', code: 'TN-VL', headquarters: 'Vellore', population: 3936331, area_sq_km: 6077 },
    { state_id: tnState.id, name: 'Erode', code: 'TN-ER', headquarters: 'Erode', population: 2251744, area_sq_km: 5722 },
    { state_id: tnState.id, name: 'Thanjavur', code: 'TN-TH', headquarters: 'Thanjavur', population: 2405890, area_sq_km: 3396 },
    { state_id: tnState.id, name: 'Kanyakumari', code: 'TN-KY', headquarters: 'Nagercoil', population: 1870374, area_sq_km: 1672 },
    { state_id: pyState.id, name: 'Puducherry', code: 'PY-PU', headquarters: 'Puducherry', population: 950289, area_sq_km: 293 }
  ];

  for (const district of districts) {
    const { error } = await supabase.from('districts').upsert([district], { onConflict: 'code' });
    if (error) console.error(`  ❌ ${district.name}: ${error.message}`);
    else console.log(`  ✅ ${district.name}`);
  }

  // 4. Get district IDs
  const { data: allDistricts } = await supabase.from('districts').select('id, name');

  // 5. Constituencies (sample from each major city)
  console.log('\n3️⃣  Constituencies...');
  const constituencies = [
    // Chennai - 16 constituencies
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Chennai').id, name: 'Harbour', code: 'TN-AC-001', number: 1, constituency_type: 'assembly', reserved_for: 'general', total_voters: 145000 },
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Chennai').id, name: 'Anna Nagar', code: 'TN-AC-002', number: 2, constituency_type: 'assembly', reserved_for: 'general', total_voters: 152000 },
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Chennai').id, name: 'T. Nagar', code: 'TN-AC-003', number: 3, constituency_type: 'assembly', reserved_for: 'general', total_voters: 148000 },
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Chennai').id, name: 'Mylapore', code: 'TN-AC-004', number: 4, constituency_type: 'assembly', reserved_for: 'general', total_voters: 143000 },
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Chennai').id, name: 'Velachery', code: 'TN-AC-005', number: 5, constituency_type: 'assembly', reserved_for: 'general', total_voters: 165000 },

    // Coimbatore
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Coimbatore').id, name: 'Coimbatore North', code: 'TN-AC-100', number: 100, constituency_type: 'assembly', reserved_for: 'general', total_voters: 128000 },
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Coimbatore').id, name: 'Coimbatore South', code: 'TN-AC-101', number: 101, constituency_type: 'assembly', reserved_for: 'general', total_voters: 135000 },

    // Madurai
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Madurai').id, name: 'Madurai East', code: 'TN-AC-150', number: 150, constituency_type: 'assembly', reserved_for: 'general', total_voters: 142000 },
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Madurai').id, name: 'Madurai West', code: 'TN-AC-151', number: 151, constituency_type: 'assembly', reserved_for: 'general', total_voters: 138000 },

    // Salem
    { state_id: tnState.id, district_id: allDistricts.find(d => d.name === 'Salem').id, name: 'Salem North', code: 'TN-AC-070', number: 70, constituency_type: 'assembly', reserved_for: 'general', total_voters: 132000 },
  ];

  for (const constituency of constituencies) {
    const { error } = await supabase.from('constituencies').upsert([constituency], { onConflict: 'code' });
    if (error) console.error(`  ❌ ${constituency.name}: ${error.message}`);
    else console.log(`  ✅ ${constituency.name}`);
  }

  // 6. Issue Categories (TVK's 9 priorities)
  console.log('\n4️⃣  Issue Categories...');
  const issues = [
    { name: 'Jobs & Employment', description: 'Youth employment, job creation, skill development', color: '#3B82F6', priority: 1, icon: 'briefcase' },
    { name: 'Education', description: 'Quality education, scholarships, infrastructure', color: '#10B981', priority: 2, icon: 'book' },
    { name: 'Healthcare', description: 'Free healthcare, hospitals, medicine', color: '#EF4444', priority: 3, icon: 'heart' },
    { name: 'Infrastructure', description: 'Roads, bridges, public transport', color: '#F59E0B', priority: 4, icon: 'road' },
    { name: 'Agriculture', description: 'Farmer welfare, loan waivers, MSP', color: '#84CC16', priority: 5, icon: 'leaf' },
    { name: 'Law & Order', description: 'Safety, police reforms, women security', color: '#8B5CF6', priority: 6, icon: 'shield' },
    { name: 'Water & Sanitation', description: 'Drinking water, sewage, cleanliness', color: '#06B6D4', priority: 7, icon: 'droplet' },
    { name: 'Electricity', description: 'Power supply, renewable energy', color: '#FBBF24', priority: 8, icon: 'zap' },
    { name: 'Social Justice', description: 'Caste equality, minority rights', color: '#EC4899', priority: 9, icon: 'users' }
  ];

  for (const issue of issues) {
    const { error} = await supabase.from('issue_categories').upsert([issue], { onConflict: 'name' });
    if (error) console.error(`  ❌ ${issue.name}: ${error.message}`);
    else console.log(`  ✅ ${issue.name}`);
  }

  console.log('\n✅ Master data seeded successfully!\n');
}

seedTN().catch(console.error);
