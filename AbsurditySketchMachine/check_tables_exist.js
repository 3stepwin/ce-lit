const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    // There is no direct "list tables" in supabase-js, 
    // but we can try to query a system table if RLS allows, 
    // or just try to select from them and see if it errors.

    const tables = ['viral_seed_bank', 'scene_templates', 'celit_premises', 'celit_scene_bank', 'seed_usage'];
    for (const table of tables) {
        const { data, error, count } = await client.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table ${table}: ERROR - ${error.message}`);
        } else {
            console.log(`Table ${table}: EXISTS - Count: ${count}`);
        }
    }
}

checkTables();
