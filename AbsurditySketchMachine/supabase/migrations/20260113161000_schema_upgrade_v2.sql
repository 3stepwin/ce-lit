-- ═══════════════════════════════════════════════════════════════
-- ABSURDITY AI SKETCH MACHINE - SCHEMA UPGRADE V2.1
-- Adds support for Multi-Agent Orchestration & Documentary Features
-- ═══════════════════════════════════════════════════════════════

-- 1. Extend Sketches for Task Tracking
ALTER TABLE public.sketches 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS generation_progress_meta JSONB DEFAULT '{}'::jsonb;

-- 2. Documentary Feature Tables
CREATE TABLE IF NOT EXISTS public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  topic TEXT NOT NULL,
  style_preset TEXT DEFAULT 'documentary',
  script_text TEXT,
  
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'generating_visuals', 'ready_for_assembly', 'complete', 'failed')),
  
  meta JSONB DEFAULT '{}'::jsonb,
  video_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE NOT NULL,
  sequence_index INTEGER NOT NULL,
  
  visual_prompt TEXT NOT NULL,
  motion_prompt TEXT,
  duration INTEGER DEFAULT 5,
  
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 't2i_processing', 'i2v_pending', 'i2v_processing', 'complete', 'failed')),
  
  external_id TEXT, -- Novita Task ID
  assets JSONB DEFAULT '{}'::jsonb, -- {t2i_url, video_url}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS for new tables
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scripts" ON public.scripts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own shots" ON public.shots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scripts 
      WHERE scripts.id = shots.script_id 
      AND scripts.user_id = auth.uid()
    )
  );

-- 4. Triggers for updated_at
CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shots_updated_at
  BEFORE UPDATE ON public.shots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
