alter table public.sketches
  add column if not exists cinema_lane boolean default false,
  add column if not exists provider_selected text,
  add column if not exists higgs_task_id text,
  add column if not exists higgs_assets jsonb;
