GRANT SELECT ON public.feature_flags TO anon;
CREATE POLICY "feature_flags_public_theme_read" ON public.feature_flags FOR SELECT TO anon USING (key = 'theme_muharram');