#!/usr/bin/env node
/**
 * Import all 234 Tamil Nadu Assembly Constituencies to Supabase
 * Converts GeoJSON to SQL INSERT statements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111'; // TVK

console.log('\n📊 Tamil Nadu Constituencies Import Tool\n');
console.log('='.repeat(60));

// Read the GeoJSON file
const geoJsonPath = path.join(__dirname, 'src/data/geo/tamilnadu-constituencies-full.json');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));

console.log(`\n✅ Loaded GeoJSON: ${geoJson.features.length} constituencies found\n`);

// Generate SQL INSERT statements
const sqlStatements = [];

// First, add the organization
sqlStatements.push(`
-- Ensure TVK organization exists
INSERT INTO organizations (id, name, slug, type, subscription_status, is_active)
VALUES ('${ORGANIZATION_ID}', 'Tamilaga Vettri Kazhagam', 'tvk', 'political_party', 'active', true)
ON CONFLICT (id) DO NOTHING;
`);

// Now generate constituency inserts
const values = geoJson.features.map((feature, index) => {
  const props = feature.properties;
  const geometry = feature.geometry;

  // Extract data
  const acNo = props.AC_NO || props.ac_no || (index + 1);
  const acName = (props.AC_NAME || props.ac_name || `Constituency ${acNo}`).trim();
  const distName = (props.DIST_NAME || props.dist_name || props.DT_NAME || 'Unknown').trim();
  const pcNo = props.PC_NO || props.pc_no || 1;
  const pcName = (props.PC_NAME || props.pc_name || 'Unknown PC').trim();

  // Clean up name (remove SC/ST labels for cleaner storage)
  const cleanName = acName.replace(/\s*\((SC|ST)\)\s*$/i, '').trim();
  const reservedCategory = acName.match(/\((SC|ST)\)/i) ? acName.match(/\((SC|ST)\)/i)[1].toLowerCase() : 'general';

  // Generate code
  const code = `TN-AC-${String(acNo).padStart(3, '0')}`;

  // Convert geometry to GeoJSON string for boundaries column
  const boundariesJson = JSON.stringify(geometry).replace(/'/g, "''");

  return `(
    '${ORGANIZATION_ID}',
    '${cleanName.replace(/'/g, "''")}',
    '${code}',
    'assembly',
    'Tamil Nadu',
    '${distName.replace(/'/g, "''")}',
    NULL, -- population (to be filled later)
    0, -- voter_count
    0, -- total_booths
    NULL, -- area_sq_km
    '${reservedCategory}',
    2021, -- last_election_year
    NULL, -- current_representative
    NULL, -- current_party
    '${boundariesJson}'::jsonb
  )`;
}).join(',\n  ');

sqlStatements.push(`
-- Insert all 234 Tamil Nadu Assembly Constituencies
INSERT INTO constituencies (
  organization_id,
  name,
  code,
  type,
  state,
  district,
  population,
  voter_count,
  total_booths,
  area_sq_km,
  reserved_category,
  last_election_year,
  current_representative,
  current_party,
  boundaries
) VALUES
  ${values}
ON CONFLICT (organization_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  district = EXCLUDED.district,
  reserved_category = EXCLUDED.reserved_category,
  boundaries = EXCLUDED.boundaries;
`);

// Add verification query
sqlStatements.push(`
-- Verify insertion
SELECT
  COUNT(*) as total_constituencies,
  COUNT(*) FILTER (WHERE reserved_category = 'sc') as sc_reserved,
  COUNT(*) FILTER (WHERE reserved_category = 'st') as st_reserved,
  COUNT(*) FILTER (WHERE reserved_category = 'general') as general,
  COUNT(DISTINCT district) as total_districts
FROM constituencies
WHERE organization_id = '${ORGANIZATION_ID}';
`);

// Write to SQL file
const outputPath = path.join(__dirname, '../supabase/migrations/20251109140000_insert_all_234_constituencies.sql');
const finalSql = `-- ============================================================================
-- INSERT ALL 234 TAMIL NADU ASSEMBLY CONSTITUENCIES
-- ============================================================================
-- Generated from: tamilnadu-constituencies-full.json
-- Date: ${new Date().toISOString()}
-- Total Constituencies: ${geoJson.features.length}
-- ============================================================================

${sqlStatements.join('\n')}
`;

fs.writeFileSync(outputPath, finalSql);

console.log(`✅ SQL migration file created:\n   ${outputPath}\n`);
console.log('📝 File contains:');
console.log(`   - 1 Organization (TVK)`);
console.log(`   - ${geoJson.features.length} Assembly Constituencies`);
console.log(`   - Full GeoJSON boundaries for mapping\n`);

console.log('='.repeat(60));
console.log('\n🎯 Next Steps:\n');
console.log('1. Open Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/iwtgbseaoztjbnvworyq/sql/new\n');
console.log('2. Copy the SQL from:');
console.log(`   supabase/migrations/20251109140000_insert_all_234_constituencies.sql\n`);
console.log('3. Paste and click "RUN"\n');
console.log('4. Verify with:');
console.log('   SELECT COUNT(*) FROM constituencies;\n');
console.log('   Expected: 234\n');
console.log('='.repeat(60));
console.log();
