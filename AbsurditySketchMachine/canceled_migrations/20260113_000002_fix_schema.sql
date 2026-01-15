-- 20260113_000002_fix_schema.sql
-- MIGRATION: Rename scripts -> sketches & Add Compatibility View
-- AUTHOR: User / Antigravity
-- DATE: 2026-01-13

-- 1) Rename the table scripts -> sketches
BEGIN;
ALTER TABLE public.scripts RENAME TO sketches;
COMMIT;

-- 2) Create a compatibility VIEW named scripts
-- This keeps any "old" code or Edge Functions that read from scripts alive.
CREATE OR REPLACE VIEW public.scripts AS
SELECT
  id,
  user_id,
  topic,
  script_text,
  style_preset,
  status,
  created_at,
  updated_at
FROM public.sketches;

-- 3) Fix shots foreign key to reference sketches
DO $$
DECLARE
  fk_name text;
BEGIN
  -- Find the existing FK constraint name for scripts
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
   AND ccu.table_schema = tc.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'shots'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'script_id'
    AND ccu.table_name = 'scripts'
  LIMIT 1;

  -- Drop it if found
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.shots DROP CONSTRAINT %I', fk_name);
  END IF;
END$$;

-- Add the new FK referencing sketches
ALTER TABLE public.shots
  ADD CONSTRAINT shots_script_id_fkey
  FOREIGN KEY (script_id)
  REFERENCES public.sketches(id)
  ON DELETE CASCADE;

-- 4) Add indexes for speed
CREATE INDEX IF NOT EXISTS shots_script_id_idx ON public.shots(script_id);
CREATE INDEX IF NOT EXISTS sketches_status_idx ON public.sketches(status);

-- 5) Make the scripts view writable (INSTEAD OF triggers)
-- This ensures any legacy code inserting into 'scripts' still works.
CREATE OR REPLACE FUNCTION public.scripts_view_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.sketches (id, user_id, topic, script_text, style_preset, status, created_at, updated_at)
    VALUES (
      COALESCE(NEW.id, gen_random_uuid()),
      NEW.user_id,
      NEW.topic,
      NEW.script_text,
      NEW.style_preset,
      COALESCE(NEW.status, 'queued'),
      COALESCE(NEW.created_at, NOW()),
      COALESCE(NEW.updated_at, NOW())
    )
    RETURNING * INTO NEW;
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.sketches SET
      user_id = COALESCE(NEW.user_id, user_id),
      topic = COALESCE(NEW.topic, topic),
      script_text = COALESCE(NEW.script_text, script_text),
      style_preset = COALESCE(NEW.style_preset, style_preset),
      status = COALESCE(NEW.status, status),
      updated_at = NOW()
    WHERE id = OLD.id
    RETURNING * INTO NEW;
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.sketches WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS scripts_view_write_trg ON public.scripts;

CREATE TRIGGER scripts_view_write_trg
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.scripts
FOR EACH ROW EXECUTE FUNCTION public.scripts_view_write();
