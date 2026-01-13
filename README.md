# DAML Asset Transfer Application

A complete DAML smart contract application for transferring digital assets between parties with a proposal-based workflow.

## 🏗️ Architecture

### Smart Contracts (DAML)
- **Asset Template**: Represents transferable digital assets
- **TransferProposal Template**: Manages pending transfers with accept/reject/cancel options

### Infrastructure
- **Sandbox Ledger**: In-memory DAML ledger (port 6865)
- **JSON API**: REST/WebSocket interface (port 7575)
- **TypeScript Bindings**: Type-safe contract interactions

## 📋 Project Status

✅ **Completed:**
- DAML contracts implemented (`daml/Main.daml`)
- 5 comprehensive test scenarios (`daml/Test.daml`)
- All tests passing
- TypeScript bindings generated
- DAML services running and verified

## 🚀 Quick Start

### 1. Build & Test Contracts
```bash
# Build DAML contracts
daml build

# Run all tests
daml test
```

### 2. Start DAML Infrastructure
```bash
# Start sandbox ledger and JSON API
daml start
```

### 3. Verify Services
```bash
# Check service health
./test-api.sh
```

## 📊 Contract Templates

### Asset Template
```haskell
template Asset
  with
    owner: Party           -- Current owner (signatory)
    description: Text      -- Asset description
    createdAt: Time       -- Creation timestamp
    observers: [Party]    -- Read-only viewers
```

**Choices:**
- `ProposeTransfer` - Owner proposes transfer to another party

### TransferProposal Template
```haskell
template TransferProposal
  with
    asset: Asset          -- The asset being transferred
    sender: Party         -- Original owner
    receiver: Party       -- Proposed new owner
    proposedAt: Time     -- Proposal timestamp
```

**Choices:**
- `Accept` - Receiver accepts, asset transfers
- `Reject` - Receiver rejects, asset returns to sender
- `Cancel` - Sender cancels before acceptance

## 🔄 Transfer Workflow

```
┌─────────────┐
│   Asset     │
│ owner=Alice │
└──────┬──────┘
       │
       │ Alice: ProposeTransfer(Bob)
       ▼
┌──────────────────┐
│ TransferProposal │
│ sender=Alice     │
│ receiver=Bob     │
└────┬─────────┬───┘
     │         │
Bob: │Accept   │Reject
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│  Asset  │ │  Asset  │
│owner=Bob│ │owner=Alice│
└─────────┘ └─────────┘
```

## 🧪 Test Coverage

All 5 test scenarios pass:
1. **Successful Transfer** - Complete transfer workflow
2. **Rejected Transfer** - Asset returns to sender
3. **Cancelled Proposal** - Sender cancels before acceptance
4. **Self-Transfer Prevention** - Cannot transfer to yourself
5. **Multi-Party Chain** - Alice → Bob → Charlie

## 🌐 API Endpoints

### Query Active Contracts
```bash
POST http://localhost:7575/v1/query
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "templateIds": ["Main:Asset"],
  "query": {
    "owner": "Alice"
  }
}
```

### Create Asset
```bash
POST http://localhost:7575/v1/create
Authorization: Bearer <JWT_TOKEN>

{
  "templateId": "Main:Asset",
  "payload": {
    "owner": "Alice",
    "description": "Diamond Ring",
    "createdAt": "2026-01-13T10:00:00Z",
    "observers": []
  }
}
```

### Exercise Choice
```bash
POST http://localhost:7575/v1/exercise
Authorization: Bearer <JWT_TOKEN>

{
  "templateId": "Main:Asset",
  "contractId": "<CONTRACT_ID>",
  "choice": "ProposeTransfer",
  "argument": {
    "newOwner": "Bob"
  }
}
```

### WebSocket Stream (Real-time)
```javascript
ws://localhost:7575/v1/stream/query
// Subscribe to Asset changes for real-time UI updates
```

## 📦 TypeScript Integration

Generated bindings available at:
```
asset-transfer-app/daml.js/asset-transfer-app-1.0.0/lib/Main/
```

**Usage Example:**
```typescript
import { Asset, TransferProposal } from './daml.js/asset-transfer-app-1.0.0/lib/Main';

// Type-safe contract interactions
const asset: Asset = {
  owner: "Alice",
  description: "Gold Watch",
  createdAt: new Date().toISOString(),
  observers: []
};
```

## 🔧 Development Workflow

### Terminal 1: DAML Infrastructure
```bash
daml start
```

### Terminal 2: Frontend Development
```bash
cd asset-transfer-app
npm run dev  # Your custom UI
```

### Terminal 3: Contract Development
```bash
# Make changes to daml/Main.daml
daml build && daml test
```

## 📁 Project Structure

```
├── daml.yaml                    # DAML project configuration
├── daml/
│   ├── Main.daml               # Asset & TransferProposal templates
│   └── Test.daml               # Comprehensive test scenarios
├── .daml/
│   └── dist/
│       └── asset-transfer-app-1.0.0.dar  # Compiled contracts
├── asset-transfer-app/
│   ├── daml.js/                # Generated TypeScript bindings
│   └── ...                     # Your frontend application
└── test-api.sh                 # Service verification script
```

## 🔧 Troubleshooting

### Common Issue: Connection Failed

**Problem:** Frontend shows connection errors or 404 responses.

**Solution:** DAML JSON API binds to `127.0.0.1` (not `localhost`) by default.

**Quick Fix:**
```bash
# Test the correct endpoint
curl http://127.0.0.1:7575/livez

# Run comprehensive connection test
node test-frontend-connection.js

# Verify all services
./test-daml-api.sh
```

**Frontend Configuration:**
- ✅ Use: `http://127.0.0.1:7575`
- ❌ Don't use: `http://localhost:7575`

## 🎯 Next Steps

1. **Authentication**: Implement JWT-based auth for JSON API
2. **Frontend Integration**: Connect your UI to the JSON API
3. **Real-time Updates**: Use WebSocket streams for live contract updates
4. **Party Management**: Implement user registration and party allocation
5. **Advanced Features**: Add asset metadata, transfer history, etc.

## 🔗 Service URLs

- **Sandbox Ledger**: http://localhost:6865
- **JSON API**: http://localhost:7575
- **Navigator UI**: http://localhost:7500 (if available)

## ✅ Verification

Run the test script to verify everything is working:
```bash
./test-api.sh
```

The DAML asset transfer application is now fully implemented and ready for frontend integration!# Daml-app
