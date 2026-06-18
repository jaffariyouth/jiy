
-- Editable per-section homepage content
CREATE TABLE public.site_content (
  section_key text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content public read"
  ON public.site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_content admin write"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Featured-on-home flag for events and press
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS featured_on_home boolean NOT NULL DEFAULT false;
ALTER TABLE public.youth_press_articles
  ADD COLUMN IF NOT EXISTS featured_on_home boolean NOT NULL DEFAULT false;

-- Seed default homepage content (exact copy from design)
INSERT INTO public.site_content (section_key, content) VALUES
('hero', jsonb_build_object(
  'eyebrow', 'Jaffari Islamic Youth',
  'headline', 'Rooted in Heritage.',
  'headline_italic', 'Built for the Future.',
  'body', 'Empowering Tomorrow''s Leaders Through Faith, Friendship, and Purpose. Connecting young scholars, community members, and visionary thinkers through a modern platform built on timeless principles.',
  'image_url', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1200',
  'image_caption', 'Community gathering',
  'instagram_url', 'https://instagram.com/jaffariyouth',
  'linkedin_url', 'https://www.linkedin.com/company/jaffari-islamic-youth',
  'youtube_url', 'https://www.youtube.com/@jaffariyouth',
  'linktree_url', 'https://linktr.ee/jaffariyouth'
)),
('about', jsonb_build_object(
  'eyebrow', 'About Us',
  'heading', 'Our Story',
  'body', 'JIY is a youth-led initiative within ISIJ of Toronto, dedicated to building a thriving community through faith, friendship, and purposeful action. We bridge classical scholarship with the questions and challenges of modern life.',
  'stats', jsonb_build_array(
    jsonb_build_object('value','500+','label','Active Members'),
    jsonb_build_object('value','40+','label','Annual Events'),
    jsonb_build_object('value','15','label','Volunteer Programs')
  )
)),
('ongoing', jsonb_build_object(
  'eyebrow', 'Community Building',
  'heading', 'Ongoing Events',
  'body_1', 'We believe that having regular weekly programming is essential to building a youth community. Our current initiatives include Fajr Football and Monday Mubahatha which have an established audience who highly benefit from these programs.',
  'body_2', 'Consistent events enable youth to build brotherhood/sisterhood amongst each other while building their knowledge and gaining strength. We hope to enhance and increase our regularly scheduled events to reach an even wider audience while keeping everyone connected.',
  'image_url', 'https://youth.jaffari.org/wp-content/uploads/2025/03/090ffa6f-cfea-48ae-b66d-0c3563c00803.png',
  'cta_label', 'Explore Schedule',
  'cta_url', 'https://youth.jaffari.org/events/',
  'initiatives', jsonb_build_array(
    jsonb_build_object('icon','sports_soccer','title','Fajr Football','description','Brothers only football on Sunday mornings.'),
    jsonb_build_object('icon','menu_book','title','Monday Mubahatha','description','Weekly book club based on A Treatise of Servitude.'),
    jsonb_build_object('icon','forum','title','WhatsApp Community','description','Stay connected with announcements and discussion.')
  )
)),
('values', jsonb_build_object(
  'eyebrow', 'Strategic Foundation',
  'heading', 'What Drives Us',
  'tabs', jsonb_build_array(
    jsonb_build_object('title','Authentic Engagement','body','Connecting with our youth through real conversations, shared experiences, and relevant initiatives.'),
    jsonb_build_object('title','Sustainability','body','Developing long-term non-profit frameworks that secure structural consistency across terms.'),
    jsonb_build_object('title','Service & Social Impact','body','Uplifting the youth to become active, positive contributors within our community and broader society.'),
    jsonb_build_object('title','Faith as Identity','body','Fostering a sense of belonging and building systems of care, justice, and spiritual unity.'),
    jsonb_build_object('title','Community Connection','body','Creating spaces where deep friendships grow, voices are heard, and purpose is shared.'),
    jsonb_build_object('title','Scholarly Guidance','body','Providing direct connection and regular engagement with resident scholars for moral alignment.')
  )
)),
('footer', jsonb_build_object(
  'tagline', 'Preserving our identity, modeling the future.',
  'copyright', '© 2026 Jaffari Islamic Youth - ISIJ of Toronto',
  'instagram_url', 'https://instagram.com/jaffariyouth',
  'linkedin_url', 'https://www.linkedin.com/company/jaffari-islamic-youth',
  'youtube_url', 'https://www.youtube.com/@jaffariyouth',
  'linktree_url', 'https://linktr.ee/jaffariyouth'
));
