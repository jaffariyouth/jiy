
-- Fix search_path on audit_log_immutable
CREATE OR REPLACE FUNCTION public.audit_log_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'audit_log is append-only'; END; $$;

-- Trigger-only fns: revoke from public/authenticated/anon
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_log_immutable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Silence "RLS enabled, no policy" on idempotency_keys (backend-only table).
-- An admin-only read policy makes intent explicit without exposing rows to users.
CREATE POLICY "idempotency_keys_admin_read" ON public.idempotency_keys
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
