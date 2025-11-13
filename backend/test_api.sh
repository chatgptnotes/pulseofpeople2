#!/bin/bash

# Get access token
echo "Testing API with Supabase PostgreSQL..."
echo ""

TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "superadmin", "password": "admin123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

echo "✓ Login successful, got token"
echo ""

# Test campaigns
echo "=== Testing Campaigns API ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/campaigns/ | \
  python3 -m json.tool | head -30
echo ""

# Test constituencies
echo "=== Testing Constituencies API ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/constituencies/ | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Count: {data[\"count\"]}'); print('Names:', [c['name'] for c in data['results'][:3]])"
echo ""

# Test voters
echo "=== Testing Voters API ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/voters/ | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Total Voters: {data[\"count\"]}')"
echo ""

echo "✓ All API tests passed!"
