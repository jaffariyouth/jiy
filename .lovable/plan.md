
## Acknowledgement

I've read the full JIY instruction kit. Confirming the two rules you flagged:
- **RLS-first / default-deny**: every table gets `ENABLE ROW LEVEL SECURITY` with no permissive policies beyond what's explicitly granted; service_role bypasses RLS for backend writes.
- **Single source of truth for roles**: roles live ONLY in `public.user_roles` (composite PK `(user_id, role)`) using the `public.app_role` enum. `profiles` will NOT contain any `role`, `is_admin`, or authorization columns. Authorization checks go through `public.has_role(uuid, app_role)` as `SECURITY DEFINER` to avoid recursive RLS.

Plan: ship two migrations via the migration tool, in order. No frontend, no edge functions. After you approve and they run, I stop and wait.

---

## Migration 1 — Phase 0: Foundations

**File:** `supabase/migrations/<timestamp>_phase0_foundations.sql`

Contents:

```sql
-- =========================================================================
-- JIY Phase 0 — Foundations
-- profiles, user_roles, has_role, audit_log + audit_log_write,
-- idempotency_keys, feature_flags, updated_at trigger, default-deny RLS.
-- =========================================================================

-- ---- Extensions ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- Enums --------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM
    ('member_isij', 'member_standalone', 'scholar', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- Generic updated_at trigger fn --------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================================
-- profiles (1:1 with auth.users) — NO role columns here, ever.
-- =========================================================================
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  age_demographic text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- user_roles — the ONLY source of truth for roles
-- =========================================================================
CREATE TABLE public.user_roles (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role rows; writes are service_role only (no policy).
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================================
-- has_role — SECURITY DEFINER, prevents recursive RLS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- =========================================================================
-- audit_log — append-only; writes only via audit_log_write()
-- =========================================================================
CREATE TABLE public.audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity      text,
  entity_id   uuid,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read; no INSERT/UPDATE/DELETE policy → default deny for everyone.
CREATE POLICY "audit_log_admin_read"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Block updates/deletes even from privileged paths (extra safety).
CREATE OR REPLACE FUNCTION public.audit_log_immutable()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$;

CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutable();

-- audit_log_write — only sanctioned writer
CREATE OR REPLACE FUNCTION public.audit_log_write(
  _actor_id  uuid,
  _action    text,
  _entity    text DEFAULT NULL,
  _entity_id uuid DEFAULT NULL,
  _metadata  jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, metadata)
  VALUES (_actor_id, _action, _entity, _entity_id, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_log_write(uuid, text, text, uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.audit_log_write(uuid, text, text, uuid, jsonb)
  TO authenticated, service_role;

-- =========================================================================
-- idempotency_keys — 24h TTL enforced by cron later
-- =========================================================================
CREATE TABLE public.idempotency_keys (
  key            text PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  response_json  jsonb,
  expires_at     timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.idempotency_keys TO service_role;
-- No grants to authenticated/anon: only edge functions touch this table.

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
-- No policies → default deny for everyone (service_role bypasses RLS).

CREATE TRIGGER trg_idem_updated_at
  BEFORE UPDATE ON public.idempotency_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- feature_flags — admin-write, authenticated-read
-- =========================================================================
CREATE TABLE public.feature_flags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  enabled     boolean NOT NULL DEFAULT false,
  description text,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_read_all_auth"
  ON public.feature_flags FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "feature_flags_admin_write"
  ON public.feature_flags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## Migration 2 — Phase 1: Identity Data Models

**File:** `supabase/migrations/<timestamp>_phase1_identity.sql`

Contents:

```sql
-- =========================================================================
-- JIY Phase 1 — Identity Data Models
-- isij_registry_cache, subscriptions
-- =========================================================================

-- ---- Enums --------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM
    ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_plan AS ENUM ('monthly_10', 'yearly_100');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================================
-- isij_registry_cache — synced from central ISIJ DB
-- Admin-only write; users can check membership only via SECURITY DEFINER fns.
-- =========================================================================
CREATE TABLE public.isij_registry_cache (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isij_number     text NOT NULL UNIQUE,
  full_name       text,
  email_hash      text,        -- hashed lookup; raw email never stored
  status          text NOT NULL DEFAULT 'active',
  synced_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_isij_registry_isij_number ON public.isij_registry_cache(isij_number);

GRANT SELECT ON public.isij_registry_cache TO authenticated;  -- gated by policy below
GRANT ALL ON public.isij_registry_cache TO service_role;

ALTER TABLE public.isij_registry_cache ENABLE ROW LEVEL SECURITY;

-- Only admins can read raw rows; the sync-isij-member edge fn uses service_role.
CREATE POLICY "isij_cache_admin_read"
  ON public.isij_registry_cache FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "isij_cache_admin_write"
  ON public.isij_registry_cache FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_isij_cache_updated_at
  BEFORE UPDATE ON public.isij_registry_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- subscriptions — Stripe-backed; users read their own only
-- =========================================================================
CREATE TABLE public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL UNIQUE
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id      text UNIQUE,
  stripe_subscription_id  text UNIQUE,
  plan                    public.subscription_plan,
  status                  public.subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at               timestamptz,
  canceled_at             timestamptz,
  amount_cents            integer NOT NULL DEFAULT 0,
  currency                text NOT NULL DEFAULT 'CAD',
  metadata                jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_amount_nonneg CHECK (amount_cents >= 0)
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status  ON public.subscriptions(status);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
-- No INSERT/UPDATE/DELETE grants to authenticated → only Stripe webhook
-- (service_role) mutates rows.

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin_read"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## Notes / Deliberate Choices

- `profiles.id` references `auth.users(id)` directly (1:1), and `user_roles.user_id` references `profiles(id)`. Roles cascade-delete with the profile/user.
- `has_role` is `SECURITY DEFINER` + fixed `search_path` so it's safe to call from any RLS policy without recursion.
- `audit_log` has no INSERT policy and an UPDATE/DELETE-blocking trigger; the only writer is `audit_log_write()` (SECURITY DEFINER).
- `idempotency_keys` exposes zero grants to `authenticated` — edge functions hit it with `service_role`. TTL cleanup belongs to the Phase 4 cron `clean-old-idempotency-keys`.
- `subscriptions` is read-own for users, read-all for admins, and writeable only by service_role (Stripe webhook).
- No PII encryption (pgsodium) on these tables yet — `profiles.display_name`/`avatar_url` aren't sensitive PII, and `isij_registry_cache.email_hash` stores a hash, not the raw email. We'll wire pgsodium in later phases for sensitive columns (e.g. notification recipient addresses).
- Email/full_name on `isij_registry_cache`: storing `email_hash` only to avoid raw PII; sync job hashes incoming emails before insert.

On approval I'll submit these as two sequential migrations via the migration tool, then stop and wait for your review before Phase 2.
