-- Final Alignment for Sketches Table
-- Fixes missing prompt_final and ensures naming consistency

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS prompt_final TEXT,
ADD COLUMN IF NOT EXISTS final_video_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT; -- Fallback for existing Novita logic
