-- Final Alignment for Sketches Table
-- Fixes missing prompt_final and ensures naming consistency

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS prompt_final TEXT;

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS final_video_url TEXT;

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS provider_selected TEXT;

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS higgs_task_id TEXT;

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS higgs_assets JSONB;

ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS cinema_lane BOOLEAN DEFAULT false;
