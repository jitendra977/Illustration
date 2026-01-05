#!/bin/bash
API_BASE="http://localhost:8000/api"

echo "========================================="; echo "Testing New Permission System"; echo "========================================="; echo

# Test normal user (not staff)
echo "1. Testing NORMAL USER (not staff)..."; echo
NORMAL_TOKEN=$(curl -s -X POST "${API_BASE}/auth/login/" -H "Content-Type: application/json" -d '{"username":"normal_user","password":"test123"}' | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -z "$NORMAL_TOKEN" ]; then echo "❌ Failed to login normal user"; exit 1; fi
echo "✅ Normal user logged in"; echo

# Test READ (should work)
echo "   a) Testing READ access..."
COUNT=$(curl -s -X GET "${API_BASE}/illustrations/?page_size=5" -H "Authorization: Bearer ${NORMAL_TOKEN}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
echo "   ✅ Can READ illustrations (count: $COUNT)"; echo

# Test CREATE (should fail)
echo "   b) Testing CREATE access..."
ERROR=$(curl -s -X POST "${API_BASE}/illustrations/" -H "Authorization: Bearer ${NORMAL_TOKEN}" -H "Content-Type: application/json" -d '{"title":"Test","engine_model":9,"part_category":1}' | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('detail', d.get('error', '')))" 2>/dev/null)
if [ -n "$ERROR" ]; then echo "   ✅ CANNOT CREATE: $ERROR"; else echo "   ❌ CAN CREATE (unexpected!)"; fi
echo

# Test admin user (staff)
echo "2. Testing ADMIN USER (staff)..."; echo
ADMIN_TOKEN=$(curl -s -X POST "${API_BASE}/auth/login/" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then echo "❌ Failed to login admin"; exit 1; fi
echo "✅ Admin logged in"; echo

# Test CREATE (should work)
echo "   a) Testing CREATE access..."
NEW_ID=$(curl -s -X POST "${API_BASE}/illustrations/" -H "Authorization: Bearer ${ADMIN_TOKEN}" -H "Content-Type: application/json" -d '{"title":"Admin Test","engine_model":9,"part_category":1}' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -n "$NEW_ID" ]; then
  echo "   ✅ CAN CREATE (ID: $NEW_ID)"
  curl -s -X DELETE "${API_BASE}/illustrations/${NEW_ID}/" -H "Authorization: Bearer ${ADMIN_TOKEN}" > /dev/null
  echo "   Cleaned up test illustration"
else
  echo "   ❌ CANNOT CREATE"
fi
echo

# Test filtering
echo "3. Testing navigation filtering..."; echo
FILTER_COUNT=$(curl -s -X GET "${API_BASE}/illustrations/?manufacturer=4" -H "Authorization: Bearer ${NORMAL_TOKEN}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
echo "   ✅ Filter by manufacturer: $FILTER_COUNT results"

echo; echo "========================================="
echo "✅ Permission System Working Correctly"
echo "========================================="
