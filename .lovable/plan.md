## Goal

Replace the placeholder `/` route with the full JIY homepage from the uploaded design (Hero, About, Upcoming Events, Ongoing Events, Strategic Values tabs, The Press, Footer), and make every text/image block editable from the admin panel. Logged-in users see the same page.

## Architecture

### 1. New `site_content` table — keyed JSONB per homepage section

```sql
CREATE TABLE public.site_content (
  section_key text PRIMARY KEY,   -- 'hero' | 'about' | 'ongoing' | 'values' | 'footer'
  content     jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL    ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read"   ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write"   ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
```

Seed five rows with the exact copy + Unsplash image URLs from the design so the page works immediately.

### 2. Featured-override columns on existing tables

```sql
ALTER TABLE public.events              ADD COLUMN featured_on_home boolean DEFAULT false;
ALTER TABLE public.youth_press_articles ADD COLUMN featured_on_home boolean DEFAULT false;
```

Resolution rule (server function):
- **Upcoming Events:** if any `events.featured_on_home = true` (published, future, fully public), use those (max 3). Otherwise the next 3 upcoming public events. Auto fallback when none exist.
- **The Press:** same rule on `youth_press_articles` (latest 2).

### 3. Homepage route `src/routes/index.tsx`

Replace placeholder. Loader uses `queryClient.ensureQueryData` to fetch via a new `getHomepageData` server fn that returns `{ sections, events, articles }`. Components render the uploaded HTML 1:1, ported to React + Tailwind tokens (`text-persian-indigo`, `bg-damascus-gold`, `font-headline`, etc. — already in `styles.css`). Wrap the page in `<div className="jiy-dashboard">` to inherit the parchment background and `studio-card` / `interactive-btn` styles already defined.

Header CTAs: `Login` → `/auth`, `Join JIY` → `/auth?mode=signup`. Logged-in detection via existing supabase client; show `Dashboard` instead of `Login` when a session exists (no redirect, per user choice).

Values tabs are client-state (`useState` for activeIndex). All images come from `site_content.*.image_url` (Unsplash URLs by default, replaceable with uploads).

SEO `head()`: title "JIY — Jaffari Islamic Youth", description from hero `subtitle`, og:image from hero image.

### 4. Admin UI — split per section

New left-nav group "Homepage" under `/admin` with five routes:

```
/admin/homepage/hero      → hero eyebrow, headline, italic line, paragraph, image, social links
/admin/homepage/about     → about copy + stats
/admin/homepage/ongoing   → ongoing-events copy, image, 3 initiative cards
/admin/homepage/values    → 6 strategic-foundation tabs (title + body)
/admin/homepage/footer    → footer tagline + social URLs
```

Each route:
- `useSuspenseQuery` loads its `site_content` row via `getSectionContent({ key })`.
- Form (react-hook-form + zod) edits typed fields.
- Image fields use existing `editorial-media` storage bucket; admin uploads → public URL → saved into `content.image_url`.
- Save calls `updateSectionContent({ key, content })` (admin-only via `requireSupabaseAuth` + `has_role` check).
- Built with existing `AdminPageHeader`, `MarkdownEditor` (for long copy), and standard shadcn inputs.

Plus a checkbox **"Feature on homepage"** added to:
- `admin.events.new.tsx` / `admin.events.$id.tsx`
- `admin.press.new.tsx` / `admin.press.$id.tsx`

writing to `featured_on_home`.

### 5. Server functions (`src/lib/jiy/site-content.functions.ts`)

```
getHomepageData()            -- public, used by route loader
getSectionContent({ key })   -- admin, for edit forms
updateSectionContent({...})  -- admin, validates JSON shape per key
```

All extend the existing `requireSupabaseAuth` + `has_role('admin')` pattern. Public read uses the browser supabase client directly inside the loader's server fn (no auth required).

## Files

**New**
- `supabase/migrations/<ts>_homepage_content.sql`
- `src/lib/jiy/site-content.functions.ts`
- `src/components/home/Hero.tsx`, `About.tsx`, `UpcomingEvents.tsx`, `OngoingEvents.tsx`, `StrategicValues.tsx`, `PressFeature.tsx`, `SiteFooter.tsx`, `SiteHeader.tsx`
- `src/routes/_authenticated/admin.homepage.tsx` (layout)
- `src/routes/_authenticated/admin.homepage.hero.tsx`
- `src/routes/_authenticated/admin.homepage.about.tsx`
- `src/routes/_authenticated/admin.homepage.ongoing.tsx`
- `src/routes/_authenticated/admin.homepage.values.tsx`
- `src/routes/_authenticated/admin.homepage.footer.tsx`

**Edited**
- `src/routes/index.tsx` — replace placeholder
- `src/routes/__root.tsx` — add og:image meta hook from loader (optional)
- `src/routes/_authenticated/admin.tsx` — add "Homepage" nav group
- `src/routes/_authenticated/admin.events.new.tsx` + `admin.events.$id.tsx` — feature checkbox
- `src/routes/_authenticated/admin.press.new.tsx` + `admin.press.$id.tsx` — feature checkbox
- `src/integrations/supabase/types.ts` — auto-regenerated by migration

## Out of scope (v1)

- Editing the values tab count (fixed at 6); only their text is editable.
- Multi-locale content.
- Per-section publish/draft workflow (single live record per section).
- The auth modal from the HTML (uses existing `/auth` route instead).
