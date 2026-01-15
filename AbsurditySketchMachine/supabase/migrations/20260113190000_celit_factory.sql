-- =========================================
-- CE LIT FACTORY: Core Tables
-- =========================================

create table if not exists public.celit_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'queued',          -- queued | running | succeed | failed
  sketch_type text not null,
  premise text not null,
  role text,
  provider text not null default 'novita',
  task_id text,
  prompt_fragments jsonb not null default '{}'::jsonb,
  prompt_final text,
  result_video_url text,
  raw_payload jsonb
);

create index if not exists idx_celit_jobs_status on public.celit_jobs(status);
create index if not exists idx_celit_jobs_created_at on public.celit_jobs(created_at desc);

-- =========================================
-- CE LIT FACTORY: Normalized Prompt Library
-- =========================================
-- NOTE: Removed 'id_2' reference to fix "column does not exist" error.
-- Utilizing 'id' (cast to text) as the primary source ID.

create or replace view public.prompt_library as
select
  'prompt_portal_cinematic'::text as source_table,
  cast(id as text) as source_id_text,
  'cinematic'::text as category,
  nullif(trim(prompt), '') as content,
  'Prompt Portal Cinematic'::text as source_ref
from public.prompt_portal_cinematic
where nullif(trim(prompt), '') is not null

union all
select
  'prompt_portal_cinematic.10x'::text as source_table,
  cast(id as text) as source_id_text,
  'cinematic_10x'::text as category,
  nullif(trim("10x_prompt"), '') as content,
  'Prompt Portal Cinematic 10x'::text as source_ref
from public.prompt_portal_cinematic
where nullif(trim("10x_prompt"), '') is not null

union all
select
  'ai_video_engine_camera_cinematography'::text as source_table,
  cast(id as text) as source_id_text,
  'camera'::text as category,
  nullif(trim(example_prompt), '') as content,
  'Camera / Cinematography'::text as source_ref
from public.ai_video_engine_camera_cinematography
where nullif(trim(example_prompt), '') is not null

union all
select
  'ai_video_engine_cameraslenses'::text as source_table,
  cast(id as text) as source_id_text,
  'lenses'::text as category,
  nullif(trim(details), '') as content,
  'Cameras & Lenses'::text as source_ref
from public.ai_video_engine_cameraslenses
where nullif(trim(details), '') is not null

union all
select
  'ai_video_engine_directorsref_names'::text as source_table,
  cast(id as text) as source_id_text,
  'director'::text as category,
  nullif(trim(name), '') as content,
  'Director References'::text as source_ref
from public.ai_video_engine_directorsref_names
where nullif(trim(name), '') is not null

union all
select
  'prompt_generators_pg_variety'::text as source_table,
  cast(id as text) as source_id_text,
  coalesce(nullif(trim(category), ''), 'variety') as category,
  nullif(trim(full_prompt), '') as content,
  'PG Variety'::text as source_ref
from public.prompt_generators_pg_variety
where nullif(trim(full_prompt), '') is not null
;

-- =========================================
-- CE LIT FACTORY: RPC to fetch random prompts
-- =========================================

create or replace function public.get_random_prompts(
  p_limit integer default 3,
  p_category text default null
)
returns table (
  source_table text,
  source_id_text text,
  category text,
  content text,
  source_ref text
)
language sql
stable
as $$
  select
    source_table,
    source_id_text,
    category,
    content,
    source_ref
  from public.prompt_library
  where (p_category is null or category = p_category)
  order by random()
  limit p_limit;
$$;

grant execute on function public.get_random_prompts(integer, text) to anon, authenticated;
