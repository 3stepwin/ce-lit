const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function loadWave3() {
    console.log('🚀 Loading Ammo Pack v1 - Wave 3 (WORK)...');

    const imagePackets = [
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'pharma_clean',
            aesthetic_preset: 'pharma_clean',
            json_payload: {
                subject: 'smiling corporate liaison',
                setting: 'bright minimal medical hallway / lab',
                camera: 'clean locked shot, 9:16 vertical',
                lighting: 'sterile high-key, surgical precision',
                style: 'clean pharmaceutical advertisement'
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'liminal_beige',
            json_payload: {
                subject: 'infinite cubicle array',
                setting: 'windowless office floor, uniform beige desks',
                camera: 'wide-angle perspective, low height',
                lighting: 'stale fluorescent hum, warm yellow shadows',
                style: 'Severance / liminal space aesthetic'
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'courtroom_formality',
            aesthetic_preset: 'courtroom_formality',
            json_payload: {
                subject: 'official clerk / judge bench',
                setting: 'dark wood-paneled courtroom, official seal backdrop',
                camera: 'symmetrical framing, high contrast',
                lighting: 'overhead spotlighting, dramatic shadows',
                style: 'legal procedural / institutional weight'
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'bodycam_procedural',
            json_payload: {
                subject: 'administrative officer',
                setting: 'neutral corridor / office foyer',
                camera: 'chest-mounted bodycam, fisheye distortion',
                lighting: 'harsh direct light, low dynamic range',
                style: 'official bodycam / surveillance aesthetic',
                graphics: 'timestamp overlay, REC indicator'
            }
        }
    ];

    const videoPackets = [
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'orientation',
            aesthetic_preset: 'pharma_clean',
            motion_profile: 'slow_push_in',
            json_payload: {
                motion_type: 'slow_zoom',
                camera_move: 'slow forward push-in',
                duration: 7,
                subject_action: 'slow clinical blink',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'liminal_beige',
            motion_profile: 'locked_office_tripod',
            json_payload: {
                motion_type: 'minimal_motion',
                camera_move: 'none (static tripod)',
                duration: 9,
                subject_action: 'minute movement of desktop object',
                end_freeze_verdict: true,
                beat: 'uncomfortable stillness'
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null, // Vector-only
            aesthetic_preset: 'bodycam_procedural',
            motion_profile: 'handheld_audit_walkthrough',
            json_payload: {
                motion_type: 'handheld_drift',
                camera_move: 'subtle erratic walking motion',
                duration: 6,
                subject_action: 'checking badge or clipboard',
                end_freeze_verdict: true
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'compliance_portal',
            aesthetic_preset: 'courtroom_formality',
            motion_profile: 'stamp_hit_freeze',
            json_payload: {
                motion_type: 'action_freeze',
                camera_move: 'none',
                duration: 5,
                subject_action: 'heavy rubber stamp strike on paper',
                end_freeze_verdict: true,
                final_beat: 'freeze exactly on stamp impact'
            }
        }
    ];

    try {
        console.log('Inserting Wave 3 (WORK) Image Packets...');
        const { data: iData, error: iErr } = await client.from('image_prompt_packets').insert(imagePackets).select();
        if (iErr) throw iErr;
        console.log(`✅ Loaded ${iData.length} Image Packets.`);

        console.log('Inserting Wave 3 (WORK) Video Packets...');
        const { data: vData, error: vErr } = await client.from('video_prompt_packets').insert(videoPackets).select();
        if (vErr) throw vErr;
        console.log(`✅ Loaded ${vData.length} Video Packets.`);

        console.log('\n--- Wave 3 Completion Report ---');
        console.log('Total WORK Image Packets added:', iData.length);
        console.log('Total WORK Video Packets added:', vData.length);
    } catch (err) {
        console.error('❌ Error loading Wave 3:', err.message);
    }
}

loadWave3();
