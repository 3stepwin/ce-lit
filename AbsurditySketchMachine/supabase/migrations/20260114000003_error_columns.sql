
-- Migration: Add error reporting columns
ALTER TABLE public.sketches ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.celit_jobs ADD COLUMN IF NOT EXISTS error_message text;

-- Ensure RLS is updated for these columns (though usually implicit)
GRANT SELECT, UPDATE, INSERT ON TABLE public.sketches TO authenticated, anon;
GRANT SELECT, UPDATE, INSERT ON TABLE public.celit_jobs TO authenticated, anon;
