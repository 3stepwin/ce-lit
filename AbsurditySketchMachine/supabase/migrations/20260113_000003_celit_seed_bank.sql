-- 20260113_000003_celit_seed_bank.sql
-- MIGRATION: Add Celit Seed Bank (Premises + Scenes) & RPCs
-- AUTHOR: User / Antigravity
-- DATE: 2026-01-13

-- =========================================
-- CE LIT SEED BANK (NO-PROMPT REQUIRED)
-- =========================================

-- 1) Premise Bank: high-quality, curated "job seeds"
create table if not exists public.celit_premises (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  active boolean not null default true,
  category text not null default 'random',            -- work | feed | life | random
  sketch_type text not null default 'fake_commercial',
  role_hint text,                                    -- optional: "HR compliance officer"
  premise text not null,                             -- 1-2 sentences, no user input needed

  weight integer not null default 10,                -- higher = more likely
  last_used_at timestamptz                           -- global anti-repeat baseline
);

create index if not exists idx_celit_premises_active on public.celit_premises(active);
create index if not exists idx_celit_premises_category on public.celit_premises(category);
create index if not exists idx_celit_premises_last_used on public.celit_premises(last_used_at);

-- 2) Scene Bank: recognizable "cinema grammar" without copying movies
create table if not exists public.celit_scene_bank (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  active boolean not null default true,
  scene_archetype text not null,                     -- e.g. "interrogation_room", "news_desk", "onboarding_video"
  setting text not null,
  camera_grammar text not null,
  sound_grammar text not null,
  subtitle_style text not null,
  props text,

  weight integer not null default 10,
  last_used_at timestamptz
);

create index if not exists idx_celit_scene_active on public.celit_scene_bank(active);
create index if not exists idx_celit_scene_archetype on public.celit_scene_bank(scene_archetype);
create index if not exists idx_celit_scene_last_used on public.celit_scene_bank(last_used_at);

-- 3) Seed Runs: optional per-session anti-repeat (UI can pass a session_id)
create table if not exists public.celit_seed_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  session_id text,               -- optional: browser session id
  premise_id uuid references public.celit_premises(id) on delete set null,
  scene_id uuid references public.celit_scene_bank(id) on delete set null
);

create index if not exists idx_celit_seed_runs_session on public.celit_seed_runs(session_id);

-- =========================================
-- Trigger to update updated_at timestamps
-- =========================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_premises on public.celit_premises;
create trigger trg_touch_premises
before update on public.celit_premises
for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_scenes on public.celit_scene_bank;
create trigger trg_touch_scenes
before update on public.celit_scene_bank
for each row execute function public.touch_updated_at();

-- =========================================
-- RPC 1: get_random_seed
-- Returns a curated premise + a scene pack.
-- Weighting favors high-weight rows and avoids recently used.
-- Optionally avoids last N used in the same session_id.
-- =========================================
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
  with recent as (
    select premise_id
    from public.celit_seed_runs
    where p_session_id is not null
      and session_id = p_session_id
      and premise_id is not null
    order by created_at desc
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
      and (p_session_id is null or p.id not in (select premise_id from recent))
  )
  select *
  into v_premise
  from candidates
  order by random() * (weight * recency_factor) desc
  limit 1;

  if v_premise.id is null then
    raise exception 'No active premises available';
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

-- =========================================
-- RPC 2: mark_seed_used
-- Writes run record + updates last_used_at for anti-repeat.
-- =========================================
create or replace function public.mark_seed_used(
  p_premise_id uuid,
  p_scene_id uuid,
  p_session_id text default null
)
returns void
language plpgsql
as $$
begin
  insert into public.celit_seed_runs(session_id, premise_id, scene_id)
  values (p_session_id, p_premise_id, p_scene_id);

  update public.celit_premises
  set last_used_at = now()
  where id = p_premise_id;

  update public.celit_scene_bank
  set last_used_at = now()
  where id = p_scene_id;
end $$;

grant execute on function public.mark_seed_used(uuid, uuid, text) to anon, authenticated;

-- =========================================
-- Starter Premises (20) — No typing required
-- =========================================
insert into public.celit_premises (category, sketch_type, role_hint, premise, weight)
values
('work','orientation','HR compliance officer','A mandatory onboarding trailer that calmly reveals your role was fulfilled before you arrived, and opting out was only possible prior to watching.',15),
('work','customer_support','support agent','A customer support call where the agent politely confirms your refund was processed before you asked, and escalation is “not recommended.”',15),
('feed','breaking_news','news anchor','A breaking news alert that slowly turns into a mandatory enrollment announcement while the anchor remains deadpan and procedural.',14),
('life','fake_commercial','spokesperson','A luxury commercial for a subscription that enrolls you automatically, thanking you for “continued viewing.”',14),
('work','system_status','systems administrator','A calm system status update that declares everything normal, then quietly states: “You are included.”',13),
('life','checklist','intake coordinator','A calm checklist voice asks you to confirm harmless items until it lands on: “You are still here.”',13),
('feed','apology_statement','influencer','An apology statement that references an incident scheduled for later, and thanks the viewer for “cooperation.”',12),
('work','corporate_psa','training narrator','A corporate safety PSA that treats emotional distress as a compliance issue and provides a “resolution window.”',12),
('life','security_notice','security officer','A security notice announcing your presence has been recorded as acceptance, and the process is “currently active.”',12),
('feed','documentary','documentary narrator','A prestige documentary trailer that reveals the cult is just a SaaS product and the viewer is already subscribed.',12),

('random','fake_commercial','brand representative','A pristine ad that becomes a terms-and-conditions ritual without changing tone or lighting.',11),
('random','customer_support','support agent','A support call where the hold music becomes a policy announcement and the ticket closes itself.',11),
('random','breaking_news','news anchor','A live report that switches graphics to “WELCOME” while the anchor never acknowledges it.',11),
('random','orientation','HR compliance officer','An onboarding video with title cards that promise clarity, then replace every answer with procedure.',11),
('work','meeting_ritual','project lead','A project kickoff meeting where the KPI is “devotion,” and the minutes are already finalized.',10),
('life','receipt_notice','clerical officer','A formal receipt prints itself for a service you didn’t request, stamped IRREVOCABLE.',10),
('feed','algorithm_worship','content moderator','A calm explanation of why the feed demands sacrifice, presented as standard policy.',10),
('life','cancellation_ritual','account specialist','A cancellation flow that treats leaving as an exception requiring evidence and witnesses.',10),
('work','compliance_portal','portal narrator','A compliance portal that congratulates you for completion before you start.',10),
('feed','terms_update','announcer','A short announcement that the terms updated while you watched, and acceptance is assumed.',10)
on conflict do nothing;

-- =========================================
-- Starter Scene Bank (20) — “Recognizable grammar”
-- =========================================
insert into public.celit_scene_bank (scene_archetype, setting, camera_grammar, sound_grammar, subtitle_style, props, weight)
values
('onboarding_video','Beige corporate training room, fluorescent hum','Static tripod, slow push-in, clean framing, title-card inserts','HVAC room tone, soft corporate music bed, brief silence before interrupt','Clean institutional lower-thirds, minimal, high-contrast','Clipboard, badge lanyard, training binder',15),
('customer_support_call','Neutral call center desk, muted monitors','Locked medium shot, occasional cut to keyboard, slow zoom at key line','Hold music wash, headset mic realism, subtle click sounds','Subtitles that remain calm while meaning turns','Headset, ticketing UI, “Request Closed” stamp',15),
('news_desk','Broadcast studio, crisp graphics','Two-camera broadcast grammar, hard cuts, lower-third changes','News bed, stingers, calm anchor mic','LIVE bug + chyron swaps to WELCOME','Teleprompter, red tally light',14),
('luxury_ad','Glass atrium / premium showroom','Cinematic dolly, macro cuts, slow-motion product shots','Soft piano + riser, pristine foley','Minimal big text overlays','Perfume bottle / box / subscription kit',14),
('compliance_portal','Sterile hallway leading to a kiosk','Centered symmetrical framing, slow walk-up, one sharp cut','Low hum, confirmation beeps','Portal-style disclaimer text','Kiosk, QR scanner, receipt printer',13),
('interrogation_room','Plain room, single table, harsh overhead','Locked wide, slow push-in, cutaways to forms','Buzzing light, pen scratches, silence beat','Official captions with docket numbers','Form stack, stamp pad, file folder',13),
('documentary_prestige','Moody interview setup, soft key light','Slow push, shallow depth, archival inserts','Prestige drone, warm narration bed','Elegant serif title cards','Old footage monitors, reel icons',12),
('found_footage_training','VHS training tape vibe, dated room','Slight jitter, timecode overlay, hard cuts','Audio warble, tape hiss','Blocky VHS captions','Warning labels, “DO NOT REWIND” frame',12),
('liminal_hallway','Empty office corridor, soft haze','Long take, slow drift, no whip pans','Bare room tone, distant footsteps','Sparse captions, centered','Exit signs, flickering panel',12),
('security_notice','Lobby security desk, camera feeds','Surveillance angles, occasional push','Radio chatter, soft alarm ping','Red alert banner style','CCTV screens, badge reader',12),

('meeting_ritual','Conference room, whiteboard, muted faces','Table-level wide, cut to slides, slow zoom','Projector fan, muted keyboard clicks','Corporate slide captions','Agenda slide: “Devotion” KPI',10),
('receipt_printer','Small administrative office','Macro on printer, cut to stamp, return to face','Printer whirr, stamp thud','Receipt typography, bold headings','IRREVOCABLE stamp, thermal paper',10),
('airport_announcement','Terminal gate seating, PA speaker','Wide establishing, cut to speaker, slow pan','PA reverb, crowd murmur','Official announcement captions','Gate sign, boarding pass scanner',10),
('therapy_intake','Intake office, calm chair','Gentle handheld, soft close-ups','Ambient calm, pen foley','Soft captions, form labels','Intake clipboard, checkbox list',10),
('hoa_violation','Suburban office window, letterhead','Static frame, insert to letter, stamp','Paper rustle, calm VO','Letterhead captions','Violation notice, mailbox insert',10),
('courtroom_formality','Neutral courtroom bench','Symmetry framing, slow push','Gavel tap, quiet room tone','Docket-style captions','Docket sheet, seal stamp',10),
('algorithm_room','Moderation space, sterile screens','Locked medium, insert to graphs','UI beeps, soft buzz','System alerts captions','Trend graphs, “normal” status bar',10),
('pharma_disclaimer','Bright clinical set, smiling calm','Clean ad grammar, product inserts','Sunny music, disclaimer VO ramps','Rapid disclaimer captions but legible','Pill bottle, compliance badge',10),
('bodycam_procedural','Neutral hallway, bodycam angle','Shaky but controlled, quick cuts','Radio, footsteps, clipped VO','Bodycam timestamp overlay','Badge, procedural commands',10),
('prestige_trailer_titles','Black title cards + premium b-roll','Cinematic inserts, hard cuts, rhythmic pacing','Risers, hits, silence beat','A24-ish minimal titles','Title card words: “ENROLLED”',10)
on conflict do nothing;
