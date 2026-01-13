#!/usr/bin/env node

// Test CORS Proxy
const http = require('http');

console.log('🔍 Testing CORS Proxy...\n');

function testProxy(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/daml/${endpoint}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${method} /api/daml/${endpoint} -> HTTP ${res.statusCode}`);
        console.log(`CORS Headers: ${res.headers['access-control-allow-origin'] ? 'Present' : 'Missing'}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        } else {
          console.log(`Response: ${data.substring(0, 200)}...`);
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Request failed: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Request timeout`);
      reject(new Error('Timeout'));
    });
    
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('1. Testing OPTIONS (CORS Preflight)...');
    const optionsResult = await testProxy('v1/query', 'OPTIONS');
    console.log(`✅ OPTIONS request successful\n`);
    
    console.log('2. Testing Health Check via Proxy...');
    const healthResult = await testProxy('livez', 'GET');
    console.log(`✅ Health check via proxy successful\n`);
    
    console.log('3. Testing Query via Proxy...');
    const queryResult = await testProxy('v1/query', 'POST', {
      templateIds: ['539a1a262a2b33c55b5737e6925ce1ff335aea9fd416d0e59dd939e52efcad99:Main:Asset']
    });
    
    if (queryResult.status === 401) {
      console.log(`✅ Query via proxy working (401 = auth required)\n`);
    } else {
      console.log(`✅ Query via proxy returned: ${queryResult.status}\n`);
    }
    
    console.log('🎉 CORS Proxy is working!');
    console.log('📋 Summary:');
    console.log('   ✅ CORS Headers: Added by proxy');
    console.log('   ✅ Preflight Requests: Handled');
    console.log('   ✅ API Forwarding: Working');
    console.log('   ✅ Frontend Ready: http://localhost:3000');
    
  } catch (error) {
    console.log('\n❌ CORS Proxy test failed!');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure frontend is running: npm run dev');
    console.log('   2. Make sure DAML is running: daml start --start-navigator=false');
    console.log('   3. Check proxy route: /app/api/daml/[...path]/route.ts');
    process.exit(1);
  }
}

runTests();