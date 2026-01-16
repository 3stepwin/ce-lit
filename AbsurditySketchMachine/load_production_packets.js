const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function loadProductionPackets() {
    console.log('🧼 WIPING ALL PACKETS TO ENFORCE RECENT CONTRACT...');

    // 1. Nullify FKs in dependent tables
    console.log('- Nullifying references in celit_jobs and sketches...');
    await client.from('celit_jobs').update({ selected_image_packet_id: null, selected_video_packet_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('sketches').update({ selected_image_packet_id: null, selected_video_packet_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Now wipe
    console.log('- Deleting all packets...');
    const now = new Date().toISOString();
    const { error: iDelErr } = await client.from('image_prompt_packets').delete().lte('created_at', now);
    const { error: vDelErr } = await client.from('video_prompt_packets').delete().lte('created_at', now);

    if (iDelErr || vDelErr) {
        console.error('Cleanup failed:', iDelErr || vDelErr);
        // Note: Even if delete fails, we'll try to insert (though it might duplicate if they survived)
    }

    console.log('🚀 Loading Ammo Pack v1 - Wave 1 (FEED + UNIVERSAL)...');

    const universalImage = {
        vector: 'UNIVERSAL',
        sketch_type: null,
        aesthetic_preset: 'prestige_minimal',
        json_payload: {
            version: '1.0',
            kind: 'image',
            subject: { role: 'MAIN_PERFORMER', wardrobe: 'neutral institutional grey', expression: 'deadpan' },
            setting: { location: 'sterile grey studio', props: ['none'], time_of_day: 'midday' },
            camera: { format: '9:16', lens: '50mm prime', framing: 'medium shot', composition: 'centered' },
            lighting: { style: 'high-key clean', key: 'softbox' },
            style: { aesthetic_preset: 'prestige_minimal', color_grade: 'neutral', texture: 'clean' },
            graphics: { enabled: true, elements: ['TIMECODE'], safe_area: 'true' },
            meta: { vector: 'UNIVERSAL', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
        }
    };

    const universalVideo = {
        vector: 'UNIVERSAL',
        sketch_type: null,
        aesthetic_preset: 'prestige_minimal',
        motion_profile: 'static_stare',
        json_payload: {
            version: '1.0',
            kind: 'video',
            motion: { motion_profile: 'static_stare', camera_move: 'none', subject_action: 'locked gaze', intensity: 'low', stability: 'locked' },
            timing: { duration_s: 5, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
            overlays: { enabled: true, lower_third_mutation: false, ticker: false },
            freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
            io: { requires_input_image: true },
            meta: { vector: 'UNIVERSAL', sketch_type: null, tone: 'institutional_deadpan' }
        }
    };

    const feedImages = [
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'breaking_news',
            aesthetic_preset: 'news_desk_clean',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'ANCHOR', wardrobe: 'dark professional suit', expression: 'urgent deadpan' },
                setting: { location: 'modern news studio with LED screen', props: ['broadcast mic', 'teleprompter'], time_of_day: 'live' },
                camera: { format: '9:16', lens: '35mm anamorphic', framing: 'medium close up', composition: 'rule of thirds' },
                lighting: { style: 'studio multi-point', key: 'bright ring light' },
                style: { aesthetic_preset: 'news_desk_clean', color_grade: 'broadcast cool', texture: 'digital' },
                graphics: { enabled: true, elements: ['LIVE_BUG', 'LOWER_THIRD', 'TICKER'], safe_area: 'true' },
                meta: { vector: 'FEED_VECTOR', sketch_type: 'breaking_news', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'weekend_update',
            aesthetic_preset: 'weekend_update_stage',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'ANCHOR', wardrobe: 'grey blazer, no tie', expression: 'smug deadpan' },
                setting: { location: 'comedy news desk stage', props: ['desk', 'laptop', 'papers'], time_of_day: 'late night' },
                camera: { format: '9:16', lens: '50mm prime', framing: 'waist up', composition: 'centered' },
                lighting: { style: 'stage spotlight', key: 'warm key' },
                style: { aesthetic_preset: 'weekend_update_stage', color_grade: 'stage warm', texture: 'crisp' },
                graphics: { enabled: true, elements: ['LOWER_THIRD'], safe_area: 'true' },
                meta: { vector: 'FEED_VECTOR', sketch_type: 'weekend_update', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'press_conference',
            aesthetic_preset: 'press_conference_flash',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'SPOKESPERSON', wardrobe: 'navy formal suit', expression: 'defensive deadpan' },
                setting: { location: 'podium with step-and-repeat backdrop', props: ['cluster of microphones', 'water bottle'], time_of_day: 'day' },
                camera: { format: '9:16', lens: 'wide zoom', framing: 'medium shot', composition: 'eye level' },
                lighting: { style: 'harsh direct + camera flashes', key: 'multiple strobes' },
                style: { aesthetic_preset: 'press_conference_flash', color_grade: 'desaturated grey', texture: 'grainy news' },
                graphics: { enabled: true, elements: ['SEAL_STAMP', 'TIMECODE'], safe_area: 'true' },
                meta: { vector: 'FEED_VECTOR', sketch_type: 'press_conference', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'feed_fallback_clean',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'MAIN_PERFORMER', wardrobe: 'branding-free streetwear', expression: 'neutral' },
                setting: { location: 'minimalist creator studio', props: ['neon sign', 'ring light'], time_of_day: 'night' },
                camera: { format: '9:16', lens: '24mm wide', framing: 'medium full shot', composition: 'centered' },
                lighting: { style: 'flat ring light', key: 'soft neon' },
                style: { aesthetic_preset: 'feed_fallback_clean', color_grade: 'vibrant flat', texture: 'clean digital' },
                graphics: { enabled: true, elements: ['LOWER_THIRD', 'TICKER'], safe_area: 'true' },
                meta: { vector: 'FEED_VECTOR', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'feed_fallback_raw',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'INFLUENCER', wardrobe: 'oversized hoodie', expression: 'vaguely troubled' },
                setting: { location: 'cluttered apartment bedroom', props: ['phone on tripod', 'unmade bed'], time_of_day: 'afternoon' },
                camera: { format: '9:16', lens: 'phone wide', framing: 'selfie angle', composition: 'dynamic' },
                lighting: { style: 'natural window light', key: 'single source' },
                style: { aesthetic_preset: 'feed_fallback_raw', color_grade: 'muted organic', texture: 'smartphone noise' },
                graphics: { enabled: true, elements: ['LOWER_THIRD'], safe_area: 'true' },
                meta: { vector: 'FEED_VECTOR', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        }
    ];

    const feedVideos = [
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'breaking_news',
            aesthetic_preset: 'news_desk_clean',
            motion_profile: 'broadcast_hard_cuts',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'broadcast_hard_cuts', camera_move: 'none (simulated switching)', subject_action: 'mouth movements, blink', intensity: 'low', stability: 'broadcast_switch' },
                timing: { duration_s: 8, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: true, ticker: true },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'FEED_VECTOR', sketch_type: 'breaking_news', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'weekend_update',
            aesthetic_preset: 'weekend_update_stage',
            motion_profile: 'teleprompter_slow_pan',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'teleprompter_slow_pan', camera_move: 'slow lateral dolly', subject_action: 'eye-tracking camera', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'FEED_VECTOR', sketch_type: 'weekend_update', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'press_conference',
            aesthetic_preset: 'press_conference_flash',
            motion_profile: 'lower_third_mutation',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'lower_third_mutation', camera_move: 'subtle push in', subject_action: 'checking notes', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: true, ticker: true },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'FEED_VECTOR', sketch_type: 'press_conference', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'feed_fallback_clean',
            motion_profile: 'broadcast_stinger_hit',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'broadcast_stinger_hit', camera_move: 'snap zoom x2', subject_action: 'deadpan look-up', intensity: 'medium', stability: 'locked' },
                timing: { duration_s: 6, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: true },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'FEED_VECTOR', sketch_type: null, tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'feed_fallback_raw',
            motion_profile: 'handheld_jitter_stare',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'handheld_jitter_stare', camera_move: 'none', subject_action: 'breath, micro-expressions', intensity: 'low', stability: 'handheld' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'FEED_VECTOR', sketch_type: null, tone: 'institutional_deadpan' }
            }
        }
    ];

    try {
        await client.from('image_prompt_packets').insert(universalImage);
        await client.from('video_prompt_packets').insert(universalVideo);

        const { data: iData } = await client.from('image_prompt_packets').insert(feedImages).select();
        const { data: vData } = await client.from('video_prompt_packets').insert(feedVideos).select();

        console.log(`✅ SUCCESS: Loaded Wave 1 (FEED). Image: ${iData?.length || 0}, Video: ${vData?.length || 0}`);

        console.log('\n--- Wave 1 Production Registry ---');
        iData?.forEach(p => console.log(`- [IMG] ${p.id} : ${p.sketch_type || 'VECTOR-ONLY'}`));
        vData?.forEach(p => console.log(`- [VID] ${p.id} : ${p.sketch_type || 'VECTOR-ONLY'}`));

    } catch (err) {
        console.error('❌ Error loading:', err.message);
    }
}

loadProductionPackets();
