
-- Fix for Celit Jobs Schema Mismatch
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE public.celit_jobs 
ADD COLUMN IF NOT EXISTS content text, 
ADD COLUMN IF NOT EXISTS screenshot_frame_text text,
-- Ensure these exist just in case (though one job had them)
ADD COLUMN IF NOT EXISTS image_prompt_json jsonb,
ADD COLUMN IF NOT EXISTS video_prompt_json jsonb;

-- Also verify Sketches table has error_message (from exec-sql)
ALTER TABLE public.sketches ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.celit_jobs ADD COLUMN IF NOT EXISTS error_message text;
