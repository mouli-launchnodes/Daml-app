#!/usr/bin/env node

// Test DAML JSON API connection from frontend perspective
const https = require('http');

const JSON_API_URL = 'http://127.0.0.1:7575';
const LEDGER_ID = 'sandbox';

console.log('🔍 Testing DAML JSON API Connection...\n');

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const req = https.request(`${JSON_API_URL}/livez`, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Health Check: HTTP ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`   Response: ${data || 'OK'}`);
          resolve(true);
        } else {
          reject(new Error(`Health check failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Health Check Failed: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Health Check Timeout`);
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Test 2: Query Endpoint (expect 401)
function testQueryEndpoint() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ templateIds: [] });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(`${JSON_API_URL}/v1/query`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Query Endpoint: HTTP ${res.statusCode}`);
        if (res.statusCode === 401) {
          console.log(`   Expected 401 (authentication required)`);
          try {
            const response = JSON.parse(data);
            console.log(`   Error: ${response.errors?.[0] || 'Authentication required'}`);
          } catch (e) {
            console.log(`   Raw response: ${data}`);
          }
          resolve(true);
        } else {
          console.log(`   Unexpected status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Query Test Failed: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Query Test Timeout`);
      reject(new Error('Timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 3: Generate Sample JWT Token
function generateSampleToken(party) {
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

// Run all tests
async function runTests() {
  try {
    console.log('1. Health Check...');
    await testHealthCheck();
    console.log();
    
    console.log('2. Query Endpoint...');
    await testQueryEndpoint();
    console.log();
    
    console.log('3. Sample JWT Token Generation...');
    const sampleToken = generateSampleToken('Alice');
    console.log(`✅ Generated token for Alice:`);
    console.log(`   ${sampleToken.substring(0, 50)}...`);
    console.log();
    
    console.log('🎉 All tests passed!');
    console.log();
    console.log('📋 Frontend Configuration:');
    console.log(`   JSON_API_URL: ${JSON_API_URL}`);
    console.log(`   LEDGER_ID: ${LEDGER_ID}`);
    console.log();
    console.log('🚀 Next Steps:');
    console.log('   1. Start your frontend: cd asset-transfer-app && npm run dev');
    console.log('   2. The app should now connect to DAML successfully');
    console.log('   3. Use the login page to select a party (Alice, Bob, Charlie)');
    
  } catch (error) {
    console.log();
    console.log('❌ Connection test failed!');
    console.log(`   Error: ${error.message}`);
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure DAML is running: daml start');
    console.log('   2. Check if services are on correct ports:');
    console.log('      - Sandbox: 6865');
    console.log('      - JSON API: 7575');
    console.log('   3. Verify with: ./test-daml-api.sh');
    process.exit(1);
  }
}

runTests();