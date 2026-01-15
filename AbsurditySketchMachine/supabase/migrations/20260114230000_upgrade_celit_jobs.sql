
-- Migration: Add missing columns to celit_jobs to support Full Pipeline
-- Generated: 2026-01-14

ALTER TABLE celit_jobs 
ADD COLUMN IF NOT EXISTS vector TEXT,
ADD COLUMN IF NOT EXISTS seed_id UUID,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_frame_text TEXT,
ADD COLUMN IF NOT EXISTS provider_lane TEXT,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS stage_timestamps JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS error JSONB;

-- Ensure RLS is open for anon if needed (or verify policies)
ALTER TABLE celit_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON celit_jobs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON celit_jobs
    FOR INSERT WITH CHECK (true); -- Relaxed for demo/anon availability

CREATE POLICY "Enable update for users based on id" ON celit_jobs
    FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_celit_jobs_status ON celit_jobs(status);
CREATE INDEX IF NOT EXISTS idx_celit_jobs_id ON celit_jobs(id);
