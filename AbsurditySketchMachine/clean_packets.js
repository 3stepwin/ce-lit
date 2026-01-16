const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clean() {
    console.log('🧼 Cleaning duplicate packets...');

    // Clean Image Packets
    const { data: imgs } = await client.from('image_prompt_packets').select('*');
    const seenImg = new Set();
    let imgDeleted = 0;
    for (const p of imgs) {
        const key = `${p.vector}|${p.sketch_type}|${p.aesthetic_preset}`;
        if (seenImg.has(key)) {
            await client.from('image_prompt_packets').delete().eq('id', p.id);
            imgDeleted++;
        } else {
            seenImg.add(key);
        }
    }

    // Clean Video Packets
    const { data: vids } = await client.from('video_prompt_packets').select('*');
    const seenVid = new Set();
    let vidDeleted = 0;
    for (const p of vids) {
        const key = `${p.vector}|${p.sketch_type}|${p.aesthetic_preset}|${p.motion_profile}`;
        if (seenVid.has(key)) {
            await client.from('video_prompt_packets').delete().eq('id', p.id);
            vidDeleted++;
        } else {
            seenVid.add(key);
        }
    }

    console.log(`✅ Cleaned ${imgDeleted} duplicate Image Packets.`);
    console.log(`✅ Cleaned ${vidDeleted} duplicate Video Packets.`);
}

clean();
