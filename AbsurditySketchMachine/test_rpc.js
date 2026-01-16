const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testRpc() {
    console.log("Testing get_random_seed RPC...");
    const { data, error } = await client.rpc('get_random_seed', {
        p_category: 'work',
        p_session_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("RPC Success:", data);
    }
}

testRpc();
