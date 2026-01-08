#!/bin/bash

API_BASE="http://localhost:8000/api"
USERNAME="admin"
PASSWORD="adminpass"

echo "================================"
echo "File Upload CRUD Test"
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

# 2. CREATE illustration with file
echo "2. Creating illustration with file..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/illustrations/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "title=File Upload Test" \
  -F "description=Testing file upload functionality" \
  -F "manufacturer=4" \
  -F "engine_model=9" \
  -F "part_category=1" \
  -F "files=@test_illustration.svg")

ILLUSTRATION_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -z "$ILLUSTRATION_ID" ]; then
  echo "❌ CREATE FAILED"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Created illustration ID: ${ILLUSTRATION_ID}"
echo

# 3. Verify file was uploaded
echo "3. Checking uploaded files..."
DETAIL=$(curl -s -X GET "${API_BASE}/illustrations/${ILLUSTRATION_ID}/" \
  -H "Authorization: Bearer ${TOKEN}")

FILE_COUNT=$(echo $DETAIL | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('files', [])))" 2>/dev/null)

echo "File count: ${FILE_COUNT}"
if [ "$FILE_COUNT" -gt "0" ]; then
  echo "✅ File uploaded successfully"
  
  # Get file ID
  FILE_ID=$(echo $DETAIL | python3 -c "import sys, json; files = json.load(sys.stdin).get('files', []); print(files[0]['id'] if files else '')" 2>/dev/null)
  echo "File ID: ${FILE_ID}"
else
  echo "⚠️  No files found"
fi
echo

# 4. Upload additional file
if [ -n "$FILE_ID" ]; then
  echo "4. Uploading additional file..."
  UPLOAD_RESPONSE=$(curl -s -X POST "${API_BASE}/illustrations/${ILLUSTRATION_ID}/upload_file/" \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "file=@test_diagram.svg" \
    -F "description=Additional diagram")
  
  NEW_FILE_ID=$(echo $UPLOAD_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
  
  if [ -n "$NEW_FILE_ID" ]; then
    echo "✅ Additional file uploaded (ID: ${NEW_FILE_ID})"
  else
    echo "❌ Failed to upload additional file"
    echo "Response: $UPLOAD_RESPONSE"
  fi
  echo
fi

# 5. Delete file
if [ -n "$FILE_ID" ]; then
  echo "5. Testing file deletion..."
  DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${API_BASE}/illustration-files/${FILE_ID}/" \
    -H "Authorization: Bearer ${TOKEN}")
  
  if [ "$DELETE_STATUS" = "204" ]; then
    echo "✅ File deleted successfully"
  else
    echo "❌ File deletion failed (HTTP ${DELETE_STATUS})"
  fi
  echo
fi

# 6. Delete illustration
echo "6. Cleaning up - deleting illustration..."
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
