-- ═══════════════════════════════════════════════════════════════
-- ABSURDITY AI SKETCH MACHINE - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ───────────────────────────────────────────────────────────────
-- PROFILES TABLE (extends auth.users)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile info
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Face model
  face_model_id TEXT,
  face_model_status TEXT DEFAULT 'pending' 
    CHECK (face_model_status IN ('pending', 'processing', 'ready', 'failed')),
  
  -- Guest/Auth
  is_guest BOOLEAN DEFAULT false,
  
  -- Stats
  total_sketches INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- USER AVATARS TABLE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  type TEXT DEFAULT 'image' CHECK (type IN ('image', 'video')),
  is_primary BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- SKETCHES TABLE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sketches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Sketch config
  sketch_type TEXT NOT NULL,
  role TEXT,
  premise TEXT,
  dialogue TEXT,
  dumbness_level INTEGER DEFAULT 7 CHECK (dumbness_level BETWEEN 1 AND 10),
  
  -- Generation state
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'generating', 'face_swap', 'rendering', 'complete', 'failed', 'generated')),
  generation_progress INTEGER DEFAULT 0 CHECK (generation_progress BETWEEN 0 AND 100),
  error_message TEXT,
  
  -- Generated content (JSONB from Gemini)
  content JSONB,
  meta JSONB,
  
  -- Output
  video_url TEXT,
  video_duration INTEGER,
  thumbnail_url TEXT,
  
  -- Outtakes
  outtakes JSONB DEFAULT '[]'::jsonb,
  
  -- Metrics
  share_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ───────────────────────────────────────────────────────────────
-- CACHED VIDEOS TABLE (local cache tracking)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cached_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sketch_id UUID REFERENCES public.sketches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  local_path TEXT NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- SHOTS TABLE (for granular video generation tracking)
-- ───────────────────────────────────────────────────────────────

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
  external_id TEXT, -- ID from Novita/Higgsfield
  
  -- Assets
  assets JSONB DEFAULT '{}'::jsonb, -- { t2i_url: "...", video_url: "..." }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON public.user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_sketches_user_id ON public.sketches(user_id);
CREATE INDEX IF NOT EXISTS idx_sketches_status ON public.sketches(status);
CREATE INDEX IF NOT EXISTS idx_sketches_created_at ON public.sketches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_videos_sketch_id ON public.cached_videos(sketch_id);

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_videos ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Avatars: Users can manage their own
CREATE POLICY "Users can manage own avatars" ON public.user_avatars
  FOR ALL USING (auth.uid() = user_id);

-- Sketches: Users can manage their own
CREATE POLICY "Users can view own sketches" ON public.sketches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sketches" ON public.sketches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sketches" ON public.sketches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sketches" ON public.sketches
  FOR DELETE USING (auth.uid() = user_id);

-- Cached videos: Users can manage their own
CREATE POLICY "Users can manage own cache" ON public.cached_videos
  FOR ALL USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- AUTO-UPDATE TRIGGERS
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ───────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, is_guest)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Absurdity User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.is_anonymous
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────
-- INCREMENT SKETCH COUNT TRIGGER
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_sketch_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'complete' AND (OLD.status IS NULL OR OLD.status != 'complete') THEN
    UPDATE public.profiles
    SET total_sketches = total_sketches + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_sketch_complete ON public.sketches;
CREATE TRIGGER on_sketch_complete
  AFTER INSERT OR UPDATE ON public.sketches
  FOR EACH ROW EXECUTE FUNCTION public.increment_sketch_count();

-- ───────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (run these in Dashboard > Storage)
-- ───────────────────────────────────────────────────────────────

-- Create bucket: user_avatars
-- Public: Yes
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, video/mp4

-- Create bucket: sketch_videos  
-- Public: Yes
-- File size limit: 100MB
-- Allowed MIME types: video/mp4, video/webm

-- Create bucket: thumbnails
-- Public: Yes
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
