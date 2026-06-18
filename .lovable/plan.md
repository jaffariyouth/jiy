# Events: list + detail polish

## 1. `/events` list page (`src/routes/events.tsx`)

Rebuild in JIY editorial style, matching homepage/UpcomingEvents aesthetic:

- Use the same `jiy-dashboard` top bar + footer as `events.$eventId.tsx` (consistent chrome).
- Editorial header:
  - Eyebrow: `COMMUNITY EVENTS` (deep-garnet, tracked uppercase).
  - H1 (Playfair) "Upcoming Gatherings".
  - Sub: "Community gatherings open to everyone."
  - Hairline divider in `border-horizon-mist`.
- Grid of event cards (1 col mobile, 2 col md, 3 col lg):
  - Cover image with `ogee-arch-portal` or rounded frame, fallback to ornament/gradient.
  - Floating date badge (day + month) overlaid top-left.
  - Category eyebrow (deep-garnet uppercase).
  - Title in Playfair, hover → damascus-gold.
  - Time + venue meta line.
  - Description line-clamp-2.
  - "View details →" link to `/events/$eventId`.
- Empty state in editorial card style.

## 2. `/events/$eventId` detail polish (`src/routes/events.$eventId.tsx`)

Tighten to better match the reference HTML:

- Header nav: add "Community" link and "Contact Us" between Home/Events for parity.
- Breadcrumbs: keep slash separators, ensure spacing matches reference.
- Hero:
  - Confirm category eyebrow → big Playfair title → meta row (Date / Time / Venue) separated by vertical bars — already close, tweak typography weight and spacing to match.
  - Right image: keep `ogee-arch-portal`, ensure max-width and right-alignment.
- Body section background: switch to alabaster/beige tint (`bg-alabaster-parchment` or warm-silk) matching reference's warm panel.
- Speakers cards: tighter padding, larger round photo with subtle border, name in Playfair, role eyebrow in deep-garnet, bio in ash-slate. Match reference card chrome (white, soft border, rounded-md, light shadow).
- Registration card (right sidebar):
  - Title "Public Registration" (already there).
  - Price row + qty stepper polished (rounded, hairline border).
  - Inputs: label above, hairline border, focus damascus-gold.
  - CTA: dark persian-indigo bg, white text, arrow, full width.
  - Footnote text in ash-slate small.
- Footer: keep, ensure links match reference (Archives, Submission Guidelines, Membership, Privacy Policy) — but since this is JIY (not a publishing house), keep current JIY footer links (All events / Our team / Home) — reference is a layout cue, not literal copy.

## 3. Out of scope

- No backend / server fn changes — `getPublicEvent`, `listPublicEvents`, and `registerPublicForEvent` stay as-is.
- No DB migrations.
- No new routes.

## Files touched

- `src/routes/events.tsx` — full rewrite of the page component.
- `src/routes/events.$eventId.tsx` — refinements to hero, speakers, registration card spacing/typography; add Community nav link.
