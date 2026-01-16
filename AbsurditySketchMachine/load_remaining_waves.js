const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function loadRemainingWaves() {
    console.log('🚀 Loading Ammo Pack v1 - Wave 2 (LIFE) and Wave 3 (WORK)...');

    const lifeImages = [
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'fake_commercial',
            aesthetic_preset: 'luxury_ad_glass',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'MAIN_PERFORMER', wardrobe: 'bespoke silk attire', expression: 'expensive deadpan' },
                setting: { location: 'minimalist glass showroom', props: ['floating product', 'monolith'], time_of_day: 'golden hour' },
                camera: { format: '9:16', lens: '100mm macro', framing: 'extreme close up', composition: 'abstract' },
                lighting: { style: 'soft high-end diffused', key: 'large softbox' },
                style: { aesthetic_preset: 'luxury_ad_glass', color_grade: 'warm gold', texture: 'pristine' },
                graphics: { enabled: true, elements: ['TIMECODE'], safe_area: 'true' },
                meta: { vector: 'LIFE_VECTOR', sketch_type: 'fake_commercial', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'receipt_notice',
            aesthetic_preset: 'receipt_printer_macro',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'SUBJECT', wardrobe: 'hands only', expression: 'trembling' },
                setting: { location: 'dark office foyer', props: ['industrial receipt printer'], time_of_day: 'night' },
                camera: { format: '9:16', lens: '65mm macro', framing: 'macro detail', composition: 'low angle' },
                lighting: { style: 'mechanical harsh', key: 'underlighting' },
                style: { aesthetic_preset: 'receipt_printer_macro', color_grade: 'high contrast', texture: 'thermal paper' },
                graphics: { enabled: true, elements: ['SEAL_STAMP', 'TIMECODE'], safe_area: 'true' },
                meta: { vector: 'LIFE_VECTOR', sketch_type: 'receipt_notice', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'therapy_intake',
            aesthetic_preset: 'therapy_intake_soft',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'SPOKESPERSON', wardrobe: 'beige cashmere', expression: 'calmly threatening' },
                setting: { location: 'softly lit intake room', props: ['potted plant', 'clipboard'], time_of_day: 'afternoon' },
                camera: { format: '9:16', lens: '35mm prime', framing: 'medium shot', composition: 'centered' },
                lighting: { style: 'warm diffused', key: 'natural window light' },
                style: { aesthetic_preset: 'therapy_intake_soft', color_grade: 'soft warm', texture: 'velvety' },
                graphics: { enabled: true, elements: ['LOWER_THIRD'], safe_area: 'true' },
                meta: { vector: 'LIFE_VECTOR', sketch_type: 'therapy_intake', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'life_fallback_surveillance',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'MAIN_PERFORMER', wardrobe: 'casual wear', expression: 'ignoring camera' },
                setting: { location: 'empty supermarket aisle', props: ['security camera', 'frozen meal'], time_of_day: '3am' },
                camera: { format: '9:16', lens: 'fisheye', framing: 'top down security', composition: 'distorted' },
                lighting: { style: 'flickering fluorescent', key: 'overhead' },
                style: { aesthetic_preset: 'life_fallback_surveillance', color_grade: 'green-tinted', texture: 'cctv noise' },
                graphics: { enabled: true, elements: ['TIMECODE', 'LIVE_BUG'], safe_area: 'true' },
                meta: { vector: 'LIFE_VECTOR', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'life_fallback_luxury',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'INFLUENCER', wardrobe: 'designer robe', expression: 'vacant bliss' },
                setting: { location: 'infinity pool edge', props: ['tablet', 'white wine'], time_of_day: 'sunset' },
                camera: { format: '9:16', lens: '50mm', framing: 'over the shoulder', composition: 'golden ratio' },
                lighting: { style: 'sunset backlight', key: 'orange rim light' },
                style: { aesthetic_preset: 'life_fallback_luxury', color_grade: 'hyper-saturated', texture: 'smooth' },
                graphics: { enabled: true, elements: ['LOWER_THIRD'], safe_area: 'true' },
                meta: { vector: 'LIFE_VECTOR', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        }
    ];

    const lifeVideos = [
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'fake_commercial',
            aesthetic_preset: 'luxury_ad_glass',
            motion_profile: 'product_macro_cuts',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'product_macro_cuts', camera_move: 'slow geometric orbital', subject_action: 'luxury product rotation', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 8, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'LIFE_VECTOR', sketch_type: 'fake_commercial', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'receipt_notice',
            aesthetic_preset: 'receipt_printer_macro',
            motion_profile: 'printer_whirr_reveal',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'printer_whirr_reveal', camera_move: 'slow tilt up following paper', subject_action: 'paper advancing', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: true, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'LIFE_VECTOR', sketch_type: 'receipt_notice', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: 'therapy_intake',
            aesthetic_preset: 'therapy_intake_soft',
            motion_profile: 'closeup_microexpression',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'closeup_microexpression', camera_move: 'none', subject_action: 'controlled micro-expression', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 6, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'LIFE_VECTOR', sketch_type: 'therapy_intake', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'life_fallback_surveillance',
            motion_profile: 'static_intake_checklist',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'static_intake_checklist', camera_move: 'none', subject_action: 'zero movement', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 10, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: true },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'LIFE_VECTOR', sketch_type: null, tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'LIFE_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'life_fallback_luxury',
            motion_profile: 'notification_stack_glitch',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'notification_stack_glitch', camera_move: 'subtle camera vibration', subject_action: 'digital glitching on face', intensity: 'medium', stability: 'locked' },
                timing: { duration_s: 6, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: true, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'LIFE_VECTOR', sketch_type: null, tone: 'institutional_deadpan' }
            }
        }
    ];

    const workImages = [
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'corporate_training',
            aesthetic_preset: 'institutional_grey',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'EMPLOYEE', wardrobe: 'grey uniform', expression: 'exhausted deadpan' },
                setting: { location: 'grey cubicle farm', props: ['antique monitor', 'dry plant'], time_of_day: 'midday' },
                camera: { format: '9:16', lens: '24mm', framing: 'medium shot', composition: 'symmetrical' },
                lighting: { style: 'flickering fluorescent', key: 'overhead' },
                style: { aesthetic_preset: 'institutional_grey', color_grade: 'washed out', texture: 'grainy' },
                graphics: { enabled: true, elements: ['TIMECODE'], safe_area: 'true' },
                meta: { vector: 'WORK_VECTOR', sketch_type: 'corporate_training', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'pharma_clean',
            aesthetic_preset: 'pharma_clean',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'SPOKESPERSON', wardrobe: 'lab coat', expression: 'brightly neutral' },
                setting: { location: 'high-key sterile lab', props: ['medical tablet', 'vials'], time_of_day: 'mornning' },
                camera: { format: '9:16', lens: '85mm prime', framing: 'bust', composition: 'centered' },
                lighting: { style: 'surgical bright', key: 'large softbox' },
                style: { aesthetic_preset: 'pharma_clean', color_grade: 'high brightness', texture: 'clean' },
                graphics: { enabled: true, elements: ['LOWER_THIRD', 'SEAL_STAMP'], safe_area: 'true' },
                meta: { vector: 'WORK_VECTOR', sketch_type: 'pharma_clean', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'courtroom_formality',
            aesthetic_preset: 'courtroom_formality',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'EMPLOYEE', wardrobe: 'formal dark suit', expression: 'subservient' },
                setting: { location: 'wood-paneled hearing room', props: ['official seal', 'heavy bible'], time_of_day: 'day' },
                camera: { format: '9:16', lens: '35mm', framing: 'full shot', composition: 'formal' },
                lighting: { style: 'dramatic spotlight', key: 'single source overhead' },
                style: { aesthetic_preset: 'courtroom_formality', color_grade: 'deep shadows', texture: 'rich' },
                graphics: { enabled: true, elements: ['SEAL_STAMP', 'TIMECODE'], safe_area: 'true' },
                meta: { vector: 'WORK_VECTOR', sketch_type: 'courtroom_formality', tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'work_fallback_liminal',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'EMPLOYEE', wardrobe: 'beige shirt', expression: 'lost' },
                setting: { location: 'endless carpeted hallway', props: ['exit sign', 'fire extinguisher'], time_of_day: 'none' },
                camera: { format: '9:16', lens: '24mm wide', framing: 'full shot', composition: 'perspective' },
                lighting: { style: 'stale fluorescent', key: 'overhead' },
                style: { aesthetic_preset: 'work_fallback_liminal', color_grade: 'beige-tinted', texture: 'liminal' },
                graphics: { enabled: true, elements: ['TIMECODE'], safe_area: 'true' },
                meta: { vector: 'WORK_VECTOR', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'work_fallback_bodycam',
            json_payload: {
                version: '1.0',
                kind: 'image',
                subject: { role: 'EMPLOYEE', wardrobe: 'security vest', expression: 'confrontational' },
                setting: { location: 'industrial storage unit', props: ['flashlight', 'clipboard'], time_of_day: 'night' },
                camera: { format: '9:16', lens: 'fisheye', framing: 'chest level bodycam', composition: 'off-center' },
                lighting: { style: 'harsh direct flashlight', key: 'point source' },
                style: { aesthetic_preset: 'work_fallback_bodycam', color_grade: 'monitor grey', texture: 'low bits' },
                graphics: { enabled: true, elements: ['TIMECODE', 'LIVE_BUG'], safe_area: 'true' },
                meta: { vector: 'WORK_VECTOR', sketch_type: null, tone: 'institutional_deadpan', policy: { no_provider_names_in_ui: true } }
            }
        }
    ];

    const workVideos = [
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'corporate_training',
            aesthetic_preset: 'institutional_grey',
            motion_profile: 'slow_zoom',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'slow_zoom', camera_move: 'slow forward push-in', subject_action: 'slow blink', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'WORK_VECTOR', sketch_type: 'corporate_training', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'pharma_clean',
            aesthetic_preset: 'pharma_clean',
            motion_profile: 'slow_push_in',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'slow_push_in', camera_move: 'slow dolly in', subject_action: 'perfect posture lock', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: true, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'WORK_VECTOR', sketch_type: 'pharma_clean', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: 'courtroom_formality',
            aesthetic_preset: 'courtroom_formality',
            motion_profile: 'stamp_hit_freeze',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'stamp_hit_freeze', camera_move: 'none', subject_action: 'heavy rubber stamp strike', intensity: 'medium', stability: 'locked' },
                timing: { duration_s: 5, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'WORK_VECTOR', sketch_type: 'courtroom_formality', tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'work_fallback_liminal',
            motion_profile: 'locked_office_tripod',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'locked_office_tripod', camera_move: 'none', subject_action: 'minute movement of desk object', intensity: 'low', stability: 'locked' },
                timing: { duration_s: 9, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'WORK_VECTOR', sketch_type: null, tone: 'institutional_deadpan' }
            }
        },
        {
            vector: 'WORK_VECTOR',
            sketch_type: null,
            aesthetic_preset: 'work_fallback_bodycam',
            motion_profile: 'handheld_audit_walkthrough',
            json_payload: {
                version: '1.0',
                kind: 'video',
                motion: { motion_profile: 'handheld_audit_walkthrough', camera_move: 'subtle rhythmic bounce (walking)', subject_action: 'adjusting chest strap', intensity: 'medium', stability: 'handheld' },
                timing: { duration_s: 7, fps: 30, beat_map: ['setup', 'hold', 'punchline'] },
                overlays: { enabled: true, lower_third_mutation: false, ticker: false },
                freeze_frame: { end_freeze_verdict: true, freeze_last_ms: 700 },
                io: { requires_input_image: true },
                meta: { vector: 'WORK_VECTOR', sketch_type: null, tone: 'institutional_deadpan' }
            }
        }
    ];

    try {
        const { data: iData } = await client.from('image_prompt_packets').insert([...lifeImages, ...workImages]).select();
        const { data: vData } = await client.from('video_prompt_packets').insert([...lifeVideos, ...workVideos]).select();

        console.log(`✅ Loaded Wave 2 (LIFE) & Wave 3 (WORK). Image: ${iData?.length || 0}, Video: ${vData?.length || 0}`);
    } catch (err) {
        console.error('❌ Error loading:', err.message);
    }
}

loadRemainingWaves();
