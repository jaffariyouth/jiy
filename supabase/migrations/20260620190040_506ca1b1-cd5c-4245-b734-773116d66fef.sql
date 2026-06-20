-- citext for case-insensitive emails
CREATE EXTENSION IF NOT EXISTS citext;

-- =============================================================
-- opportunities
-- =============================================================
CREATE TYPE public.opportunity_category AS ENUM ('scholarship','fellowship','job','cfp','other');
CREATE TYPE public.opportunity_status AS ENUM ('draft','published','archived');

CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL DEFAULT '',
  body_md text NOT NULL DEFAULT '',
  category public.opportunity_category NOT NULL DEFAULT 'other',
  organization text,
  location text,
  url text,
  deadline timestamptz,
  cover_image_url text,
  status public.opportunity_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX opportunities_status_published_at_idx
  ON public.opportunities (status, published_at DESC);
CREATE INDEX opportunities_category_idx ON public.opportunities (category);
CREATE INDEX opportunities_deadline_idx ON public.opportunities (deadline);

GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published opportunities"
  ON public.opportunities FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can read all opportunities"
  ON public.opportunities FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert opportunities"
  ON public.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update opportunities"
  ON public.opportunities FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete opportunities"
  ON public.opportunities FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER opportunities_set_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- shop_waitlist
-- =============================================================
CREATE TABLE public.shop_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'shop_page',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.shop_waitlist TO anon, authenticated;
GRANT SELECT ON public.shop_waitlist TO authenticated;
GRANT ALL ON public.shop_waitlist TO service_role;

ALTER TABLE public.shop_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the shop waitlist"
  ON public.shop_waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read shop waitlist"
  ON public.shop_waitlist FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shop waitlist entries"
  ON public.shop_waitlist FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
