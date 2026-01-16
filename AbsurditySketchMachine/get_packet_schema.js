const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getSchema() {
    console.log('--- image_prompt_packets columns ---');
    const { data: imgData } = await client.from('image_prompt_packets').select('*').limit(1);
    if (imgData && imgData.length > 0) {
        console.log(Object.keys(imgData[0]));
    }

    console.log('\n--- video_prompt_packets columns ---');
    const { data: vidData } = await client.from('video_prompt_packets').select('*').limit(1);
    if (vidData && vidData.length > 0) {
        console.log(Object.keys(vidData[0]));
    }
}

getSchema();
