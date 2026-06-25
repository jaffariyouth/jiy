CREATE TABLE public.interest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('sponsor','volunteer')),
  user_id uuid,
  phone text NOT NULL,
  amount numeric,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, SELECT ON public.interest_submissions TO authenticated;
GRANT ALL ON public.interest_submissions TO service_role;

ALTER TABLE public.interest_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert their own interest submissions"
  ON public.interest_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can view all interest submissions"
  ON public.interest_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_interest_submissions_kind_created ON public.interest_submissions (kind, created_at DESC);