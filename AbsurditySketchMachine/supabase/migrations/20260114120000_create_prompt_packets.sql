
-- Create image_prompt_packets table
CREATE TABLE IF NOT EXISTS public.image_prompt_packets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vector TEXT NOT NULL, -- 'WORK', 'LIFE', 'FEED'
    json_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create video_prompt_packets table
CREATE TABLE IF NOT EXISTS public.video_prompt_packets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vector TEXT NOT NULL, -- 'WORK', 'LIFE', 'FEED'
    json_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.image_prompt_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_prompt_packets ENABLE ROW LEVEL SECURITY;

-- Create Policies (Read-only for anon/authenticated is fine for now, or service_role only)
CREATE POLICY "Enable read access for all users" ON public.image_prompt_packets
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.video_prompt_packets
    FOR SELECT USING (true);
    
-- Insert some dummy data for testing
INSERT INTO public.image_prompt_packets (vector, json_payload) VALUES
('WORK', '{"subject": "Disgruntled employee", "action": "staring at void", "setting": "Cubicle farm", "camera": "Security CCTV", "meta_tokens": ["fluorescent", "despair"]}'),
('LIFE', '{"subject": "Civilian", "action": "waiting in line", "setting": "Government office", "camera": "Handheld", "meta_tokens": ["queue", "forms"]}'),
('FEED', '{"subject": "Influencer", "action": "screaming silently", "setting": "Green screen room", "camera": "Ring light", "meta_tokens": ["viral", "broadcast"]}');

INSERT INTO public.video_prompt_packets (vector, json_payload) VALUES
('WORK', '{"motion_type": "Static to zoom", "camera_move": "Slow push", "subject_action": "Blink once", "duration": 5}'),
('LIFE', '{"motion_type": "Shaky cam", "camera_move": "Pan left", "subject_action": "Sighing", "duration": 5}'),
('FEED', '{"motion_type": "Glitch cut", "camera_move": "Zoom snap", "subject_action": "Loop smile", "duration": 5}');
