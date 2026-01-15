const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

const TABLES_TO_CHECK = [
    'profiles',
    'user_avatars',
    'sketches',
    'cached_videos',
    'shots',
    'celit_jobs',
    'image_prompt_packets',
    'video_prompt_packets',
    'viral_seed_bank',
    'scene_templates',
    'seed_usage',
    'scripts',
    'prompt_library'
];

async function checkTable(tableName) {
    try {
        // Get count
        const countUrl = `${SUPABASE_URL}/rest/v1/${tableName}?select=count`;
        const countRes = await fetch(countUrl, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Prefer': 'count=exact'
            }
        });

        const countHeader = countRes.headers.get('content-range');
        const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;

        // Get sample record
        const sampleUrl = `${SUPABASE_URL}/rest/v1/${tableName}?limit=1`;
        const sampleRes = await fetch(sampleUrl, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        const sample = await sampleRes.json();

        return {
            table: tableName,
            exists: countRes.status !== 404,
            count: count,
            sample: sample[0] || null,
            columns: sample[0] ? Object.keys(sample[0]) : []
        };
    } catch (error) {
        return {
            table: tableName,
            exists: false,
            error: error.message
        };
    }
}

async function auditDatabase() {
    console.log('🔍 SUPABASE DATABASE AUDIT\n');
    console.log('═'.repeat(80));

    const results = [];

    for (const table of TABLES_TO_CHECK) {
        const result = await checkTable(table);
        results.push(result);

        if (result.exists) {
            console.log(`\n✅ ${table.toUpperCase()}`);
            console.log(`   Records: ${result.count}`);
            console.log(`   Columns: ${result.columns.join(', ')}`);
            if (result.sample) {
                console.log(`   Sample:`, JSON.stringify(result.sample, null, 2).substring(0, 200));
            }
        } else {
            console.log(`\n❌ ${table.toUpperCase()} - NOT FOUND`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 SUMMARY\n');

    const existing = results.filter(r => r.exists);
    const populated = existing.filter(r => r.count > 0);
    const empty = existing.filter(r => r.count === 0);

    console.log(`Total Tables Checked: ${TABLES_TO_CHECK.length}`);
    console.log(`✅ Existing: ${existing.length}`);
    console.log(`📦 Populated: ${populated.length}`);
    console.log(`📭 Empty: ${empty.length}`);
    console.log(`❌ Missing: ${TABLES_TO_CHECK.length - existing.length}`);

    console.log('\n📦 POPULATED TABLES:');
    populated.forEach(r => {
        console.log(`   - ${r.table}: ${r.count} records`);
    });

    if (empty.length > 0) {
        console.log('\n📭 EMPTY TABLES (Available but unused):');
        empty.forEach(r => {
            console.log(`   - ${r.table}`);
        });
    }
}

auditDatabase().catch(console.error);
