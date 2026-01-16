const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function loadWave2() {
    console.log('🚀 Loading Ammo Pack v1 - Wave 2 (LIFE)...');

    const imagePackets = [
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'fake_commercial',
            aesthetic_preset: 'luxury_ad_glass',
            json_payload: {
                subject: 'premium product / brand ambassador',
                setting: 'minimalist glass atrium / ultra-modern showroom',
                camera: 'cinematic dolly, macro detail shots, 9:16 vertical',
                lighting: 'soft diffused natural light, high-end highlights',
                style: 'high-fashion / luxury automotive aesthetic'
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'therapy_intake_soft',
            json_payload: {
                subject: 'calm counselor / patient',
                setting: 'softly lit intake office, potted plants, warm wood',
                camera: 'gentle handheld, soft medium close-up',
                lighting: 'warm golden hour through blinds, soft key',
                style: 'therapeutic / empathetic but slightly ominous'
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'receipt_notice',
            aesthetic_preset: 'receipt_printer_macro',
            json_payload: {
                subject: 'printing mechanism / human hand',
                setting: 'cluttered administrative desk, dark background',
                camera: 'extreme macro, shallow depth',
                lighting: 'single harsh side light, dramatic shadows',
                style: 'mechanical / industrial texture focus'
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'suburban_notice_hoa',
            json_payload: {
                subject: 'manicured lawn / white fence / official letter',
                setting: 'sun-drenched suburban driveway',
                camera: 'static wide-angle, symmetrical framing',
                lighting: 'harsh midday sun, saturated colors',
                style: 'American Gothic / banal terror aesthetic'
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'checklist',
            aesthetic_preset: 'neon_void',
            json_payload: {
                subject: 'isolated individual',
                setting: 'empty convenience store / liminal corridor',
                camera: 'wide-angle distortion, low angle',
                lighting: 'flickering neon, cool blue and magenta tones',
                style: 'cyber-liminal / nocturnal loneliness'
            }
        }
    ];

    const videoPackets = [
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'apology_statement',
            aesthetic_preset: 'therapy_intake_soft',
            motion_profile: 'closeup_microexpression',
            json_payload: {
                motion_type: 'subtle_facial',
                camera_move: 'none',
                duration: 6,
                subject_action: 'controlled micro-expression, subtle nod',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'fake_commercial',
            aesthetic_preset: 'luxury_ad_glass',
            motion_profile: 'product_macro_cuts',
            json_payload: {
                motion_type: 'slow_sweeps',
                camera_move: 'dolly lateral + slow zoom',
                duration: 8,
                subject_action: 'luxury product rotation or focus shift',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'receipt_printer_macro',
            motion_profile: 'printer_whirr_reveal',
            json_payload: {
                motion_type: 'mechanical_advance',
                camera_move: 'tilt up following paper',
                duration: 7,
                subject_action: 'receipt emerges from printer slot',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'suburban_notice_hoa',
            motion_profile: 'static_intake_checklist',
            json_payload: {
                motion_type: 'stillness_tension',
                camera_move: 'vibration-free static',
                duration: 10,
                subject_action: 'total absence of motion, bird flies past',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'checklist',
            aesthetic_preset: 'neon_void',
            motion_profile: 'notification_stack_glitch',
            json_payload: {
                motion_type: 'glitchy_ui',
                camera_move: 'subtle camera shake',
                duration: 5,
                subject_action: 'digital artifacting on face',
                end_freeze_verdict: true
            }
        }
    ];

    try {
        console.log('Inserting Wave 2 (LIFE) Image Packets...');
        const { data: iData, error: iErr } = await client.from('image_prompt_packets').insert(imagePackets).select();
        if (iErr) throw iErr;
        console.log(`✅ Loaded ${iData.length} Image Packets.`);

        console.log('Inserting Wave 2 (LIFE) Video Packets...');
        const { data: vData, error: vErr } = await client.from('video_prompt_packets').insert(videoPackets).select();
        if (vErr) throw vErr;
        console.log(`✅ Loaded ${vData.length} Video Packets.`);

        console.log('\n--- Wave 2 Completion Report ---');
        console.log('Total LIFE Image Packets:', iData.length);
        console.log('Total LIFE Video Packets:', vData.length);
    } catch (err) {
        console.error('❌ Error loading Wave 2:', err.message);
    }
}

loadWave2();
