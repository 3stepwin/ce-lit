
-- 1. Add missing column to celit_jobs
ALTER TABLE public.celit_jobs ADD COLUMN IF NOT EXISTS screenshot_frame_text TEXT;

-- 2. Update existing data in prompt packets to use _VECTOR suffix to match new frontend types
UPDATE public.image_prompt_packets SET vector = 'WORK_VECTOR' WHERE vector = 'WORK';
UPDATE public.image_prompt_packets SET vector = 'LIFE_VECTOR' WHERE vector = 'LIFE';
UPDATE public.image_prompt_packets SET vector = 'FEED_VECTOR' WHERE vector = 'FEED';

UPDATE public.video_prompt_packets SET vector = 'WORK_VECTOR' WHERE vector = 'WORK';
UPDATE public.video_prompt_packets SET vector = 'LIFE_VECTOR' WHERE vector = 'LIFE';
UPDATE public.video_prompt_packets SET vector = 'FEED_VECTOR' WHERE vector = 'FEED';

-- 3. Ensure some data exists if somehow deleted
INSERT INTO public.image_prompt_packets (vector, json_payload)
SELECT 'WORK_VECTOR', '{"subject": "Unit 734", "action": "processing void forms", "setting": "Infinite Cubicle Array", "camera": "Security CCTV", "meta_tokens": ["fluorescent", "liminal"]}'
WHERE NOT EXISTS (SELECT 1 FROM public.image_prompt_packets WHERE vector = 'WORK_VECTOR');

INSERT INTO public.video_prompt_packets (vector, json_payload)
SELECT 'WORK_VECTOR', '{"motion_type": "Slow Zoom", "camera_move": "Push In", "subject_action": "Stare at camera", "duration": 5}'
WHERE NOT EXISTS (SELECT 1 FROM public.video_prompt_packets WHERE vector = 'WORK_VECTOR');
