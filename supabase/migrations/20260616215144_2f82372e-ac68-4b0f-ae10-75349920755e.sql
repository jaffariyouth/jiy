
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

CREATE TABLE IF NOT EXISTS public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  schema jsonb NOT NULL DEFAULT '{"fields":[]}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_templates TO authenticated;
GRANT ALL ON public.form_templates TO service_role;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "form_templates: admin all" ON public.form_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "form_templates: authenticated read" ON public.form_templates FOR SELECT TO authenticated USING (true);
CREATE TRIGGER form_templates_updated_at BEFORE UPDATE ON public.form_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.form_templates(id) ON DELETE SET NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "form_submissions: admin all" ON public.form_submissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "form_submissions: own insert" ON public.form_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "form_submissions: own read" ON public.form_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DO $$ BEGIN
  CREATE TYPE public.announcement_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body_md text NOT NULL DEFAULT '',
  status public.announcement_status NOT NULL DEFAULT 'draft',
  pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements: admin all" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "announcements: members read published" ON public.announcements FOR SELECT TO authenticated
  USING (status = 'published');
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.recurring_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description_md text NOT NULL DEFAULT '',
  cadence_rrule text,
  cadence_label text,
  location text,
  default_capacity int,
  cover_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_events TO authenticated;
GRANT ALL ON public.recurring_events TO service_role;
ALTER TABLE public.recurring_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recurring_events: admin all" ON public.recurring_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "recurring_events: authenticated read active" ON public.recurring_events FOR SELECT TO authenticated
  USING (is_active = true);
CREATE TRIGGER recurring_events_updated_at BEFORE UPDATE ON public.recurring_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.event_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  stripe_price_id text,
  requires_payment boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_payments TO authenticated;
GRANT ALL ON public.event_payments TO service_role;
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_payments: admin all" ON public.event_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "event_payments: authenticated read" ON public.event_payments FOR SELECT TO authenticated USING (true);
CREATE TRIGGER event_payments_updated_at BEFORE UPDATE ON public.event_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DO $$ BEGIN
  CREATE TYPE public.ticket_order_status AS ENUM ('pending','paid','refunded','failed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.event_ticket_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status public.ticket_order_status NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_ticket_orders TO authenticated;
GRANT ALL ON public.event_ticket_orders TO service_role;
ALTER TABLE public.event_ticket_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_orders: admin all" ON public.event_ticket_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "ticket_orders: own read" ON public.event_ticket_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER event_ticket_orders_updated_at BEFORE UPDATE ON public.event_ticket_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.og_cache (
  url_hash text PRIMARY KEY,
  url text NOT NULL,
  title text,
  description text,
  image_url text,
  site_name text,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.og_cache TO authenticated;
GRANT ALL ON public.og_cache TO service_role;
ALTER TABLE public.og_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "og_cache: authenticated read" ON public.og_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "og_cache: admin write" ON public.og_cache FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS form_template_id uuid REFERENCES public.form_templates(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS recurring_event_id uuid REFERENCES public.recurring_events(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_payment boolean NOT NULL DEFAULT false;
