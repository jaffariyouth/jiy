
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM
    ('active','past_due','canceled','incomplete','trialing','unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_plan AS ENUM ('monthly_10','yearly_100');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- isij_registry_cache
CREATE TABLE public.isij_registry_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isij_number text NOT NULL UNIQUE,
  full_name text,
  email_hash text,
  status text NOT NULL DEFAULT 'active',
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_isij_registry_isij_number ON public.isij_registry_cache(isij_number);
GRANT SELECT ON public.isij_registry_cache TO authenticated;
GRANT ALL ON public.isij_registry_cache TO service_role;
ALTER TABLE public.isij_registry_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "isij_cache_admin_read" ON public.isij_registry_cache FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "isij_cache_admin_write" ON public.isij_registry_cache FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_isij_cache_updated_at BEFORE UPDATE ON public.isij_registry_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan public.subscription_plan,
  status public.subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CAD',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_amount_nonneg CHECK (amount_cents >= 0)
);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_admin_read" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
