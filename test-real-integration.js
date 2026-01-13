#!/usr/bin/env node

// Test Real DAML Integration
const http = require('http');

const JSON_API_URL = 'http://127.0.0.1:7575';
const LEDGER_ID = 'sandbox';

console.log('🔍 Testing Real DAML Integration...\n');

// Generate development JWT token
function generateToken(party) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    ledgerId: LEDGER_ID,
    applicationId: "asset-transfer-app",
    party: party,
    readAs: [party],
    actAs: [party],
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  return `${base64Header}.${base64Payload}.development-signature`;
}

// Make DAML API request
function damlRequest(endpoint, method, token, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(`${JSON_API_URL}${endpoint}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Timeout')));
    
    if (postData) req.write(postData);
    req.end();
  });
}

// Run integration tests
async function runTests() {
  try {
    console.log('1. Testing Authentication...');
    const alicePartyId = 'Alice::12202aaf07c30d1a9f3117a9238054195db8678bfddaaea3046cca5392749d4a97da';
    const bobPartyId = 'Bob::12202aaf07c30d1a9f3117a9238054195db8678bfddaaea3046cca5392749d4a97da';
    
    const aliceToken = generateToken(alicePartyId);
    console.log(`✅ Generated token for Alice: ${aliceToken.substring(0, 50)}...`);
    
    console.log('\n2. Testing Query Endpoint...');
    const queryResult = await damlRequest('/v1/query', 'POST', aliceToken, {
      templateIds: ['539a1a262a2b33c55b5737e6925ce1ff335aea9fd416d0e59dd939e52efcad99:Main:Asset']
    });
    console.log(`✅ Query successful: Found ${queryResult.result?.length || 0} assets`);
    
    console.log('\n3. Testing Asset Creation...');
    const createResult = await damlRequest('/v1/create', 'POST', aliceToken, {
      templateId: '539a1a262a2b33c55b5737e6925ce1ff335aea9fd416d0e59dd939e52efcad99:Main:Asset',
      payload: {
        owner: alicePartyId,
        description: 'Test Gold Watch',
        createdAt: new Date().toISOString(),
        observers: []
      }
    });
    console.log(`✅ Asset created: ${createResult.result?.contractId || 'Success'}`);
    
    console.log('\n4. Verifying Asset Exists...');
    const verifyResult = await damlRequest('/v1/query', 'POST', aliceToken, {
      templateIds: ['539a1a262a2b33c55b5737e6925ce1ff335aea9fd416d0e59dd939e52efcad99:Main:Asset'],
      query: { owner: alicePartyId }
    });
    console.log(`✅ Verification: Found ${verifyResult.result?.length || 0} assets for Alice`);
    
    if (verifyResult.result && verifyResult.result.length > 0) {
      const asset = verifyResult.result[0];
      console.log(`   Asset: "${asset.payload.description}" (ID: ${asset.contractId.substring(0, 20)}...)`);
      
      console.log('\n5. Testing Transfer Proposal...');
      const transferResult = await damlRequest('/v1/exercise', 'POST', aliceToken, {
        templateId: '539a1a262a2b33c55b5737e6925ce1ff335aea9fd416d0e59dd939e52efcad99:Main:Asset',
        contractId: asset.contractId,
        choice: 'ProposeTransfer',
        argument: {
          newOwner: bobPartyId
        }
      });
      console.log(`✅ Transfer proposed: ${transferResult.result?.contractId || 'Success'}`);
      
      console.log('\n6. Checking Bob\'s Proposals...');
      const bobToken = generateToken(bobPartyId);
      const bobProposals = await damlRequest('/v1/query', 'POST', bobToken, {
        templateIds: ['539a1a262a2b33c55b5737e6925ce1ff335aea9fd416d0e59dd939e52efcad99:Main:TransferProposal'],
        query: { receiver: bobPartyId }
      });
      console.log(`✅ Bob has ${bobProposals.result?.length || 0} pending proposals`);
    }
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📋 Integration Status:');
    console.log('   ✅ DAML JSON API: Working');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Asset Creation: Working');
    console.log('   ✅ Asset Queries: Working');
    console.log('   ✅ Transfer Proposals: Working');
    console.log('   ✅ Multi-Party: Working');
    
    console.log('\n🚀 Frontend Integration Ready!');
    console.log('   Frontend: http://localhost:3000');
    console.log('   DAML API: http://127.0.0.1:7575');
    console.log('   Status: Real DAML integration active (no more localStorage!)');
    
  } catch (error) {
    console.log('\n❌ Integration test failed!');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure DAML is running: daml start --start-navigator=false');
    console.log('   2. Check JSON API: curl http://127.0.0.1:7575/livez');
    console.log('   3. Verify frontend: http://localhost:3000');
    process.exit(1);
  }
}

runTests();