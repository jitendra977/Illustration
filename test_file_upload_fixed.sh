#!/bin/bash

API_BASE="http://localhost:8000/api"
USERNAME="admin"
PASSWORD="adminpass"

echo "================================"
echo "File Upload CRUD Test (Fixed)"
echo "================================"
echo

# 1. LOGIN
echo "1. Getting auth token..."
TOKEN=$(curl -s -X POST "${API_BASE}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}" | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ LOGIN FAILED"
  exit 1
fi
echo "✅ Login successful"
echo

# 2. CREATE illustration with file(s)
echo "2. Creating illustration with files..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/illustrations/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "title=File Upload Test" \
  -F "description=Testing file upload functionality" \
  -F "manufacturer=4" \
  -F "engine_model=9" \
  -F "part_category=1" \
  -F "uploaded_files=@test_illustration.svg" \
  -F "uploaded_files=@test_diagram.svg")

ILLUSTRATION_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -z "$ILLUSTRATION_ID" ]; then
  echo "❌ CREATE FAILED"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Created illustration ID: ${ILLUSTRATION_ID}"
echo

# 3. Verify files were uploaded
echo "3. Checking uploaded files..."
DETAIL=$(curl -s -X GET "${API_BASE}/illustrations/${ILLUSTRATION_ID}/" \
  -H "Authorization: Bearer ${TOKEN}")

FILE_COUNT=$(echo $DETAIL | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('files', [])))" 2>/dev/null)

echo "File count: ${FILE_COUNT}"
if [ "$FILE_COUNT" -gt "0" ]; then
  echo "✅ Files uploaded successfully"
  
  # List file details
  echo $DETAIL | python3 -c "import sys, json; files = json.load(sys.stdin).get('files', []); [print(f\"  - File {i+1}: {f.get('file_name', 'unknown')} (ID: {f.get('id')})\") for i, f in enumerate(files)]" 2>/dev/null
  
  # Get first file ID for additional tests
  FILE_ID=$(echo $DETAIL | python3 -c "import sys, json; files = json.load(sys.stdin).get('files', []); print(files[0]['id'] if files else '')" 2>/dev/null)
  echo "First file ID: ${FILE_ID}"
else
  echo "⚠️  No files found"
fi
echo

# 4. Test file download URL
if [ -n "$FILE_ID" ]; then
  echo "4. Testing file download..."
  DOWNLOAD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET "${API_BASE}/illustration-files/${FILE_ID}/download/" \
    -H "Authorization: Bearer ${TOKEN}")
  
  if [ "$DOWNLOAD_STATUS" = "200" ]; then
    echo "✅ File download accessible (HTTP ${DOWNLOAD_STATUS})"
  else
    echo "⚠️  File download returned HTTP ${DOWNLOAD_STATUS}"
  fi
  echo
fi

# 5. Test UPDATE illustration (metadata only)
echo "5. Testing UPDATE (metadata)..."
UPDATE_RESPONSE=$(curl -s -X PATCH "${API_BASE}/illustrations/${ILLUSTRATION_ID}/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description via API"}')

UPDATED_DESC=$(echo $UPDATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('description', ''))" 2>/dev/null)

if [ "$UPDATED_DESC" = "Updated description via API" ]; then
  echo "✅ UPDATE SUCCESS - Description updated"
else
  echo "❌ UPDATE FAILED"
fi
echo

# 6. Delete single file
if [ -n "$FILE_ID" ]; then
  echo "6. Testing file deletion..."
  DELETE_FILE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${API_BASE}/illustration-files/${FILE_ID}/" \
    -H "Authorization: Bearer ${TOKEN}")
  
  if [ "$DELETE_FILE_STATUS" = "204" ]; then
    echo "✅ File deleted successfully"
  else
    echo "❌ File deletion failed (HTTP ${DELETE_FILE_STATUS})"
  fi
  echo
fi

# 7. Verify file was deleted
echo "7. Verifying file deletion..."
DETAIL_AFTER=$(curl -s -X GET "${API_BASE}/illustrations/${ILLUSTRATION_ID}/" \
  -H "Authorization: Bearer ${TOKEN}")

FILE_COUNT_AFTER=$(echo $DETAIL_AFTER | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('files', [])))" 2>/dev/null)
echo "Remaining files: ${FILE_COUNT_AFTER}"

if [ "$FILE_COUNT_AFTER" -lt "$FILE_COUNT" ]; then
  echo "✅ File deletion verified"
else
  echo "⚠️  File count unchanged"
fi
echo

# 8. Delete illustration
echo "8. Cleaning up - deleting illustration..."
DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE "${API_BASE}/illustrations/${ILLUSTRATION_ID}/" \
  -H "Authorization: Bearer ${TOKEN}")

if [ "$DELETE_STATUS" = "204" ]; then
  echo "✅ Illustration deleted successfully"
else
  echo "❌ Illustration deletion failed (HTTP ${DELETE_STATUS})"
fi

echo
echo "================================"
echo "File Upload Test Complete"
echo "================================"
