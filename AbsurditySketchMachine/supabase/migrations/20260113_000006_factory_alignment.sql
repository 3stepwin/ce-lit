-- 20260113_000006_factory_alignment.sql
-- ALIGNMENT: Link internal Factory Jobs specifically to User Sketches
-- DATE: 2026-01-13

ALTER TABLE public.celit_jobs 
ADD COLUMN IF NOT EXISTS sketch_id UUID REFERENCES public.sketches(id) ON DELETE CASCADE;

-- Also ensured celit_jobs reflects full Stage 1-9 provenance
ALTER TABLE public.celit_jobs
ADD COLUMN IF NOT EXISTS prompt_fragments JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Link logic in webhook
CREATE OR REPLACE FUNCTION public.sync_job_to_sketch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeed' AND NEW.sketch_id IS NOT NULL THEN
    UPDATE public.sketches
    SET 
        status = 'complete',
        video_url = NEW.result_video_url,
        generation_progress = 100,
        completed_at = NOW()
    WHERE id = NEW.sketch_id;
  ELSIF NEW.status = 'failed' AND NEW.sketch_id IS NOT NULL THEN
    UPDATE public.sketches
    SET 
        status = 'failed',
        error_message = (NEW.raw_payload->>'error')
    WHERE id = NEW.sketch_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_job_to_sketch ON public.celit_jobs;
CREATE TRIGGER trg_sync_job_to_sketch
AFTER UPDATE OF status ON public.celit_jobs
FOR EACH ROW EXECUTE FUNCTION public.sync_job_to_sketch();
