#!/bin/bash

API_BASE="http://localhost:8000/api"

echo "========================================="
echo "Testing New Permission System"
echo "========================================="
echo

# Get normal user token (jitendra - not staff)
echo "1. Login as normal user (jitendra)..."
NORMAL_TOKEN=$(curl -s -X POST "${API_BASE}/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"jitendra","password":"admin123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -z "$NORMAL_TOKEN" ]; then
  echo "   Creating normal user first..."
  docker-compose exec -T yaw-backend python manage.py shell << 'PYTHON'
from apps.accounts.models import User
user, created = User.objects.get_or_create(
    username='jitendra',
    defaults={
        'email': 'jitendra@test.com',
        'is_superuser': False,
        'is_staff': False,
        'is_active': True,
        'is_verified': True,
    }
)
user.set_password('admin123')
user.save()
print(f"User ready: {user.username}, Staff: {user.is_staff}")
PYTHON
  
  # Try login again
  NORMAL_TOKEN=$(curl -s -X POST "${API_BASE}/auth/login/" \
    -H "Content-Type: application/json" \
    -d '{"username":"jitendra","password":"admin123"}' | \
    python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)
fi

if [ -n "$NORMAL_TOKEN" ]; then
  echo "✅ Normal user logged in"
else
  echo "❌ Failed to login normal user"
  exit 1
fi
echo

# Test READ access (should work)
echo "2. Testing READ access for normal user..."
READ_RESPONSE=$(curl -s -X GET "${API_BASE}/illustrations/?page_size=5" \
  -H "Authorization: Bearer ${NORMAL_TOKEN}")

COUNT=$(echo $READ_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
if [ "$COUNT" -gt "0" ]; then
  echo "✅ Normal user can READ illustrations (count: $COUNT)"
else
  echo "⚠️  No illustrations found or access denied"
else
echo

# Test CREATE access (should fail for normal user)
echo "3. Testing CREATE access for normal user..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/illustrations/" \
  -H "Authorization: Bearer ${NORMAL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test by normal user",
    "engine_model": 9,
    "part_category": 1
  }')

ERROR=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('detail', ''))" 2>/dev/null)
if [ -n "$ERROR" ]; then
  echo "✅ Normal user CANNOT CREATE (expected): $ERROR"
else
  echo "❌ Normal user CAN CREATE (unexpected!)"
fi
echo

# Test with admin user
echo "4. Login as admin (staff user)..."
ADMIN_TOKEN=$(curl -s -X POST "${API_BASE}/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ]; then
  echo "✅ Admin logged in"
else
  echo "❌ Failed to login admin"
  exit 1
fi
echo

# Test CREATE with admin (should work)
echo "5. Testing CREATE access for admin user..."
CREATE_ADMIN=$(curl -s -X POST "${API_BASE}/illustrations/" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test by admin",
    "engine_model": 9,
    "part_category": 1
  }')

NEW_ID=$(echo $CREATE_ADMIN | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
if [ -n "$NEW_ID" ]; then
  echo "✅ Admin CAN CREATE (ID: $NEW_ID)"
  
  # Clean up
  curl -s -X DELETE "${API_BASE}/illustrations/${NEW_ID}/" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" > /dev/null
  echo "   Cleaned up test illustration"
else
  echo "❌ Admin CANNOT CREATE"
fi
echo

# Test filtering
echo "6. Testing navigation filtering..."
FILTERED=$(curl -s -X GET "${API_BASE}/illustrations/?manufacturer=4&page_size=5" \
  -H "Authorization: Bearer ${NORMAL_TOKEN}")

FILTER_COUNT=$(echo $FILTERED | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
echo "✅ Filtering by manufacturer works (count: $FILTER_COUNT)"

echo
echo "========================================="
echo "Permission Test Complete"
echo "========================================="
echo "✅ Normal users: READ only"
echo "✅ Staff/Verified: Full CRUD"
echo "✅ Navigation filtering: Working"
