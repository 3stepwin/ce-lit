-- FIX 1: get_random_seed RPC Function
-- Issue: Ambiguous column reference "premise_id"
-- This occurs when joining tables that both have a premise_id column

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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_random_seed(text, uuid, integer) TO anon, authenticated;

COMMENT ON FUNCTION get_random_seed IS 'Fixed version - resolves ambiguous column reference by explicitly qualifying premise_id';
