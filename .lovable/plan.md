# Meet the Team Page

Build a new `/team` route styled to match the homepage's JIY editorial system, fully editable from the admin panel.

## 1. Route & Navigation

- Create `src/routes/team.tsx` — public route, wrapped in `.jiy-dashboard` shell with the same dotted background, top nav, and footer used on the homepage.
- Update the "Our Team" link in `src/routes/index.tsx` (currently anchors to `#` or homepage) to `<Link to="/team">`.
- Add SEO `head()` with route-specific title, description, and og tags.

## 2. Page Sections (1:1 with homepage design language)

Each section is a separate `site_content` key so admins can edit independently:

1. **Hero band** (`team_hero`) — eyebrow kicker, italic display headline, supporting paragraph, optional portrait image inside an ogee-arch portal.
2. **Mission strip** (`team_intro`) — short editorial paragraph + pull-quote, mirroring the About section's typography.
3. **Leadership grid** (`team_leadership`) — repeatable cards (photo, name, role, short bio, optional email/LinkedIn). Uses `studio-card` styling with gold hover border.
4. **Members grid** (`team_members`) — denser repeatable grid (photo, name, role, region). Same card system, smaller scale.
5. **Join CTA** (`team_cta`) — kicker, headline, body, button label + href. Matches homepage closing CTA band.

Loader fetches all five keys in one `getHomepageData`-style server function (`getTeamPageData`) using the public Supabase client (same pattern as homepage to avoid SSR 500s). Sensible `DEFAULTS` ensure the page renders before admin populates content.

## 3. Admin Editors

Add a "Team Page" section to `src/routes/_authenticated/admin.homepage.tsx` nav (or a sibling `admin.team.tsx` index), with five editor routes mirroring the homepage editor pattern:

- `admin.team.hero.tsx`
- `admin.team.intro.tsx`
- `admin.team.leadership.tsx` — repeatable list editor (add/remove/reorder rows; each row: photo upload via `ImageField`, name, role, bio textarea, email, linkedin)
- `admin.team.members.tsx` — repeatable list editor (photo, name, role, region)
- `admin.team.cta.tsx`

Each uses the existing `SectionEditor`, `TextField`, `TextareaField`, `ImageField` primitives. `SECTION_KEYS` in `site-content.functions.ts` extended with the five new keys (`team_hero`, `team_intro`, `team_leadership`, `team_members`, `team_cta`).

## 4. Technical Notes

- No DB migration needed — `site_content` table already stores arbitrary JSONB by key.
- Reuses existing brand tokens, fonts, ogee-arch SVG mask, `studio-card`, `interactive-btn` styles from `src/styles.css`.
- Repeatable editors render an array in state; add/remove buttons mutate the array and persist via the existing `updateSectionContent` server fn.
- Images upload to the existing `editorial-media` bucket under `homepage/team/...`.

## Files

**Create:** `src/routes/team.tsx`, `src/routes/_authenticated/admin.team.hero.tsx`, `admin.team.intro.tsx`, `admin.team.leadership.tsx`, `admin.team.members.tsx`, `admin.team.cta.tsx`

**Edit:** `src/lib/jiy/site-content.functions.ts` (add keys + `getTeamPageData`), `src/routes/index.tsx` ("Our Team" link), `src/routes/_authenticated/admin.homepage.tsx` (add Team Page nav group)
