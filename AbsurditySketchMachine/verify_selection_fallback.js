const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifySelection() {
    console.log('🧪 VERIFYING PACKET SELECTION FALLBACK...');

    const selectPacket = async (table, vector, sketchType) => {
        // 1. Exact Match
        let { data: exact } = await client.from(table).select('id, vector, sketch_type').eq('vector', vector).eq('sketch_type', sketchType).limit(1);
        if (exact && exact.length > 0) return { type: 'EXACT', packet: exact[0] };

        // 2. Vector Fallback
        let { data: vecOnly } = await client.from(table).select('id, vector, sketch_type').eq('vector', vector).is('sketch_type', null).limit(1);
        if (vecOnly && vecOnly.length > 0) return { type: 'VECTOR-ONLY', packet: vecOnly[0] };

        // 3. Universal Fallback
        let { data: uni } = await client.from(table).select('id, vector, sketch_type').eq('vector', 'UNIVERSAL').limit(1);
        return { type: 'UNIVERSAL', packet: uni[0] };
    };

    const scenarios = [
        { name: '1. EXACT MATCH (FEED/breaking_news)', vector: 'FEED_VECTOR', type: 'breaking_news' },
        { name: '2. VECTOR FALLBACK (FEED/unknown_type)', vector: 'FEED_VECTOR', type: 'unknown_type' },
        { name: '3. UNIVERSAL FALLBACK (WORK/unknown_type)', vector: 'WORK_VECTOR', type: 'unknown_type' }
    ];

    for (const s of scenarios) {
        console.log(`\nScenario: ${s.name}`);
        const img = await selectPacket('image_prompt_packets', s.vector, s.type);
        console.log(`Image: [${img.type}] -> ${img.packet?.vector} / ${img.packet?.sketch_type} (ID: ${img.packet?.id})`);

        const vid = await selectPacket('video_prompt_packets', s.vector, s.type);
        console.log(`Video: [${vid.type}] -> ${vid.packet?.vector} / ${vid.packet?.sketch_type} (ID: ${vid.packet?.id})`);
    }
}

verifySelection();
