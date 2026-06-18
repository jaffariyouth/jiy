-- Add speakers and category_label to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS speakers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS category_label text;

-- Public (unauthenticated) registrations
CREATE TABLE IF NOT EXISTS public.event_public_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 10),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  stripe_session_id text,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_public_registrations_event ON public.event_public_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_public_registrations_email ON public.event_public_registrations(email);

GRANT ALL ON public.event_public_registrations TO service_role;
GRANT SELECT ON public.event_public_registrations TO authenticated;

ALTER TABLE public.event_public_registrations ENABLE ROW LEVEL SECURITY;

-- Admins can view all public registrations
CREATE POLICY "Admins can view public registrations"
  ON public.event_public_registrations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS set_event_public_registrations_updated_at ON public.event_public_registrations;
CREATE TRIGGER set_event_public_registrations_updated_at
  BEFORE UPDATE ON public.event_public_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();