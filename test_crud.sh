#!/bin/bash

API_BASE="http://localhost:8000/api"
USERNAME="admin"
PASSWORD="adminpass"

echo "================================"
echo "Illustration CRUD Test Suite"
echo "================================"
echo

# 1. LOGIN
echo "1. Testing LOGIN..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ LOGIN FAILED"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ LOGIN SUCCESS"
echo

# 2. READ - List illustrations
echo "2. Testing READ (List)..."
LIST_RESPONSE=$(curl -s -X GET "${API_BASE}/illustrations/" \
  -H "Authorization: Bearer ${TOKEN}")

ILLUSTRATION_COUNT=$(echo $LIST_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
echo "✅ READ SUCCESS - Found ${ILLUSTRATION_COUNT} illustrations"
echo

# 3. CREATE - Create new illustration
echo "3. Testing CREATE..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/illustrations/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CRUD Test Illustration",
    "description": "Testing CRUD operations",
    "manufacturer": 4,
    "engine_model": 9,
    "part_category": 1
  }')

NEW_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -z "$NEW_ID" ]; then
  echo "❌ CREATE FAILED"
  echo "Response: $CREATE_RESPONSE"
else
  echo "✅ CREATE SUCCESS - New illustration ID: ${NEW_ID}"
  
  # 4. READ - Get single illustration
  echo
  echo "4. Testing READ (Detail)..."
  DETAIL_RESPONSE=$(curl -s -X GET "${API_BASE}/illustrations/${NEW_ID}/" \
    -H "Authorization: Bearer ${TOKEN}")
  
  TITLE=$(echo $DETAIL_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('title', ''))" 2>/dev/null)
  echo "✅ READ (Detail) SUCCESS - Title: ${TITLE}"
  
  # 5. UPDATE - Update the illustration
  echo
  echo "5. Testing UPDATE..."
  UPDATE_RESPONSE=$(curl -s -X PATCH "${API_BASE}/illustrations/${NEW_ID}/" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "CRUD Test Updated",
      "description": "Testing CRUD operations - UPDATED"
    }')
  
  UPDATED_TITLE=$(echo $UPDATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('title', ''))" 2>/dev/null)
  
  if [ "$UPDATED_TITLE" = "CRUD Test Updated" ]; then
    echo "✅ UPDATE SUCCESS - Title updated to: ${UPDATED_TITLE}"
  else
    echo "❌ UPDATE FAILED"
    echo "Response: $UPDATE_RESPONSE"
  fi
  
  # 6. DELETE - Delete the illustration
  echo
  echo "6. Testing DELETE..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API_BASE}/illustrations/${NEW_ID}/" \
    -H "Authorization: Bearer ${TOKEN}")
  
  if [ "$HTTP_CODE" = "204" ]; then
    echo "✅ DELETE SUCCESS"
  else
    echo "❌ DELETE FAILED - HTTP ${HTTP_CODE}"
  fi
fi

echo
echo "================================"
echo "CRUD Test Complete"
echo "================================"
