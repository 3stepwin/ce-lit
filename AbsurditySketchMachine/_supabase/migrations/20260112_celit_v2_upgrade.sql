-- CELIT v2.0 "ALL OUT +" Schema Upgrade
-- Run this in your Supabase SQL Editor to enable the new viral features.

-- 1. Enable new fields for the Sketch engine
ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS dumbness_level INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS external_id TEXT, -- Higgsfield Job ID
ADD COLUMN IF NOT EXISTS aesthetic_preset TEXT DEFAULT 'prestige_clean',
ADD COLUMN IF NOT EXISTS pattern_interrupt_type TEXT;

-- 2. Ensure content is JSONB (it likely is, but good to verify)
-- This allows us to store the deep 'retention_plan' and 'outtakes' structures
-- ALTER TABLE public.sketches ALTER COLUMN content TYPE JSONB;

-- 3. Add index for faster queries on role/preset
CREATE INDEX IF NOT EXISTS idx_sketches_role ON public.sketches(role);
CREATE INDEX IF NOT EXISTS idx_sketches_aesthetic ON public.sketches(aesthetic_preset);

-- 4. Safety: Encrypted columns for sensitive data (Optional/Future)
-- For now, we store generated artifacts publicly as they are viral content.

COMMENT ON COLUMN public.sketches.dumbness_level IS 'User-controlled absurdity setting (1-10)';
COMMENT ON COLUMN public.sketches.external_id IS 'Job ID from Higgsfield/Veo video generator';
