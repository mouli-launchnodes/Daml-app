#!/bin/bash

echo "=== DAML Services Troubleshooting ==="
echo

# Test JSON API health with correct address
echo "1. Testing JSON API Health (127.0.0.1)..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://127.0.0.1:7575/livez)
HEALTH_CODE="${HEALTH_RESPONSE: -3}"
HEALTH_BODY="${HEALTH_RESPONSE%???}"

if [ "$HEALTH_CODE" = "200" ]; then
    echo "✅ JSON API is healthy"
    echo "   Response: $HEALTH_BODY"
else
    echo "❌ JSON API health check failed (HTTP $HEALTH_CODE)"
fi

echo

# Test query endpoint (expect 401)
echo "2. Testing Query Endpoint (expect 401 Unauthorized)..."
QUERY_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7575/v1/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":[]}')

if [ "$QUERY_CODE" = "401" ]; then
    echo "✅ Query endpoint working (401 = needs authentication)"
else
    echo "❌ Query endpoint returned HTTP $QUERY_CODE (expected 401)"
fi

echo

# Check if sandbox is responding
echo "3. Checking Sandbox Ledger..."
if lsof -i :6865 > /dev/null 2>&1; then
    echo "✅ Sandbox is running on port 6865"
else
    echo "❌ Sandbox NOT running on port 6865"
fi

echo

# Check JSON API
echo "4. Checking JSON API..."
if lsof -i :7575 > /dev/null 2>&1; then
    echo "✅ JSON API is running on port 7575"
else
    echo "❌ JSON API NOT running on port 7575"
fi

echo

# Test localhost vs 127.0.0.1
echo "5. Testing localhost vs 127.0.0.1..."
LOCALHOST_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7575/livez 2>/dev/null || echo "000")
IP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7575/livez 2>/dev/null || echo "000")

echo "   localhost:7575 -> HTTP $LOCALHOST_CODE"
echo "   127.0.0.1:7575 -> HTTP $IP_CODE"

if [ "$IP_CODE" = "200" ] && [ "$LOCALHOST_CODE" != "200" ]; then
    echo "✅ Use 127.0.0.1:7575 (not localhost:7575)"
elif [ "$IP_CODE" = "200" ] && [ "$LOCALHOST_CODE" = "200" ]; then
    echo "✅ Both addresses work, but prefer 127.0.0.1:7575"
else
    echo "❌ Neither address working properly"
fi

echo

# Show running DAML processes
echo "6. DAML Processes:"
ps aux | grep -E "(daml|canton)" | grep -v grep || echo "   No DAML processes found"

echo
echo "=== Summary ==="
if [ "$HEALTH_CODE" = "200" ] && [ "$QUERY_CODE" = "401" ]; then
    echo "✅ DAML services are working correctly!"
    echo "📝 Use this URL in your frontend: http://127.0.0.1:7575"
else
    echo "❌ DAML services need attention"
    echo "💡 Try: pkill -f daml && daml start"
fi
echo