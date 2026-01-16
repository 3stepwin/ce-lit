const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function loadWave1() {
    console.log('🚀 Loading Ammo Pack v1 - Wave 1 (FEED)...');

    const imagePackets = [
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'breaking_news',
            aesthetic_preset: 'news_desk_clean',
            json_payload: {
                subject: 'anchor / correspondent',
                setting: 'broadcast studio / clean LED wall',
                camera: 'two-camera broadcast, crisp framing, 9:16 safe',
                lighting: 'studio key + fill, high clarity',
                graphics: 'LIVE bug, chyron area reserved',
                style: 'hyper-real, institutional broadcast'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'weekend_update_stage',
            json_payload: {
                subject: 'desk anchor',
                setting: 'minimalist news stage, audience murmer background',
                camera: 'medium shot, static, eye-level',
                props: 'desk, mic, cue cards',
                lighting: 'bright stage lighting, punchy highlights',
                style: 'comedy-news polish, deadpan delivery'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'press_conference',
            aesthetic_preset: 'press_conference_flash',
            json_payload: {
                subject: 'official spokesperson',
                setting: 'podium with step-and-repeat seal backdrop',
                camera: 'slightly low angle, news-pool wide shot',
                lighting: 'harsh direct light, intermittent camera flashes',
                props: 'mics cluster, water glass, file folder',
                style: 'tense institutional realism'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'trend_explainer_ui',
            json_payload: {
                subject: 'lone creator',
                setting: 'workspace with ring light and acoustic panels',
                camera: 'front-facing phone camera style, vertical',
                graphics: 'UI overlays, analytics charts background, platform metrics',
                lighting: 'soft flat ring light',
                style: 'hyper-modern influencer aesthetic'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'documentary',
            aesthetic_preset: 'documentary_prestige',
            json_payload: {
                subject: 'interviewee / expert',
                setting: 'moody library or dark studio',
                camera: 'extreme close-up or profile, shallow depth of field',
                lighting: 'high contrast cinematic key, soft shadows',
                style: 'prestige documentary, A24 aesthetic',
                graphics: 'archive film overlays reserved'
            }
        }
    ];

    const videoPackets = [
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'breaking_news',
            aesthetic_preset: 'news_desk_clean',
            motion_profile: 'broadcast_hard_cuts',
            json_payload: {
                motion_type: 'broadcast_switch',
                camera_move: 'none (switching angles implied)',
                duration: 8,
                overlays: 'lower-third changes mid shot',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'weekend_update_stage',
            motion_profile: 'teleprompter_slow_pan',
            json_payload: {
                motion_type: 'slow_pan',
                camera_move: 'slow lateral movement',
                subject_action: 'anchor stays locked to lens',
                duration: 6,
                end_freeze_verdict: true,
                zoom_beat: 'subtle zoom at last second'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'trend_explainer_ui',
            motion_profile: 'lower_third_mutation',
            json_payload: {
                motion_type: 'ui_stable',
                camera_move: 'static',
                subject_action: 'deadpan gaze',
                overlays: 'on-screen chyron mutates twice',
                duration: 7,
                end_freeze_verdict: true,
                final_beat: 'final chyron = verdict freeze'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'breaking_news',
            aesthetic_preset: 'news_desk_clean',
            motion_profile: 'breaking_news_stinger',
            json_payload: {
                motion_type: 'stinger_hit',
                camera_move: 'quick snap push-in',
                duration: 5,
                graphics: 'BREAKING NEWS flash overlay',
                end_freeze_verdict: true,
                audio_reserved: 'stinger staccato hit'
            }
        },
        {
            vector: 'FEED_VECTOR',
            sketch_type: 'documentary',
            aesthetic_preset: 'documentary_prestige',
            motion_profile: 'studio_push_to_verdict',
            json_payload: {
                motion_type: 'cinematic_push',
                camera_move: 'slow dolly in',
                subject_action: 'single heavy blink',
                duration: 9,
                end_freeze_verdict: true,
                freeze_timing: 'last 0.7s locked'
            }
        }
    ];

    const universalImg = {
        vector: 'UNIVERSAL',
        sketch_type: null,
        aesthetic_preset: 'prestige_minimal',
        json_payload: {
            subject: 'human figure',
            setting: 'neutral grey studio',
            camera: 'centered medium shot',
            lighting: 'clean softbox',
            style: 'standard institutional'
        }
    };

    const universalVid = {
        vector: 'UNIVERSAL',
        sketch_type: null,
        aesthetic_preset: 'prestige_minimal',
        motion_profile: 'static_stare',
        json_payload: {
            motion_type: 'none',
            camera_move: 'none',
            duration: 5,
            end_freeze_verdict: true
        }
    };

    try {
        console.log('Inserting Universal fallbacks...');
        await client.from('image_prompt_packets').insert(universalImg);
        await client.from('video_prompt_packets').insert(universalVid);

        console.log('Inserting Wave 1 (FEED) Image Packets...');
        const { data: iData, error: iErr } = await client.from('image_prompt_packets').insert(imagePackets).select();
        if (iErr) throw iErr;
        console.log(`✅ Loaded ${iData.length} Image Packets.`);

        console.log('Inserting Wave 1 (FEED) Video Packets...');
        const { data: vData, error: vErr } = await client.from('video_prompt_packets').insert(videoPackets).select();
        if (vErr) throw vErr;
        console.log(`✅ Loaded ${vData.length} Video Packets.`);

        console.log('\n--- Wave 1 Completion Report ---');
        console.log('Total FEED Image Packets:', iData.length);
        console.log('Total FEED Video Packets:', vData.length);
    } catch (err) {
        console.error('❌ Error loading Wave 1:', err.message);
    }
}

loadWave1();
