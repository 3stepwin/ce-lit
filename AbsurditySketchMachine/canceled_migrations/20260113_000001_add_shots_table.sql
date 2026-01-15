-- Add shots table for granular video generation tracking
CREATE TABLE IF NOT EXISTS public.shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sketch_id UUID REFERENCES public.sketches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Content
  visual_prompt TEXT,
  audio_prompt TEXT,
  motion_prompt TEXT,
  duration FLOAT DEFAULT 3.0,

  -- State
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 't2i_processing', 't2i_completed', 't2i_failed', 'i2v_pending', 'i2v_processing', 'i2v_completed', 'i2v_failed')),
  external_id TEXT,

  -- Assets
  assets JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster status queries
CREATE INDEX IF NOT EXISTS idx_shots_status ON public.shots(status);
