-- ==========================================
-- CULT ENGINE SCHEMA MIGRATION
-- Orchestration Layer for Multi-Shot Explainer Videos
-- ==========================================

-- 1. SCRIPTS TABLE
create table if not exists public.scripts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    topic text not null,
    script_text text,
    style_preset text default 'default',
    status text default 'generating_script', -- states: generating_script, generating_audio, generating_visuals, assembling, complete, failed
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.scripts enable row level security;
create policy "Users can view and update own scripts"
  on public.scripts for all
  using (auth.uid() = user_id);

-- 2. SHOTS TABLE
create table if not exists public.shots (
    id uuid default gen_random_uuid() primary key,
    script_id uuid references public.scripts(id) on delete cascade not null,
    sequence_index int not null,
    visual_prompt text,
    motion_prompt text,
    duration float default 4.0,
    status text default 'pending', -- states: pending, t2i_processing, i2v_processing, done, failed
    assets jsonb default '{}'::jsonb, -- stores { t2i_url, t2i_task_id, video_url, video_task_id, ... }
    model_config jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.shots enable row level security;
create policy "Users can view and update own shots"
  on public.shots for all
  using (
    exists (
      select 1 from public.scripts
      where public.scripts.id = shots.script_id
      and public.scripts.user_id = auth.uid()
    )
  );

-- 3. AUDIO ASSETS TABLE
create table if not exists public.audio_assets (
    id uuid default gen_random_uuid() primary key,
    script_id uuid references public.scripts(id) on delete cascade not null,
    asset_type text check (asset_type in ('narration', 'music', 'sfx')),
    url text not null,
    duration float,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.audio_assets enable row level security;
create policy "Users can view and update own audio assets"
  on public.audio_assets for all
  using (
    exists (
      select 1 from public.scripts
      where public.scripts.id = audio_assets.script_id
      and public.scripts.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_shots_script_id on public.shots(script_id);
create index if not exists idx_audio_assets_script_id on public.audio_assets(script_id);
