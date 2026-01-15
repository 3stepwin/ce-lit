-- Insert default image_prompt_packet
INSERT INTO public.image_prompt_packets (vector, sketch_type, aesthetic_preset, json_payload)
VALUES 
('DEFAULT_VECTOR', 'default', 'default', '{
    "subject": "person",
    "action": "standing",
    "setting": "modern environment",
    "camera": "cinematic shot",
    "style": "photorealistic",
    "meta_tokens": ["DEFAULT"]
}')
ON CONFLICT (sketch_type, aesthetic_preset) DO NOTHING;

-- Insert default video_prompt_packet
INSERT INTO public.video_prompt_packets (vector, sketch_type, aesthetic_preset, motion_profile, json_payload)
VALUES 
('DEFAULT_VECTOR', 'default', 'default', 'cinematic subtle movement', '{
    "motion_type": "cinematic",
    "camera_move": "subtle movement",
    "subject_action": "none",
    "duration": 5,
    "fps": 24
}')
ON CONFLICT (sketch_type, aesthetic_preset) DO NOTHING;
