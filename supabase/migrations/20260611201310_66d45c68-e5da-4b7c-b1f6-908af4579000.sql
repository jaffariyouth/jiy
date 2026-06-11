-- ============================================================
-- Phase 3 — Interactions
-- event_registrations, notifications, notification_deliveries
-- ============================================================

-- ----- Enums --------------------------------------------------
CREATE TYPE public.check_in_status AS ENUM ('registered', 'checked_in', 'no_show', 'cancelled');
CREATE TYPE public.notification_channel AS ENUM ('email', 'push', 'sms', 'in_app');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');

-- ============================================================
-- 1. EVENT_REGISTRATIONS
-- ============================================================
CREATE TABLE public.event_registrations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_status     public.check_in_status NOT NULL DEFAULT 'registered',
  volunteer_shift_id  uuid,
  notes               text,
  registered_at       timestamptz NOT NULL DEFAULT now(),
  checked_in_at       timestamptz,
  cancelled_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL                            ON public.event_registrations TO service_role;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER event_registrations_set_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Capacity guard: prevent registrations exceeding event.capacity.
-- Runs with SECURITY DEFINER to read events.capacity regardless of caller RLS.
CREATE OR REPLACE FUNCTION public.event_registrations_capacity_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _capacity int;
  _current  int;
  _event_status public.event_status;
BEGIN
  -- Only check on INSERT or when un-cancelling.
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE'
        AND OLD.check_in_status = 'cancelled'
        AND NEW.check_in_status <> 'cancelled') THEN
    SELECT capacity, status INTO _capacity, _event_status
      FROM public.events WHERE id = NEW.event_id;
    IF _event_status IS NULL THEN
      RAISE EXCEPTION 'CONFLICT: event does not exist';
    END IF;
    IF _event_status NOT IN ('published') THEN
      RAISE EXCEPTION 'CONFLICT: event not open for registration';
    END IF;
    IF _capacity IS NOT NULL THEN
      SELECT count(*) INTO _current
        FROM public.event_registrations
       WHERE event_id = NEW.event_id
         AND check_in_status <> 'cancelled'
         AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');
      IF _current + 1 > _capacity THEN
        RAISE EXCEPTION 'CONFLICT: event is full';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.event_registrations_capacity_check() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER event_registrations_capacity_trg
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.event_registrations_capacity_check();

-- RLS: event_registrations
CREATE POLICY "er_select_own"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "er_admin_select_all"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "er_insert_self"
  ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND check_in_status = 'registered'
    AND checked_in_at IS NULL
    AND cancelled_at IS NULL
  );

-- Users can update only their own row, and only to cancel (status -> cancelled).
CREATE POLICY "er_user_cancel_own"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND check_in_status = 'cancelled');

CREATE POLICY "er_admin_update_any"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "er_admin_delete"
  ON public.event_registrations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX event_registrations_event_idx ON public.event_registrations (event_id, check_in_status);
CREATE INDEX event_registrations_user_idx  ON public.event_registrations (user_id);

-- ============================================================
-- 2. NOTIFICATIONS (queue)
-- ============================================================
CREATE TABLE public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel         public.notification_channel NOT NULL,
  template_key    text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          public.notification_status NOT NULL DEFAULT 'pending',
  scheduled_for   timestamptz NOT NULL DEFAULT now(),
  sent_at         timestamptz,
  error_message   text,
  retry_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Only the backend writes notifications. Authenticated users only SELECT their own.
GRANT SELECT ON public.notifications TO authenticated;
GRANT ALL    ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER notifications_set_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "notif_admin_select_all"
  ON public.notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX notifications_pending_idx ON public.notifications (status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX notifications_recipient_idx ON public.notifications (recipient_id, created_at DESC);

-- ============================================================
-- 3. NOTIFICATION_DELIVERIES (append-only audit)
-- ============================================================
CREATE TABLE public.notification_deliveries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id     uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel             public.notification_channel NOT NULL,
  provider            text,
  provider_message_id text,
  status              public.notification_status NOT NULL,
  error               text,
  attempted_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notification_deliveries TO authenticated;
GRANT ALL    ON public.notification_deliveries TO service_role;

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nd_admin_select_all"
  ON public.notification_deliveries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Append-only: no UPDATE or DELETE policy. Service role bypasses RLS for inserts.
-- Add an immutability trigger to defend against future loosening.
CREATE TRIGGER notification_deliveries_immutable
  BEFORE UPDATE OR DELETE ON public.notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutable();

CREATE INDEX nd_notification_idx ON public.notification_deliveries (notification_id, attempted_at DESC);

-- ============================================================
-- 4. enqueue_notification (SECURITY DEFINER helper)
-- ============================================================
CREATE OR REPLACE FUNCTION public.enqueue_notification(
  _recipient_id  uuid,
  _channel       public.notification_channel,
  _template_key  text,
  _payload       jsonb DEFAULT '{}'::jsonb,
  _scheduled_for timestamptz DEFAULT now()
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.notifications (recipient_id, channel, template_key, payload, scheduled_for)
  VALUES (_recipient_id, _channel, _template_key, COALESCE(_payload, '{}'::jsonb), _scheduled_for)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Only the backend may enqueue directly.
REVOKE EXECUTE ON FUNCTION public.enqueue_notification(uuid, public.notification_channel, text, jsonb, timestamptz)
  FROM PUBLIC, anon, authenticated;
