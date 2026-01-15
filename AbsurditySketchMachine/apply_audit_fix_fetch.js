require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
-- 1. UPGRADE CELIT_JOBS
ALTER TABLE celit_jobs 
ADD COLUMN IF NOT EXISTS vector TEXT,
ADD COLUMN IF NOT EXISTS seed_id UUID,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_frame_text TEXT,
ADD COLUMN IF NOT EXISTS provider_lane TEXT,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS stage_timestamps JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS error JSONB;

-- 2. FIX SEED RETRIEVAL RPC
DROP FUNCTION IF EXISTS get_random_seed(text, uuid, integer);
CREATE OR REPLACE FUNCTION get_random_seed(
    p_category TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_avoid_last INTEGER DEFAULT 3
)
RETURNS TABLE (
    premise_id UUID,
    premise TEXT,
    role TEXT,
    sketch_type TEXT,
    scene_id UUID,
    scene JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS premise_id,
        p.premise,
        p.role,
        p.sketch_type,
        s.id AS scene_id,
        jsonb_build_object(
            'setting', s.setting,
            'camera_grammar', s.camera_grammar,
            'sound_grammar', s.sound_grammar,
            'subtitle_style', s.subtitle_style,
            'props', s.props
        ) AS scene
    FROM viral_seed_bank p
    LEFT JOIN scene_templates s ON true 
    WHERE 
        (p_category = p.category OR p_category IS NULL)
        AND p.id NOT IN (
            SELECT ps.premise_id 
            FROM seed_usage ps
            WHERE ps.session_id = p_session_id 
            ORDER BY ps.used_at DESC 
            LIMIT p_avoid_last
        )
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function apply() {
    console.log("Attempting to apply SQL migration via RPC...");
    const url = `${SUPABASE_URL}/rest/v1/rpc/apply_sql`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql_query: sql })
        });

        if (response.ok) {
            console.log("Migration applied successfully!");
        } else {
            const err = await response.json();
            console.error("RPC Error:", err.message || JSON.stringify(err));
            console.log("\nIf the RPC is missing (404), you must run this SQL manually in the Dashboard.");
        }
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

apply();
