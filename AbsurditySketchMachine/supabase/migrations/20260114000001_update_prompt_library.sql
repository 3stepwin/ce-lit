-- Update prompt_library view to include video prompts
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

-- NEW VIDEO SOURCES
union all
select
  'prompt_portal_ai_video'::text as source_table,
  cast(id as text) as source_id_text,
  'video'::text as category,
  nullif(trim(prompt), '') as content,
  'Prompt Portal AI Video'::text as source_ref
from public.prompt_portal_ai_video
where nullif(trim(prompt), '') is not null

union all
select
  'ai_video_engine_ai_video_prompts'::text as source_table,
  cast(id as text) as source_id_text,
  'video'::text as category,
  nullif(trim(prompt), '') as content,
  'AI Video Engine Prompts'::text as source_ref
from public.ai_video_engine_ai_video_prompts
where nullif(trim(prompt), '') is not null

union all
select
  'mega_prompts_database_ai_video'::text as source_table,
  cast(id as text) as source_id_text,
  'video'::text as category,
  nullif(trim(prompt), '') as content,
  'Mega Prompts AI Video'::text as source_ref
from public.mega_prompts_database_ai_video
where nullif(trim(prompt), '') is not null
;
