-- 20260114000004_fix_seed_ambiguity.sql
-- FIX: "Ambiguous column reference" in get_random_seed RPC
-- DATE: 2026-01-14

create or replace function public.get_random_seed(
  p_category text default null,          -- work/feed/life/random/null
  p_session_id text default null,        -- optional
  p_avoid_last integer default 6         -- how many recent session seeds to avoid
)
returns table (
  premise_id uuid,
  scene_id uuid,
  category text,
  sketch_type text,
  role text,
  premise text,
  scene jsonb
)
language plpgsql
as $$
declare
  v_premise record;
  v_scene record;
begin
  -- Pick premise: weighted, avoid recently used, avoid session repeats
  -- FIX: Aliased selected column to avoid conflict with output parameter 'premise_id'
  with recent as (
    select r.premise_id as recent_pid
    from public.celit_seed_runs r
    where p_session_id is not null
      and r.session_id = p_session_id
      and r.premise_id is not null
    order by r.created_at desc
    limit p_avoid_last
  ),
  candidates as (
    select
      p.*,
      -- decay score if used recently (last_used_at within 60 minutes)
      case
        when p.last_used_at is null then 1.0
        when p.last_used_at < now() - interval '6 hours' then 1.0
        when p.last_used_at < now() - interval '60 minutes' then 0.7
        else 0.25
      end as recency_factor
    from public.celit_premises p
    where p.active = true
      and (p_category is null or p.category = p_category)
      and (p_session_id is null or p.id not in (select recent_pid from recent))
  )
  select *
  into v_premise
  from candidates
  order by random() * (weight * recency_factor) desc
  limit 1;

  if v_premise.id is null then
    -- Fallback: If filtered too aggressively, try again without recency/history filter
    -- or just raise exception. For now, raise exception but clearer.
    raise exception 'No active premises available for category %', p_category;
  end if;

  -- Pick scene: weighted, avoid recently used
  with candidates as (
    select
      s.*,
      case
        when s.last_used_at is null then 1.0
        when s.last_used_at < now() - interval '6 hours' then 1.0
        when s.last_used_at < now() - interval '60 minutes' then 0.7
        else 0.25
      end as recency_factor
    from public.celit_scene_bank s
    where s.active = true
  )
  select *
  into v_scene
  from candidates
  order by random() * (weight * recency_factor) desc
  limit 1;

  if v_scene.id is null then
    raise exception 'No active scenes available';
  end if;

  -- Assign to output variables
  premise_id := v_premise.id;
  scene_id := v_scene.id;
  category := v_premise.category;
  sketch_type := v_premise.sketch_type;
  role := coalesce(v_premise.role_hint, 'MAIN_PERFORMER');
  premise := v_premise.premise;

  scene := jsonb_build_object(
    'scene_archetype', v_scene.scene_archetype,
    'setting', v_scene.setting,
    'camera_grammar', v_scene.camera_grammar,
    'sound_grammar', v_scene.sound_grammar,
    'subtitle_style', v_scene.subtitle_style,
    'props', v_scene.props
  );

  return next;
end $$;

grant execute on function public.get_random_seed(text, text, integer) to anon, authenticated;
