// Check actual prompt structure and content
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

async function inspectPrompts() {
    const { data: prompts } = await supabase
        .from('prompt_library')
        .select('*')
        .limit(10);

    console.log('🔍 DETAILED PROMPT STRUCTURE\n');
    console.log('=' + '='.repeat(70) + '\n');

    if (!prompts || prompts.length === 0) {
        console.log('No prompts found!');
        return;
    }

    console.log(`Showing first 10 of 787 prompts\n`);
    console.log('Columns in prompt_library table:');
    console.log(Object.keys(prompts[0]).join(', '));
    console.log('\n\n');

    prompts.forEach((p, i) => {
        console.log(`\n--- PROMPT ${i + 1} ---`);
        console.log(JSON.stringify(p, null, 2));
    });

    // Check how prompts are actually being queried
    console.log('\n\n=' + '='.repeat(70));
    console.log('\n🔎 HOW PROMPTS ARE SELECTED\n');

    // Check the get_random_prompts function
    console.log('Testing get_random_prompts RPC:\n');

    const { data: randomPrompts, error } = await supabase
        .rpc('get_random_prompts', {
            p_category: 'cinematic',
            p_count: 3
        });

    if (error) {
        console.log('❌ Error calling get_random_prompts:', error.message);
        console.log('   This function might not exist or has different parameters');
    } else {
        console.log('✅ Successfully called get_random_prompts');
        console.log(JSON.stringify(randomPrompts, null, 2));
    }
}

inspectPrompts().catch(console.error);
