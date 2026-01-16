// Simple schema checker - query actual table structures
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 CHECKING ACTUAL vs EXPECTED TABLES\n');
console.log('=' + '='.repeat(70) + '\n');

const expectedTables = [
    // Core production tables
    'sketches',
    'celit_jobs',
    'prompt_library',
    'scripts',
    'shots',

    // Seed system tables
    'viral_seed_bank',
    'scene_templates',
    'seed_usage',

    // Vessel system tables
    'character_vessels',
    'user_vessels',
    'vessels',

    // Packet tables
    'image_packets',
    'video_packets',
    'image_prompt_packets',
    'video_prompt_packets',

    // Other referenced tables
    'profiles',
    'user_avatars',
    'sketch_videos',

    // OLD table names (may be deprecated)
    'celit_premises',
    'celit_scene_bank',
    'celit_seed_runs',
];

async function checkTable(tableName) {
    try {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
                return { exists: false, count: null, error: 'Table does not exist' };
            }
            return { exists: false, count: null, error: error.message };
        }

        return { exists: true, count: count || 0, error: null };
    } catch (e) {
        return { exists: false, count: null, error: e.message };
    }
}

async function checkAllTables() {
    console.log('📊 TABLE EXISTENCE CHECK\n');

    const results = {
        exists: [],
        missing: [],
        errors: []
    };

    for (const table of expectedTables) {
        const result = await checkTable(table);

        if (result.exists) {
            const status = result.count === 0 ? '⚠️  EMPTY' : `✅ ${result.count} rows`;
            console.log(`${status.padEnd(20)} ${table}`);
            results.exists.push({ table, count: result.count });
        } else {
            console.log(`❌ MISSING       ${table} - ${result.error}`);
            results.missing.push(table);
        }
    }

    console.log('\n\n' + '='.repeat(72));
    console.log('\n📈 SUMMARY\n');
    console.log(`✅ Tables that exist: ${results.exists.length}`);
    console.log(`❌ Tables that don't exist: ${results.missing.length}`);

    const populated = results.exists.filter(t => t.count > 0);
    const empty = results.exists.filter(t => t.count === 0);

    console.log(`\n📊 Of existing tables:`);
    console.log(`   - 🟢 Populated: ${populated.length}`);
    console.log(`   - ⚪ Empty: ${empty.length}`);

    if (results.missing.length > 0) {
        console.log('\n\n⚠️  MISSING TABLES (referenced in code but don\'t exist):\n');
        results.missing.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n\n✅ POPULATED TABLES (actively storing data):\n');
    populated.forEach(t => console.log(`   - ${t.table} (${t.count} rows)`));

    console.log('\n\n⚪ EMPTY TABLES (exist but unused):\n');
    empty.forEach(t => console.log(`   - ${t.table}`));
}

checkAllTables().catch(console.error);
