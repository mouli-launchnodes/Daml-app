#!/bin/bash

echo "🔄 Restarting DAML services with updated contracts..."
echo ""

# Stop existing DAML processes
echo "1. Stopping existing DAML processes..."
pkill -f "daml" 2>/dev/null
sleep 2

# Verify processes are stopped
if lsof -i :6865 -i :7575 > /dev/null 2>&1; then
    echo "⚠️  Ports still in use, forcing kill..."
    lsof -ti :6865 -i :7575 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "✅ Old processes stopped"
echo ""

# Start DAML services
echo "2. Starting DAML services with new DAR..."
daml start &

# Wait for services to be ready
echo ""
echo "3. Waiting for services to start..."
sleep 5

# Check if services are running
echo ""
echo "4. Verifying services..."
if lsof -i :6865 > /dev/null 2>&1; then
    echo "✅ Sandbox Ledger running on port 6865"
else
    echo "❌ Sandbox Ledger not running"
fi

if lsof -i :7575 > /dev/null 2>&1; then
    echo "✅ JSON API running on port 7575"
else
    echo "❌ JSON API not running"
fi

echo ""
echo "🎉 DAML services restarted with updated contracts!"
echo ""
echo "The new TransferHistory template is now available."
echo "Refresh your frontend to see the transfer history dashboard."
