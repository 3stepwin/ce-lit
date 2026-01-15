
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

const FUNCTIONS = [
    {
        name: 'generate-sketch (Novita)',
        realName: 'generate-sketch',
        method: 'POST',
        testPayload: { type: 'celit_viral', reality_vectors: ['WORK_VECTOR'], cinema_lane: false },
        critical: true
    },
    {
        name: 'generate-sketch (Higgsfield)',
        realName: 'generate-sketch',
        method: 'POST',
        testPayload: { type: 'celit_viral', reality_vectors: ['WORK_VECTOR'], cinema_lane: true },
        critical: true
    },
    {
        name: 'generate-cult-scene',
        method: 'POST',
        testPayload: { topic: 'Health check test', user_id: '00000000-0000-0000-0000-000000000000' },
        critical: true
    },
    {
        name: 'get-seed',
        method: 'POST',
        testPayload: { category: 'work' },
        critical: true
    },
    {
        name: 'handle-novita-webhook',
        method: 'POST',
        testPayload: null,
        critical: true,
        skipTest: true
    },
    {
        name: 'handle-cult-webhook',
        method: 'POST',
        testPayload: null,
        critical: true,
        skipTest: true
    },
    {
        name: 'process-cult-assets',
        method: 'POST',
        testPayload: {},
        critical: true,
        skipTest: false // Testing with empty payload
    },
    {
        name: 'generate-cult-audio',
        method: 'POST',
        testPayload: { script_id: '00000000-0000-0000-0000-000000000000' }, // Use dummy UUID to trigger 404/not found instead of 500 parse error
        critical: false,
        skipTest: false
    },
    {
        name: 'exec-sql',
        method: 'POST',
        testPayload: null,
        critical: false,
        skipTest: true
    },
    {
        name: 'higgsfield-poller',
        method: 'POST',
        testPayload: { job_id: "test", status_url: "https://platform.higgsfield.ai/status/test" },
        critical: true,
        skipTest: true // Skip actual polling in health check as it's a long running process
    },
    {
        name: 'novita-webhook',
        method: 'POST',
        testPayload: null,
        critical: true,
        skipTest: true
    }
];

async function checkFunctionHealth(fn) {
    const url = `${SUPABASE_URL}/functions/v1/${fn.realName || fn.name}`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Checking: ${fn.name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Critical: ${fn.critical ? '⚠️  YES' : '✅ NO'}`);

    if (fn.skipTest) {
        console.log(`   Status: ⏭️  SKIPPED (webhook/background function)`);
        return { name: fn.name, status: 'SKIPPED', critical: fn.critical };
    }

    try {
        const startTime = Date.now();
        const res = await fetch(url, {
            method: fn.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
                'apikey': ANON_KEY
            },
            body: fn.testPayload ? JSON.stringify(fn.testPayload) : undefined
        });

        const duration = Date.now() - startTime;
        const responseText = await res.text();

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        console.log(`   Response Time: ${duration}ms`);
        console.log(`   HTTP Status: ${res.status}`);

        if (res.ok || res.status === 200) {
            console.log(`   ✅ SUCCESS`);
            console.log(`   Response:`, JSON.stringify(responseData, null, 2));
            return { name: fn.name, status: 'OK', duration, critical: fn.critical };
        } else {
            // For Higgsfield poller, a 400 status is actually a SUCCESS (it reached the function, validated input, and failed logic).
            // A 500 would be a code crash.
            // A 404 would be router missing.

            console.log(`   ❌ ERROR: ${res.status}`);
            console.log(`   Details:`, JSON.stringify(responseData, null, 2).slice(0, 300));
            return { name: fn.name, status: 'ERROR', error: responseData, critical: fn.critical };
        }
    } catch (error) {
        console.log(`   ❌ FATAL ERROR: ${error.message}`);
        return { name: fn.name, status: 'FATAL', error: error.message, critical: fn.critical };
    }
}

async function checkAllFunctions() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        SUPABASE EDGE FUNCTIONS HEALTH CHECK                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nProject: ebostxmvyocypwqpgzct`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Total Functions: ${FUNCTIONS.length}\n`);

    const results = [];

    for (const fn of FUNCTIONS) {
        const result = await checkFunctionHealth(fn);
        results.push(result);
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting
    }

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY REPORT                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const ok = results.filter(r => r.status === 'OK');
    const errors = results.filter(r => r.status === 'ERROR');
    const fatal = results.filter(r => r.status === 'FATAL');
    const skipped = results.filter(r => r.status === 'SKIPPED');
    const criticalErrors = results.filter(r => r.critical && (r.status === 'ERROR' || r.status === 'FATAL'));

    console.log(`✅ OK:       ${ok.length}`);
    console.log(`⏭️  SKIPPED:  ${skipped.length}`);
    console.log(`❌ ERRORS:   ${errors.length}`);
    console.log(`💀 FATAL:    ${fatal.length}`);
    console.log(`⚠️  CRITICAL ERRORS: ${criticalErrors.length}\n`);

    if (criticalErrors.length > 0) {
        console.log('⚠️  CRITICAL ISSUES DETECTED:\n');
        criticalErrors.forEach(r => {
            console.log(`   🔥 ${r.name}`);
            console.log(`      Error: ${JSON.stringify(r.error).slice(0, 150)}\n`);
        });
    }

    if (errors.length > 0 && criticalErrors.length === 0) {
        console.log('⚠️  NON-CRITICAL ISSUES:\n');
        errors.forEach(r => {
            console.log(`   ⚠️  ${r.name}`);
            console.log(`      Error: ${JSON.stringify(r.error).slice(0, 150)}\n`);
        });
    }

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  DETAILED RESULTS                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    results.forEach(r => {
        const icon = r.status === 'OK' ? '✅' :
            r.status === 'SKIPPED' ? '⏭️' :
                r.status === 'ERROR' ? '❌' : '💀';
        const critical = r.critical ? ' [CRITICAL]' : '';
        console.log(`${icon} ${r.name}${critical} - ${r.status}`);
    });

    console.log('\n');

    if (criticalErrors.length === 0 && errors.length === 0) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!\n');
        return 0;
    } else if (criticalErrors.length > 0) {
        console.log('🚨 CRITICAL ERRORS DETECTED - IMMEDIATE ACTION REQUIRED!\n');
        return 2;
    } else {
        console.log('⚠️  SOME ISSUES DETECTED - REVIEW RECOMMENDED\n');
        return 1;
    }
}

checkAllFunctions().then(exitCode => {
    process.exit(exitCode);
}).catch(err => {
    console.error('Fatal script error:', err);
    process.exit(3);
});
