const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: img } = await client.from('image_prompt_packets').select('vector, sketch_type, aesthetic_preset');
    console.log('--- IMAGE PACKETS ---');
    console.log(JSON.stringify(img, null, 2));

    const { data: vid } = await client.from('video_prompt_packets').select('vector, sketch_type, aesthetic_preset, motion_profile');
    console.log('\n--- VIDEO PACKETS ---');
    console.log(JSON.stringify(vid, null, 2));
}

run();
