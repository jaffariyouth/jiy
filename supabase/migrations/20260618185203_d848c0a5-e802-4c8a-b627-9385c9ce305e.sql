
-- 1. Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male','female','prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS date_of_birth date;

-- 2. Helper functions
CREATE OR REPLACE FUNCTION public.profile_age(_user_id uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN dob IS NULL THEN NULL
              ELSE date_part('year', age(dob))::int END
  FROM (SELECT date_of_birth AS dob FROM public.profiles WHERE id = _user_id) t;
$$;

CREATE OR REPLACE FUNCTION public.can_view_audience(
  _user_id uuid, _vis text, _gender text, _min int, _max int
) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p_gender text;
  p_age int;
BEGIN
  IF _vis = 'public' THEN
    IF _gender = 'all' AND _min IS NULL AND _max IS NULL THEN
      RETURN true;
    END IF;
  END IF;
  IF _user_id IS NULL THEN RETURN false; END IF;
  -- admins always pass
  IF public.has_role(_user_id, 'admin'::app_role) THEN RETURN true; END IF;
  SELECT gender INTO p_gender FROM public.profiles WHERE id = _user_id;
  IF _gender IS NOT NULL AND _gender <> 'all' THEN
    IF p_gender IS NULL OR p_gender <> _gender THEN RETURN false; END IF;
  END IF;
  IF _min IS NOT NULL OR _max IS NOT NULL THEN
    p_age := public.profile_age(_user_id);
    IF p_age IS NULL THEN RETURN false; END IF;
    IF _min IS NOT NULL AND p_age < _min THEN RETURN false; END IF;
    IF _max IS NOT NULL AND p_age > _max THEN RETURN false; END IF;
  END IF;
  RETURN true;
END $$;

-- 3. Audience columns on content tables
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS audience_visibility text NOT NULL DEFAULT 'members' CHECK (audience_visibility IN ('public','members')),
  ADD COLUMN IF NOT EXISTS audience_gender text NOT NULL DEFAULT 'all' CHECK (audience_gender IN ('all','male','female')),
  ADD COLUMN IF NOT EXISTS audience_min_age int,
  ADD COLUMN IF NOT EXISTS audience_max_age int;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS audience_visibility text NOT NULL DEFAULT 'members' CHECK (audience_visibility IN ('public','members')),
  ADD COLUMN IF NOT EXISTS audience_gender text NOT NULL DEFAULT 'all' CHECK (audience_gender IN ('all','male','female')),
  ADD COLUMN IF NOT EXISTS audience_min_age int,
  ADD COLUMN IF NOT EXISTS audience_max_age int;

ALTER TABLE public.youth_press_articles
  ADD COLUMN IF NOT EXISTS audience_visibility text NOT NULL DEFAULT 'members' CHECK (audience_visibility IN ('public','members')),
  ADD COLUMN IF NOT EXISTS audience_gender text NOT NULL DEFAULT 'all' CHECK (audience_gender IN ('all','male','female')),
  ADD COLUMN IF NOT EXISTS audience_min_age int,
  ADD COLUMN IF NOT EXISTS audience_max_age int;

ALTER TABLE public.recurring_events
  ADD COLUMN IF NOT EXISTS audience_visibility text NOT NULL DEFAULT 'members' CHECK (audience_visibility IN ('public','members')),
  ADD COLUMN IF NOT EXISTS audience_gender text NOT NULL DEFAULT 'all' CHECK (audience_gender IN ('all','male','female')),
  ADD COLUMN IF NOT EXISTS audience_min_age int,
  ADD COLUMN IF NOT EXISTS audience_max_age int;

-- Back-compat: keep events.is_member_only in sync with audience_visibility
CREATE OR REPLACE FUNCTION public.events_sync_member_only()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.is_member_only := (NEW.audience_visibility = 'members');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS events_sync_member_only ON public.events;
CREATE TRIGGER events_sync_member_only BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.events_sync_member_only();

-- Backfill audience_visibility from existing is_member_only
UPDATE public.events SET audience_visibility = CASE WHEN is_member_only THEN 'members' ELSE 'public' END;

-- 4. Replace SELECT policies

-- EVENTS
DROP POLICY IF EXISTS events_select_public ON public.events;
DROP POLICY IF EXISTS events_select_member_only ON public.events;
CREATE POLICY events_select_public ON public.events FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND audience_visibility = 'public'
    AND audience_gender = 'all'
    AND audience_min_age IS NULL
    AND audience_max_age IS NULL
  );
CREATE POLICY events_select_audience ON public.events FOR SELECT TO authenticated
  USING (
    status = 'published'
    AND public.can_view_audience(auth.uid(), audience_visibility, audience_gender, audience_min_age, audience_max_age)
  );

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "announcements: members read published" ON public.announcements;
CREATE POLICY "announcements: audience read published" ON public.announcements FOR SELECT TO authenticated
  USING (
    status = 'published'
    AND public.can_view_audience(auth.uid(), audience_visibility, audience_gender, audience_min_age, audience_max_age)
  );

-- YOUTH PRESS ARTICLES
DROP POLICY IF EXISTS ypa_select_public_published ON public.youth_press_articles;
CREATE POLICY ypa_select_public_published ON public.youth_press_articles FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND audience_visibility = 'public'
    AND audience_gender = 'all'
    AND audience_min_age IS NULL
    AND audience_max_age IS NULL
  );
CREATE POLICY ypa_select_audience_published ON public.youth_press_articles FOR SELECT TO authenticated
  USING (
    status = 'published'
    AND public.can_view_audience(auth.uid(), audience_visibility, audience_gender, audience_min_age, audience_max_age)
  );

-- RECURRING EVENTS
DROP POLICY IF EXISTS "recurring_events: authenticated read active" ON public.recurring_events;
CREATE POLICY "recurring_events: audience read active" ON public.recurring_events FOR SELECT TO authenticated
  USING (
    is_active = true
    AND public.can_view_audience(auth.uid(), audience_visibility, audience_gender, audience_min_age, audience_max_age)
  );
