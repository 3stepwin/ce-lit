/**
 * ABSURDITY AI SKETCH MACHINE - PIPELINE DEBUGGER
 * Comprehensive diagnostics for the video generation pipeline
 */

const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTEzOTYyNywiZXhwIjoyMDgwNzE1NjI3fQ.2QAUHfp7xhmAIMSX8jCbr7Vk99ijSinC3ENox2B5ASk';

// Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function supabaseQuery(table, params = {}) {
    const { select = '*', limit, eq, order } = params;

    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;

    if (limit) url += `&limit=${limit}`;
    if (eq) {
        Object.entries(eq).forEach(([key, value]) => {
            url += `&${key}=eq.${value}`;
        });
    }
    if (order) {
        Object.entries(order).forEach(([key, desc]) => {
            url += `&order=${key}.${desc ? 'desc' : 'asc'}`;
        });
    }

    const response = await fetch(url, {
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Accept': 'application/json',
            'Prefer': 'count=exact'
        }
    });

    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : null;

    const data = await response.json();
    return { data, count, error: !response.ok ? data : null };
}

async function checkDatabaseSchema() {
    log('\n📊 DATABASE SCHEMA CHECK', 'cyan');
    log('='.repeat(50), 'cyan');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Accept': 'application/json'
        }
    });

    const schema = await response.json();
    const tables = Object.keys(schema.definitions || {});

    const requiredTables = [
        'celit_jobs',
        'sketches',
        'image_prompt_packets',
        'video_prompt_packets',
        'prompt_library'
    ];

    for (const table of requiredTables) {
        if (tables.includes(table)) {
            const columns = Object.keys(schema.definitions[table].properties || {});
            log(`✅ ${table} (${columns.length} columns)`, 'green');
        } else {
            log(`❌ ${table} - MISSING!`, 'red');
        }
    }

    log(`\nTotal tables: ${tables.length}`, 'bright');
}

async function checkPromptPackets() {
    log('\n📦 PROMPT PACKETS CHECK', 'cyan');
    log('='.repeat(50), 'cyan');

    const vectors = ['LIFE_VECTOR', 'WORK_VECTOR', 'FEED_VECTOR'];

    for (const vector of vectors) {
        log(`\n${vector}:`, 'magenta');

        // Image packets
        const { data: imgData, count: imgCount, error: imgError } = await supabaseQuery(
            'image_prompt_packets',
            { eq: { reality_vector: vector } }
        );

        if (imgError) {
            log(`  ❌ Image packets: ${imgError.message}`, 'red');
        } else {
            log(`  Image packets: ${imgCount || imgData.length}`, 'yellow');
            if (imgData.length > 0) {
                log(`    Sample: ${imgData[0].prompt_fragment?.substring(0, 60)}...`, 'bright');
            }
        }

        // Video packets
        const { data: vidData, count: vidCount, error: vidError } = await supabaseQuery(
            'video_prompt_packets',
            { eq: { reality_vector: vector } }
        );

        if (vidError) {
            log(`  ❌ Video packets: ${vidError.message}`, 'red');
        } else {
            log(`  Video packets: ${vidCount || vidData.length}`, 'yellow');
            if (vidData.length > 0) {
                log(`    Sample: ${vidData[0].prompt_fragment?.substring(0, 60)}...`, 'bright');
            }
        }
    }
}

async function checkLatestJobs(limit = 5) {
    log('\n🎬 LATEST JOBS', 'cyan');
    log('='.repeat(50), 'cyan');

    const { data: jobs, error } = await supabaseQuery('celit_jobs', {
        order: { created_at: true },
        limit
    });

    if (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return;
    }

    if (!jobs || jobs.length === 0) {
        log('ℹ️  No jobs found', 'yellow');
        return;
    }

    for (const job of jobs) {
        log(`\n──────────────────────────────────────`, 'bright');
        log(`Job ID: ${job.id}`, 'bright');
        log(`Created: ${new Date(job.created_at).toLocaleString()}`, 'bright');
        log(`Vector: ${job.reality_vector}`, 'magenta');

        const statusColor = {
            'pending': 'yellow',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red'
        }[job.status] || 'reset';
        log(`Status: ${job.status}`, statusColor);

        if (job.progress) {
            log(`Progress: ${job.progress}%`, 'cyan');
        }

        log(`Cinema Lane: ${job.cinema_lane ? '🎥 Higgsfield' : '⚡ Novita'}`, job.cinema_lane ? 'green' : 'blue');

        if (job.higgsfield_task_id) {
            log(`Higgsfield Task: ${job.higgsfield_task_id}`, 'cyan');
        }

        if (job.novita_task_id) {
            log(`Novita Task: ${job.novita_task_id}`, 'cyan');
        }

        if (job.video_url) {
            log(`✅ Video: ${job.video_url.substring(0, 60)}...`, 'green');
        }

        if (job.error_message) {
            log(`❌ Error: ${job.error_message}`, 'red');
        }
    }
}

async function checkEdgeFunctions() {
    log('\n⚡ EDGE FUNCTIONS CHECK', 'cyan');
    log('='.repeat(50), 'cyan');

    const functions = [
        'generate-sketch',
        'get-seed',
        'handle-novita-webhook'
    ];

    for (const func of functions) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/${func}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ test: true })
                }
            );

            const status = response.status;
            const color = status < 500 ? 'green' : 'red';
            const icon = status < 500 ? '✅' : '❌';

            log(`${icon} ${func}: HTTP ${status}`, color);

            if (status >= 400 && status < 500) {
                const text = await response.text();
                log(`   Response: ${text.substring(0, 100)}`, 'yellow');
            }
        } catch (err) {
            log(`❌ ${func}: ${err.message}`, 'red');
        }
    }
}

async function testSeedGeneration() {
    log('\n🧪 TESTING SEED GENERATION', 'cyan');
    log('='.repeat(50), 'cyan');

    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/get-seed`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reality_vector: 'LIFE_VECTOR' })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            log(`❌ Failed: ${error}`, 'red');
            return;
        }

        const data = await response.json();

        log('✅ Seed generated successfully!', 'green');
        log(`\nArchetype: ${data.archetype}`, 'yellow');
        log(`Quote: ${data.quote?.substring(0, 100)}...`, 'bright');
        log(`Verdict: ${data.verdict?.substring(0, 100)}...`, 'bright');

        if (data.image_prompt) {
            log(`Image Prompt: ${data.image_prompt.substring(0, 80)}...`, 'cyan');
        }
        if (data.video_prompt) {
            log(`Video Prompt: ${data.video_prompt.substring(0, 80)}...`, 'cyan');
        }
    } catch (err) {
        log(`❌ Error: ${err.message}`, 'red');
    }
}

async function checkPromptLibrary() {
    log('\n📚 PROMPT LIBRARY CHECK', 'cyan');
    log('='.repeat(50), 'cyan');

    const { data, count, error } = await supabaseQuery('prompt_library');

    if (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return;
    }

    log(`Total prompts: ${count || data.length}`, 'bright');

    const types = {};
    const vectors = {};

    data.forEach(prompt => {
        types[prompt.type] = (types[prompt.type] || 0) + 1;
        vectors[prompt.reality_vector] = (vectors[prompt.reality_vector] || 0) + 1;
    });

    log('\nBy Type:', 'yellow');
    Object.entries(types).forEach(([type, count]) => {
        log(`  ${type}: ${count}`, 'bright');
    });

    log('\nBy Reality Vector:', 'yellow');
    Object.entries(vectors).forEach(([vector, count]) => {
        log(`  ${vector}: ${count}`, 'bright');
    });
}

async function runFullDiagnostics() {
    log('\n🔍 ABSURDITY PIPELINE DEBUGGER', 'cyan');
    log('='.repeat(50) + '\n', 'cyan');

    await checkDatabaseSchema();
    await checkPromptLibrary();
    await checkPromptPackets();
    await checkLatestJobs(5);
    await checkEdgeFunctions();
    await testSeedGeneration();

    log('\n' + '='.repeat(50), 'cyan');
    log('✅ DIAGNOSTICS COMPLETE', 'green');
    log('='.repeat(50) + '\n', 'cyan');
}

// Run diagnostics
runFullDiagnostics().catch((err) => {
    log(`\n❌ FATAL ERROR: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
