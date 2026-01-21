#!/bin/bash
# Production Login Diagnostic Script

echo "=== Production Frontend Login Diagnostic ==="
echo ""

echo "1. Testing API Endpoint Accessibility..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://api.yaw.nishanaweb.cloud/api/

echo ""
echo "2. Testing Login Endpoint..."
curl -s -X POST https://api.yaw.nishanaweb.cloud/api/auth/login/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://yaw.nishanaweb.cloud" \
  -d '{"email":"admin@gmail.com","password":"adminpass"}' \
  -w "\nHTTP Status: %{http_code}\n" | head -20

echo ""
echo "3. Checking CORS Headers..."
curl -s -I -X OPTIONS https://api.yaw.nishanaweb.cloud/api/auth/login/ \
  -H "Origin: https://yaw.nishanaweb.cloud" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" | grep -i "access-control"

echo ""
echo "4. Testing with Username..."
curl -s -X POST https://api.yaw.nishanaweb.cloud/api/auth/login/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://yaw.nishanaweb.cloud" \
  -d '{"username":"admin","password":"adminpass"}' \
  -w "\nHTTP Status: %{http_code}\n" | head -20

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "Next steps:"
echo "1. Check browser console on https://yaw.nishanaweb.cloud for errors"
echo "2. Check Network tab for failed requests"
echo "3. Verify .env.production is being used in build"
