-- CE LIT Master Fix Migration (Reference Fix)
-- Aligns schema with the "Factory" pipeline (Stage 0 -> Stage 9)
-- Includes 20260112 updates and ensures SKETCHES exists.
-- FIX: Reference auth.users instead of missing profiles.

-- 1. Ensure SKETCHES table exists (Dependency for SHOTS)
CREATE TABLE IF NOT EXISTS public.sketches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    
    -- Core fields
    sketch_type TEXT,
    premise TEXT,
    role TEXT,
    title TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    generation_progress INTEGER DEFAULT 0
);

-- 2. Clean up conflicting "Scripts" table (from v2 docu schema)
DROP TABLE IF EXISTS public.scripts CASCADE;

-- 3. Clean/Rebuild SHOTS table to link to SKETCHES
DROP TABLE IF EXISTS public.shots;

CREATE TABLE public.shots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sketch_id UUID REFERENCES public.sketches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content (Stage 4 Fanout)
    visual_prompt TEXT,
    audio_prompt TEXT,
    motion_prompt TEXT,
    dialogue_text TEXT,
    duration FLOAT DEFAULT 3.0,
    
    -- State
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    external_id TEXT, -- Provider Task ID
    assets JSONB DEFAULT '{}'::jsonb, -- { video_url, image_url, ... }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for queue workers
CREATE INDEX IF NOT EXISTS idx_shots_sketch_id ON public.shots(sketch_id);
CREATE INDEX IF NOT EXISTS idx_shots_status ON public.shots(status);

-- 4. Upgrade SKETCHES table for Stage 1-9 Storage
-- Consolidated columns from all pending migrations
ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS script_json JSONB DEFAULT '{}'::jsonb,      -- Stage 2: Writer JSON
ADD COLUMN IF NOT EXISTS directive JSONB DEFAULT '{}'::jsonb,       -- Stage 3: Authoritative Directive
ADD COLUMN IF NOT EXISTS prompt_fragments JSONB DEFAULT '{}'::jsonb, -- Stage 1: Provenance
ADD COLUMN IF NOT EXISTS artifact_url TEXT,                         -- Stage 8: The "Receipt"
ADD COLUMN IF NOT EXISTS outtakes JSONB DEFAULT '{}'::jsonb,        -- Stage 9: Outtakes

-- From 20260112v2
ADD COLUMN IF NOT EXISTS dumbness_level INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS aesthetic_preset TEXT DEFAULT 'prestige_clean',
ADD COLUMN IF NOT EXISTS pattern_interrupt_type TEXT;

-- 5. RLS Policies
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sketches ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'shots' AND policyname = 'Users can view own shots'
    ) THEN
        CREATE POLICY "Users can view own shots" ON public.shots
            FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
         SELECT 1 FROM pg_policies WHERE tablename = 'sketches' AND policyname = 'Users can view own sketches'
    ) THEN
        CREATE POLICY "Users can view own sketches" ON public.sketches
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
