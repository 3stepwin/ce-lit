const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectFunctions() {
    console.log('🔍 Inspecting RPCs for "Failed to generate an idea"...');

    const { data, error } = await client.rpc('inspect_function_source', { search_term: 'Failed to generate an idea' });

    if (error) {
        console.log('Direct search RPC not available, trying manual query...');
        const { data: functions, error: funcErr } = await client.from('pg_proc').select('proname, prosrc').ilike('prosrc', '%Failed to generate an idea%');
        if (funcErr) {
            console.error('Failed to query pg_proc:', funcErr);
            return;
        }
        console.log('Matches found in pg_proc:', functions);
    } else {
        console.log('Results:', data);
    }
}

inspectFunctions();
