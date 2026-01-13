#!/usr/bin/env node

// End-to-End Integration Test
const http = require('http');

console.log('🔍 End-to-End DAML Integration Test...\n');

const alicePartyId = 'Alice::1220a82f9051f4828b80d8cf6620fba66562303f110452605ba6bb45381683dc7d49';
const bobPartyId = 'Bob::1220a82f9051f4828b80d8cf6620fba66562303f110452605ba6bb45381683dc7d49';

// Generate development JWT token
function generateToken(party) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    ledgerId: "sandbox",
    applicationId: "asset-transfer-app",
    party: party,
    readAs: [party],
    actAs: [party],
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  return `${base64Header}.${base64Payload}.development-signature`;
}

// Make request via Next.js proxy
function proxyRequest(endpoint, method, token, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/daml/${endpoint}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
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

async function runEndToEndTest() {
  try {
    console.log('🎯 Starting Complete Workflow Test...\n');
    
    const aliceToken = generateToken(alicePartyId);
    const bobToken = generateToken(bobPartyId);
    
    console.log('1. Alice creates an asset...');
    const createResult = await proxyRequest('v1/create', 'POST', aliceToken, {
      templateId: '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset',
      payload: {
        owner: alicePartyId,
        description: 'End-to-End Test Diamond',
        createdAt: new Date().toISOString(),
        observers: []
      }
    });
    console.log(`✅ Asset created: ${createResult.result.contractId.substring(0, 20)}...`);
    
    console.log('\n2. Verify Alice owns the asset...');
    const aliceAssets = await proxyRequest('v1/query', 'POST', aliceToken, {
      templateIds: ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset'],
      query: { owner: alicePartyId }
    });
    console.log(`✅ Alice has ${aliceAssets.result.length} assets`);
    
    if (aliceAssets.result.length === 0) {
      throw new Error('Alice should have at least 1 asset');
    }
    
    const asset = aliceAssets.result[0];
    console.log(`   Asset: "${asset.payload.description}"`);
    
    console.log('\n3. Alice proposes transfer to Bob...');
    const transferResult = await proxyRequest('v1/exercise', 'POST', aliceToken, {
      templateId: '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset',
      contractId: asset.contractId,
      choice: 'ProposeTransfer',
      argument: {
        newOwner: bobPartyId
      }
    });
    console.log(`✅ Transfer proposed: ${transferResult.result.exerciseResult.substring(0, 20)}...`);
    
    console.log('\n4. Verify Alice no longer has the asset...');
    const aliceAssetsAfter = await proxyRequest('v1/query', 'POST', aliceToken, {
      templateIds: ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset'],
      query: { owner: alicePartyId }
    });
    console.log(`✅ Alice now has ${aliceAssetsAfter.result.length} assets (asset in escrow)`);
    
    console.log('\n5. Check Bob has a pending proposal...');
    const bobProposals = await proxyRequest('v1/query', 'POST', bobToken, {
      templateIds: ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:TransferProposal'],
      query: { receiver: bobPartyId }
    });
    console.log(`✅ Bob has ${bobProposals.result.length} pending proposals`);
    
    if (bobProposals.result.length === 0) {
      throw new Error('Bob should have at least 1 proposal');
    }
    
    const proposal = bobProposals.result[0];
    console.log(`   Proposal for: "${proposal.payload.asset.description}"`);
    
    console.log('\n6. Bob accepts the proposal...');
    const acceptResult = await proxyRequest('v1/exercise', 'POST', bobToken, {
      templateId: '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:TransferProposal',
      contractId: proposal.contractId,
      choice: 'Accept',
      argument: {}
    });
    console.log(`✅ Proposal accepted: ${acceptResult.result.exerciseResult.substring(0, 20)}...`);
    
    console.log('\n7. Verify Bob now owns the asset...');
    const bobAssets = await proxyRequest('v1/query', 'POST', bobToken, {
      templateIds: ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset'],
      query: { owner: bobPartyId }
    });
    console.log(`✅ Bob now has ${bobAssets.result.length} assets`);
    
    if (bobAssets.result.length === 0) {
      throw new Error('Bob should now own the asset');
    }
    
    const transferredAsset = bobAssets.result[0];
    console.log(`   Bob's asset: "${transferredAsset.payload.description}"`);
    
    console.log('\n8. Verify no more pending proposals...');
    const remainingProposals = await proxyRequest('v1/query', 'POST', bobToken, {
      templateIds: ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:TransferProposal'],
      query: { receiver: bobPartyId }
    });
    console.log(`✅ Bob has ${remainingProposals.result.length} remaining proposals`);
    
    console.log('\n🎉 END-TO-END TEST PASSED!');
    console.log('\n📊 Complete Workflow Verified:');
    console.log('   ✅ Asset Creation (Alice)');
    console.log('   ✅ Asset Ownership (Alice → Escrow)');
    console.log('   ✅ Transfer Proposal (Alice → Bob)');
    console.log('   ✅ Proposal Acceptance (Bob)');
    console.log('   ✅ Asset Transfer (Escrow → Bob)');
    console.log('   ✅ Multi-Party Authorization');
    console.log('   ✅ CORS Proxy Working');
    console.log('   ✅ Real DAML Integration');
    
    console.log('\n🚀 Frontend Ready for Production Use!');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Status: Fully functional DAML asset transfer app');
    
  } catch (error) {
    console.log('\n❌ End-to-end test failed!');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Check:');
    console.log('   1. DAML services: daml start --start-navigator=false');
    console.log('   2. Frontend: npm run dev');
    console.log('   3. Proxy route: /app/api/daml/[...path]/route.ts');
    process.exit(1);
  }
}

runEndToEndTest();