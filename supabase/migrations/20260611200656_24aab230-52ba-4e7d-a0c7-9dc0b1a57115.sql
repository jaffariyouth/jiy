-- ============================================================
-- Phase 2 — Core JIY Models
-- events, scholar_questions, youth_press_articles
-- ============================================================

-- ----- Enums --------------------------------------------------
CREATE TYPE public.event_status    AS ENUM ('draft', 'published', 'completed', 'cancelled');
CREATE TYPE public.question_status AS ENUM ('pending_triage', 'assigned', 'answered', 'rejected');
CREATE TYPE public.article_status  AS ENUM ('draft', 'in_review', 'published');

-- ============================================================
-- 1. EVENTS
-- ============================================================
CREATE TABLE public.events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  location         text,
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz,
  capacity         integer,
  status           public.event_status NOT NULL DEFAULT 'draft',
  is_member_only   boolean NOT NULL DEFAULT false,
  cover_image_url  text,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT                         ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL                            ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Validation trigger (immutable-safe; CHECK with now() is disallowed)
CREATE OR REPLACE FUNCTION public.events_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at <= NEW.starts_at THEN
    RAISE EXCEPTION 'events.ends_at must be after starts_at';
  END IF;
  IF NEW.capacity IS NOT NULL AND NEW.capacity < 0 THEN
    RAISE EXCEPTION 'events.capacity must be >= 0';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER events_validate_trg
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.events_validate();

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: events
CREATE POLICY "events_select_public"
  ON public.events FOR SELECT TO anon, authenticated
  USING (status = 'published' AND is_member_only = false);

CREATE POLICY "events_select_member_only"
  ON public.events FOR SELECT TO authenticated
  USING (
    status = 'published'
    AND is_member_only = true
    AND (
      public.has_role(auth.uid(), 'member_isij')
      OR public.has_role(auth.uid(), 'member_standalone')
      OR public.has_role(auth.uid(), 'scholar')
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "events_admin_select_all"
  ON public.events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "events_admin_insert"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "events_admin_update"
  ON public.events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "events_admin_delete"
  ON public.events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX events_status_starts_at_idx ON public.events (status, starts_at DESC);

-- ============================================================
-- 2. SCHOLAR_QUESTIONS
-- ============================================================
CREATE TABLE public.scholar_questions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_text        text NOT NULL CHECK (char_length(question_text) BETWEEN 10 AND 2000),
  is_anonymous         boolean NOT NULL DEFAULT false,
  status               public.question_status NOT NULL DEFAULT 'pending_triage',
  assigned_scholar_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  answer_text          text,
  answered_at          timestamptz,
  category             text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholar_questions TO authenticated;
GRANT SELECT                         ON public.scholar_questions TO anon;
GRANT ALL                            ON public.scholar_questions TO service_role;

ALTER TABLE public.scholar_questions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER scholar_questions_set_updated_at
  BEFORE UPDATE ON public.scholar_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: scholar_questions
CREATE POLICY "sq_select_public_answered"
  ON public.scholar_questions FOR SELECT TO anon, authenticated
  USING (status = 'answered');

CREATE POLICY "sq_select_submitter"
  ON public.scholar_questions FOR SELECT TO authenticated
  USING (submitter_id = auth.uid());

CREATE POLICY "sq_select_assigned_scholar"
  ON public.scholar_questions FOR SELECT TO authenticated
  USING (
    assigned_scholar_id = auth.uid()
    AND public.has_role(auth.uid(), 'scholar')
  );

CREATE POLICY "sq_admin_select_all"
  ON public.scholar_questions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users may submit only as themselves and only at pending_triage
CREATE POLICY "sq_insert_own"
  ON public.scholar_questions FOR INSERT TO authenticated
  WITH CHECK (
    submitter_id = auth.uid()
    AND status = 'pending_triage'
    AND assigned_scholar_id IS NULL
    AND answer_text IS NULL
    AND answered_at IS NULL
  );

-- Admins can update any row (triage/assign/reject)
CREATE POLICY "sq_admin_update"
  ON public.scholar_questions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Scholars can update only rows assigned to them (answer their own)
CREATE POLICY "sq_scholar_update_assigned"
  ON public.scholar_questions FOR UPDATE TO authenticated
  USING (
    assigned_scholar_id = auth.uid()
    AND public.has_role(auth.uid(), 'scholar')
  )
  WITH CHECK (
    assigned_scholar_id = auth.uid()
    AND public.has_role(auth.uid(), 'scholar')
  );

CREATE POLICY "sq_admin_delete"
  ON public.scholar_questions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX scholar_questions_status_idx       ON public.scholar_questions (status, created_at DESC);
CREATE INDEX scholar_questions_submitter_idx    ON public.scholar_questions (submitter_id);
CREATE INDEX scholar_questions_assigned_idx     ON public.scholar_questions (assigned_scholar_id);

-- ============================================================
-- 3. YOUTH_PRESS_ARTICLES
-- ============================================================
CREATE TABLE public.youth_press_articles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  editor_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title            text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  slug             text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt          text,
  body_md          text NOT NULL,
  cover_image_url  text,
  status           public.article_status NOT NULL DEFAULT 'draft',
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT                         ON public.youth_press_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_press_articles TO authenticated;
GRANT ALL                            ON public.youth_press_articles TO service_role;

ALTER TABLE public.youth_press_articles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER youth_press_articles_set_updated_at
  BEFORE UPDATE ON public.youth_press_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: youth_press_articles
CREATE POLICY "ypa_select_public_published"
  ON public.youth_press_articles FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "ypa_select_author_own"
  ON public.youth_press_articles FOR SELECT TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "ypa_admin_select_all"
  ON public.youth_press_articles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ypa_insert_own_draft"
  ON public.youth_press_articles FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND status = 'draft'
    AND published_at IS NULL
  );

CREATE POLICY "ypa_author_update_own_draft"
  ON public.youth_press_articles FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND status IN ('draft', 'in_review'))
  WITH CHECK (author_id = auth.uid() AND status IN ('draft', 'in_review'));

CREATE POLICY "ypa_admin_update_any"
  ON public.youth_press_articles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ypa_admin_delete"
  ON public.youth_press_articles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX ypa_status_published_at_idx ON public.youth_press_articles (status, published_at DESC);
CREATE INDEX ypa_author_idx              ON public.youth_press_articles (author_id);
