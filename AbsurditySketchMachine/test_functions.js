// Test all Edge Functions for deployment and basic functionality
require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FUNCTIONS_TO_TEST = [
    { name: 'generate-sketch', method: 'POST', requiresAuth: true, critical: true },
    { name: 'get-seed', method: 'POST', requiresAuth: false, critical: true },
    { name: 'handle-novita-webhook', method: 'POST', requiresAuth: false, critical: true },
    { name: 'create-face-model', method: 'POST', requiresAuth: true, critical: false },
    { name: 'generate-scene', method: 'POST', requiresAuth: true, critical: false },
    { name: 'process-assets', method: 'POST', requiresAuth: false, critical: false },
];

function testFunction(funcName, method = 'POST') {
    return new Promise((resolve) => {
        const url = `${SUPABASE_URL}/functions/v1/${funcName}`;
        const urlObj = new URL(url);

        const options = {
            method: method,
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const status = res.statusCode;
                // 200-299 = success, 400-499 = expected validation errors (means function is running)
                const isWorking = status < 500;
                resolve({
                    name: funcName,
                    status: status,
                    working: isWorking,
                    response: data.substring(0, 200)
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                name: funcName,
                status: 0,
                working: false,
                error: err.message
            });
        });

        // Send minimal valid payload
        if (method === 'POST') {
            req.write(JSON.stringify({}));
        }
        req.end();

        // Timeout after 10 seconds
        setTimeout(() => {
            req.destroy();
            resolve({
                name: funcName,
                status: 0,
                working: false,
                error: 'Timeout'
            });
        }, 10000);
    });
}

async function runTests() {
    console.log('🧪 TESTING SUPABASE EDGE FUNCTIONS\n');
    console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
    console.log(`📍 Testing ${FUNCTIONS_TO_TEST.length} functions...\n`);

    const results = [];

    for (const func of FUNCTIONS_TO_TEST) {
        process.stdout.write(`Testing ${func.name}... `);
        const result = await testFunction(func.name, func.method);
        results.push({ ...result, critical: func.critical });

        if (result.working) {
            console.log(`✅ WORKING (${result.status})`);
        } else {
            console.log(`❌ FAILED (${result.error || result.status})`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const working = results.filter(r => r.working);
    const failed = results.filter(r => !r.working);
    const criticalFailed = failed.filter(r => r.critical);

    console.log(`\n✅ Working: ${working.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);

    if (criticalFailed.length > 0) {
        console.log(`\n🚨 CRITICAL FUNCTIONS FAILED:`);
        criticalFailed.forEach(f => {
            console.log(`   - ${f.name}: ${f.error || f.status}`);
        });
    }

    console.log('\n📋 Detailed Results:');
    results.forEach(r => {
        const icon = r.working ? '✅' : '❌';
        const critical = r.critical ? '[CRITICAL]' : '[OPTIONAL]';
        console.log(`${icon} ${r.name.padEnd(30)} ${critical.padEnd(12)} Status: ${r.status || 'ERROR'}`);
    });

    if (criticalFailed.length > 0) {
        console.log('\n❌ DEPLOYMENT INCOMPLETE - Critical functions are not working');
        process.exit(1);
    } else if (failed.length > 0) {
        console.log('\n⚠️  PARTIAL DEPLOYMENT - Some optional functions failed');
    } else {
        console.log('\n✅ ALL FUNCTIONS OPERATIONAL');
    }
}

runTests().catch(console.error);
