-- 20260115_seed_bank_reference_sync.sql
-- MIGRATION: Populate Reference Seed Bank Tables
-- This aligns viral_seed_bank and scene_templates with the production data

-- 1. Ensure tables exist with correct columns if they were somehow dropped or missing
CREATE TABLE IF NOT EXISTS public.viral_seed_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT,
    premise TEXT NOT NULL,
    role TEXT DEFAULT 'MAIN_PERFORMER',
    sketch_type TEXT DEFAULT 'fake_commercial',
    weight INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scene_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting TEXT NOT NULL,
    camera_grammar TEXT,
    sound_grammar TEXT,
    subtitle_style TEXT,
    props TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seed_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID,
    premise_id UUID REFERENCES public.viral_seed_bank(id),
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Populate viral_seed_bank from celit_premises (The "Reference Sync")
INSERT INTO public.viral_seed_bank (id, category, premise, role, sketch_type, weight)
SELECT id, category, premise, role_hint, sketch_type, weight
FROM public.celit_premises
ON CONFLICT (id) DO NOTHING;

-- 3. Populate scene_templates from celit_scene_bank
INSERT INTO public.scene_templates (id, setting, camera_grammar, sound_grammar, subtitle_style, props)
SELECT id, setting, camera_grammar, sound_grammar, subtitle_style, props
FROM public.celit_scene_bank
ON CONFLICT (id) DO NOTHING;

-- 4. Add some NEW "Master Seeds" for the reference library
INSERT INTO public.viral_seed_bank (category, sketch_type, role, premise, weight)
VALUES
('WORK_VECTOR', 'orientation', 'Department Head', 'A welcome video explaining that the physical office is a holographic projection to save on HVAC costs.', 20),
('LIFE_VECTOR', 'security_notice', 'Automated Voice', 'A message confirming that your sleep was recorded as a "voluntary performance" for the system.', 19),
('FEED_VECTOR', 'breaking_news', 'News Anchor', 'Live coverage of a trend that involves everyone standing perfectly still until further instruction.', 19),
('WORK_VECTOR', 'compliance_portal', 'System Narrator', 'Warning: High levels of autonomous thought detected in your recent typing patterns. Please recalibrate.', 18)
ON CONFLICT DO NOTHING;

-- 5. Add some NEW "Master Scenes"
INSERT INTO public.scene_templates (setting, camera_grammar, sound_grammar, subtitle_style, props)
VALUES
('Endless white void with a single desk', 'Macro closeups of white stationery', 'High-pitched sine wave hum', 'Vertical red text on left side', 'White pen, white paper, white phone'),
('Grainy CCTV view of a public laundry mat at 3am', 'Static top-down angle', 'Industrial dryer clanking', 'Yellow security-cam font', 'Single red sock, flickering detergent machine')
ON CONFLICT DO NOTHING;
