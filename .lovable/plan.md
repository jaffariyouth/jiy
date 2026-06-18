## Goal

Rebuild `/` as a faithful 1:1 port of `timeless_high_contrast_dashboard (3).html`. Every section, class, ornament, SVG, and interaction from the file is preserved. Admin can edit copy, images, and links for every section.

## What's wrong today

- Current `src/routes/index.tsx` invented its own layout/components instead of replicating the HTML.
- The bespoke design tokens (`alabaster-parchment`, `persian-indigo`, `deep-garnet`, `damascus-gold`, `warm-silk-grey`, `horizon-mist`, `ash-slate`, custom radius + `gap-section`/`margin-safe`/`max-width` spacing, `headline`/`body` font families) aren't registered in `src/styles.css`.
- Custom CSS from the HTML's `<style>` block is missing: cardstock dotted background, `editorial-double-border`, `.ogee-arch-portal` clip mask + the inline SVG `<defs>` mask, `.studio-card`, `.value-tab` active/progress states, `.interactive-btn` hover, star ornament.
- Fonts (Playfair Display + Hanken Grotesk + Material Symbols) aren't loaded in `__root.tsx`.
- Admin sections store generic ad-hoc fields that don't map to the real content in the design (e.g. mission callout, term directives, stats row, ongoing-events 3 initiatives, 6 strategic values, press cover plate, footer columns).

## Build approach

### 1. Design system (one-time setup)

- `src/routes/__root.tsx`: add `<link>` tags for the two Google Fonts + Material Symbols stylesheet.
- `src/styles.css`: register `@theme` tokens for the 7 brand colors, font families (`--font-headline`, `--font-body`), spacing (`--spacing-gap-section`, `--spacing-margin-safe`, `--spacing-max-width`, `--spacing-gap-element`), and radius scale. Port every rule from the HTML `<style>` block as `@utility` or global CSS: dotted cardstock body background, `.ogee-arch-portal`, `.studio-card`, `.value-tab` + `.progress-bg` + active state, `.interactive-btn`, `.editorial-double-border`, star ornament.
- Inject the SVG `<defs>` containing `#ogee-arch-mask` once at the top of the homepage (and any other page that uses the clip-path) so the `clip-path: url(#ogee-arch-mask)` resolves.

### 2. Home page — `src/routes/index.tsx`

Rebuild as a single page that renders, in order, exact replicas of the HTML sections:

1. SVG defs (ogee mask)
2. Header (sticky, brand, nav with Events hover dropdown, Login + Join JIY buttons → `/auth`)
3. Hero (kicker, headline w/ italic span, paragraph, separator, Connect-With-Us social row with the 4 brand-colored SVGs, two CTAs, ogee-arch photo card with quote overlay, 8-point star medallion)
4. Metrics strip (4 stats on persian-indigo)
5. About Us (kicker, headline, mission callout box w/ background star, two body paragraphs, "Term Directives" callout, right-side 3-photo grid)
6. Upcoming Events (header bar + 3 event cards with ogee-arch poster, date badge, kicker, title, blurb, Register button) — pulled from `getHomepageData().events`
7. Ongoing Events (left narrative + CTA, center ogee-arch photo, right list of 3 initiatives with Material Symbols icons)
8. Core Values — Strategic Foundations (6 tabs + 6 slide cards with the tab-progress active state and slide cross-fade, driven by `useState`)
9. Star break ornament
10. The Press (header, archival cover plate on the left, 2 featured articles on the right) — pulled from `getHomepageData().articles`
11. Footer (3-column: brand, nav + 4 social icons, copyright)

Dynamic event/article data continues to use `getHomepageData` (already in place). Header auth buttons keep the existing `signedIn` check and route to `/auth` / `/dashboard`. Tab-switching for Strategic Foundations is local React state, no scripts.

### 3. Admin editor — match every editable field

Update the existing `src/routes/_authenticated/admin.homepage.*.tsx` editors so each section's JSON shape matches the rendered fields exactly:

- **hero**: kicker, headline_line1, headline_line2_italic, body, photo_url, quote, quote_attribution, cta_primary {label, href}, cta_secondary {label, href}, socials [{network, url}] (Instagram, LinkedIn, YouTube, Linktree).
- **metrics** (new tab): array of 4 `{value, label}`.
- **about**: kicker, headline, mission_quote, body_paragraph_1, body_paragraph_2, directives_label, directives_body_1, directives_body_2, photo_top_url, photo_bottom_url, photo_tall_url.
- **ongoing**: kicker, headline, narrative_paragraph_1, narrative_paragraph_2, cta {label, href}, photo_url, initiatives [{icon (Material Symbols name), title, description}] (3 items).
- **values**: section_kicker, section_headline, items [{number, title, kicker, body, cta_label, cta_href}] (6 items).
- **press**: section_kicker, section_headline, section_subhead_italic, archive_link {label, href}, volume_label, journal_title, journal_subtitle, journal_footer.
- **footer**: brand_tagline, nav_links [{label, href}], socials [{network, url}], copyright.

Wire all of these through the existing `SectionEditor` + `updateSectionContent` server fn (no DB changes — `site_content` already stores JSONB per section). The events/articles editors already have `featured_on_home` toggles; no change.

### 4. Defaults

`getHomepageData` already merges DB rows with empty defaults. Provide the HTML's literal copy as fallback defaults inside `src/routes/index.tsx` (string constants) so the page renders identically to the mockup before an admin overrides anything.

## Out of scope

- No DB migration. No new server functions. No changes to events/press article data flow.
- Mobile menu drawer (the HTML hides nav on `md` and below; we keep the same behavior).
- No `toast-portal` / `auth popup` JS — Join/Login go to existing `/auth` route.

## Files touched

- Edit: `src/styles.css`, `src/routes/__root.tsx`, `src/routes/index.tsx`, all `src/routes/_authenticated/admin.homepage.*.tsx`.
- Possibly extract: `src/components/home/*` for each section to keep `index.tsx` readable, plus `src/components/home/OgeeArchDefs.tsx`.
