#!/bin/bash

# =====================================================
# RUN ALL MIGRATIONS SCRIPT
# Execute all database migrations in correct order
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================================${NC}"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it using one of these methods:"
    echo ""
    echo "Option 1: Export for current session:"
    echo "  export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres'"
    echo ""
    echo "Option 2: Add to .env file:"
    echo "  echo 'DATABASE_URL=postgresql://...' > .env"
    echo "  source .env"
    echo ""
    echo "Get your Supabase database URL from:"
    echo "  1. Go to https://supabase.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Settings → Database → Connection String → URI"
    echo ""
    exit 1
fi

print_header "TVK PARTY DATABASE MIGRATION SCRIPT"
print_info "Database: $(echo $DATABASE_URL | sed 's/:.*/:[HIDDEN]@/')"
echo ""

# Test database connection
print_info "Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please check your DATABASE_URL"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

print_header "STEP 1: CHECKING MIGRATION FILES"

# List of migrations in order
declare -a MIGRATIONS=(
    "supabase/migrations/20251107_create_states_table.sql"
    "supabase/migrations/20251107_create_districts_table.sql"
    "supabase/migrations/20251106_create_constituency_master.sql"
    "supabase/migrations/20251108_create_political_parties.sql"
    "supabase/migrations/20251108_create_voter_segments.sql"
    "supabase/migrations/20251108_create_issue_categories.sql"
)

# Check if all migration files exist
missing_files=0
for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        print_success "Found: $migration"
    else
        print_error "Missing: $migration"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    print_error "$missing_files migration file(s) missing"
    exit 1
fi

echo ""
read -p "Found all ${#MIGRATIONS[@]} migration files. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Migration cancelled by user"
    exit 0
fi

# Run migrations
print_header "STEP 2: RUNNING MIGRATIONS"

migration_count=0
for migration in "${MIGRATIONS[@]}"; do
    migration_count=$((migration_count + 1))
    migration_name=$(basename "$migration" .sql)

    echo ""
    print_info "[$migration_count/${#MIGRATIONS[@]}] Running: $migration_name"

    if psql "$DATABASE_URL" -f "$migration" > /tmp/migration_output.log 2>&1; then
        print_success "Completed: $migration_name"
    else
        print_error "Failed: $migration_name"
        echo ""
        echo "Error details:"
        cat /tmp/migration_output.log
        echo ""
        print_warning "Migration stopped at: $migration_name"
        exit 1
    fi
done

print_success "All migrations completed successfully!"

# Verify tables created
print_header "STEP 3: VERIFYING TABLES"

echo ""
print_info "Checking if all tables were created..."

# Expected tables
declare -a EXPECTED_TABLES=(
    "states"
    "districts"
    "assembly_constituencies"
    "elected_members"
    "polling_booths"
    "political_parties"
    "political_alliances"
    "party_members"
    "voter_segments"
    "issue_categories"
)

tables_found=0
tables_missing=0

for table in "${EXPECTED_TABLES[@]}"; do
    if psql "$DATABASE_URL" -c "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" | grep -q '1 row'; then
        print_success "Table exists: $table"
        tables_found=$((tables_found + 1))
    else
        print_error "Table missing: $table"
        tables_missing=$((tables_missing + 1))
    fi
done

echo ""
print_info "Tables found: $tables_found/${#EXPECTED_TABLES[@]}"

if [ $tables_missing -gt 0 ]; then
    print_error "$tables_missing table(s) missing"
    exit 1
fi

# Check data counts
print_header "STEP 4: CHECKING DATA"

echo ""
print_info "Checking seed data counts..."

# Query to check all counts
psql "$DATABASE_URL" << 'EOF'
SELECT
    'States' as entity,
    COUNT(*)::text as count,
    '2 (TN, PY)' as expected
FROM states
UNION ALL
SELECT
    'Districts',
    COUNT(*)::text,
    '42 (38 TN + 4 PY)'
FROM districts
UNION ALL
SELECT
    'Political Parties',
    COUNT(*)::text,
    '14 (incl. TVK)'
FROM political_parties
UNION ALL
SELECT
    'Alliances',
    COUNT(*)::text,
    '2 (DMK, AIADMK)'
FROM political_alliances
UNION ALL
SELECT
    'Voter Segments',
    COUNT(*)::text,
    '40+'
FROM voter_segments
UNION ALL
SELECT
    'Issue Categories',
    COUNT(*)::text,
    '25+'
FROM issue_categories
ORDER BY entity;
EOF

# Check TVK party specifically
print_header "STEP 5: VERIFYING TVK PARTY DATA"

echo ""
print_info "Checking TVK party entry..."

psql "$DATABASE_URL" << 'EOF'
SELECT
    code,
    name,
    name_tamil,
    current_leader,
    alliance,
    is_active
FROM political_parties
WHERE code = 'TVK';
EOF

if [ $? -eq 0 ]; then
    print_success "TVK party data verified"
else
    print_error "TVK party data not found"
fi

# Check critical voter segments
print_header "STEP 6: CHECKING CRITICAL VOTER SEGMENTS"

echo ""
print_info "TVK's critical priority segments..."

psql "$DATABASE_URL" << 'EOF'
SELECT
    segment_name as "Segment",
    estimated_voters as "Voters",
    ROUND(percentage_of_electorate, 1) as "% of Electorate",
    tvk_win_probability as "Win Probability"
FROM voter_segments
WHERE tvk_priority = 'Critical'
ORDER BY tvk_win_probability DESC
LIMIT 10;
EOF

# Check top issues
print_header "STEP 7: CHECKING TOP CAMPAIGN ISSUES"

echo ""
print_info "TVK's top priority issues..."

psql "$DATABASE_URL" << 'EOF'
SELECT
    name as "Issue",
    name_tamil as "Tamil Name",
    category as "Category",
    tvk_priority as "TVK Priority",
    CASE WHEN is_hot_topic THEN 'Yes' ELSE 'No' END as "Hot Topic"
FROM issue_categories
WHERE tvk_priority = 'Top'
ORDER BY priority_level;
EOF

# Final validation
print_header "STEP 8: FINAL VALIDATION"

echo ""
print_info "Running final validation queries..."

# Check for any missing data
validation_errors=0

# Check if states have data
state_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM states;")
if [ "$state_count" -eq 2 ]; then
    print_success "States: $state_count (correct)"
else
    print_error "States: $state_count (expected 2)"
    validation_errors=$((validation_errors + 1))
fi

# Check if districts have data
district_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM districts;")
if [ "$district_count" -eq 42 ]; then
    print_success "Districts: $district_count (correct)"
else
    print_error "Districts: $district_count (expected 42)"
    validation_errors=$((validation_errors + 1))
fi

# Check if political parties have TVK
tvk_exists=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM political_parties WHERE code = 'TVK';")
if [ "$tvk_exists" -eq 1 ]; then
    print_success "TVK party exists"
else
    print_error "TVK party not found"
    validation_errors=$((validation_errors + 1))
fi

# Check if voter segments have data
segment_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM voter_segments;")
if [ "$segment_count" -ge 40 ]; then
    print_success "Voter Segments: $segment_count (40+ expected)"
else
    print_error "Voter Segments: $segment_count (expected 40+)"
    validation_errors=$((validation_errors + 1))
fi

# Check if issue categories have data
issue_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM issue_categories;")
if [ "$issue_count" -ge 25 ]; then
    print_success "Issue Categories: $issue_count (25+ expected)"
else
    print_error "Issue Categories: $issue_count (expected 25+)"
    validation_errors=$((validation_errors + 1))
fi

# Summary
print_header "MIGRATION SUMMARY"

echo ""
if [ $validation_errors -eq 0 ]; then
    print_success "All validations passed!"
    echo ""
    echo "✅ Database schema created successfully"
    echo "✅ All master data imported"
    echo "✅ TVK party configured"
    echo "✅ Voter segments loaded (40+)"
    echo "✅ Issue categories loaded (25+)"
    echo ""
    print_success "Your TVK Party database is ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Import complete constituency data (234 TN + 30 PY)"
    echo "  2. Add TVK leadership structure"
    echo "  3. Start building frontend components"
    echo ""
    echo "Useful queries:"
    echo "  • View critical segments: SELECT * FROM tvk_priority_segments;"
    echo "  • View top issues: SELECT * FROM tvk_top_issues;"
    echo "  • Calculate addressable voters: SELECT * FROM calculate_addressable_voters();"
    echo ""
else
    print_error "$validation_errors validation(s) failed"
    echo ""
    echo "Please review the errors above and fix them before proceeding."
    exit 1
fi

print_header "MIGRATION COMPLETE"

exit 0
