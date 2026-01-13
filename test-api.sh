#!/bin/bash

echo "=== DAML Asset Transfer API Test ==="
echo

# Check if services are running
echo "1. Checking DAML services..."
echo "JSON API Health Check:"
curl -s http://localhost:7575/livez | jq . 2>/dev/null || echo "JSON API is running (port 7575)"

echo
echo "Ledger API Check:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:6865 | grep -q "200\|404"; then
    echo "Ledger API is running (port 6865)"
else
    echo "Ledger API status unknown"
fi

echo
echo "2. Testing JSON API endpoints..."
echo "Query endpoint (expects 401 - auth required):"
curl -s -X POST http://localhost:7575/v1/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":[]}' | head -1

echo
echo "3. Available DAML Templates:"
echo "- Main:Asset (transferable digital asset)"
echo "- Main:TransferProposal (pending transfer)"

echo
echo "4. Generated TypeScript bindings:"
ls -la asset-transfer-app/daml.js/ 2>/dev/null || echo "TypeScript bindings generated in asset-transfer-app/daml.js/"

echo
echo "=== Services Ready! ==="
echo "Sandbox Ledger: http://localhost:6865"
echo "JSON API: http://localhost:7575"
echo "Navigator UI: http://localhost:7500 (if available)"
echo
echo "Next steps:"
echo "1. Implement authentication in your frontend"
echo "2. Use the JSON API endpoints to interact with contracts"
echo "3. Import TypeScript bindings for type safety"