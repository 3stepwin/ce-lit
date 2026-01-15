
-- COMBINED MIGRATION: Schema Upgrades + Function Fixes
-- Generated: 2026-01-14

-- 1. FIX celit_jobs SCHEMA
ALTER TABLE celit_jobs 
ADD COLUMN IF NOT EXISTS vector TEXT,
ADD COLUMN IF NOT EXISTS seed_id UUID,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_frame_text TEXT,
ADD COLUMN IF NOT EXISTS provider_lane TEXT,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS stage_timestamps JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS error JSONB;

ALTER TABLE celit_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON celit_jobs
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON celit_jobs
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on id" ON celit_jobs
    FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_celit_jobs_status ON celit_jobs(status);
CREATE INDEX IF NOT EXISTS idx_celit_jobs_id ON celit_jobs(id);


-- 2. FIX get_random_seed RPC (Ambiguous Column Fix)
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
    LEFT JOIN scene_templates s ON true -- Random scene pairing
    WHERE 
        (p_category = p.category OR p_category IS NULL)
        AND p.id NOT IN (
            SELECT premise_id 
            FROM seed_usage 
            WHERE session_id = p_session_id 
            ORDER BY used_at DESC 
            LIMIT p_avoid_last
        )
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_random_seed(text, uuid, integer) TO anon, authenticated;
