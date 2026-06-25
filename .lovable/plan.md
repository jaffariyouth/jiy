## Dashboard updates

### 1. Event cards clickable
In `src/components/dashboard/EventCard.tsx`, wrap the entire card in a TanStack `<Link to="/dashboard/events/$eventId" params={{ eventId: id }}>` when an `id` is present (fallback: keep current toast button). Keep the inner "View Details →" affordance for visual cue but remove the now-redundant inner click handler. Apply to both home upcoming-events grid and dashboard `UpcomingEvents` widget (no extra changes needed there — they already pass `id`).

### 2. Events dropdown in dashboard TopNavBar
In `src/components/dashboard/TopNavBar.tsx`, convert the "Events" leaf into a group identical to the public site header's `EventsDropdown`:
- All Events → `/dashboard/events`
- Upcoming Events → `/dashboard/events#upcoming` (scroll on dashboard events page; if not on it, navigate then scroll)
- Ongoing Events → `/dashboard/ongoing-events` (new page, see #3)

Reuse the same dropdown styling already used for "RESOURCES" so it stays consistent. Mirror the group in the mobile drawer with an "Events" section header.

### 3. New Ongoing Events page (slideshow)
Create `src/routes/_authenticated/dashboard.ongoing-events.tsx`:
- Fetches recurring events via existing `listActiveRecurringEvents` server function.
- Renders a full-width slideshow/carousel — one slide per recurring event showing `cover_image_url`, `title`, `cadence_label`, `location`, and `description_md`.
- Controls: prev/next arrows, auto-advance every 6s (pausable on hover), slide indicators (dots).
- Built with simple internal state (index + interval) — no new dependency.
- Wrapped in `MemberPageShell` so it gets the dashboard header/footer.
- Styled to match the editorial theme (parchment background, gold accent rule, Playfair headlines). Works in Muharram theme via existing role tokens.

### 4. Quick Gate Hub real links
Refactor `src/components/dashboard/AssociationLinks.tsx` from static strings to a typed array with `{ label, to }`, rendered with `<Link>`. Proposed mappings:
- Fajr Football → `/dashboard/ongoing-events`
- Monday Mubahatha → `/dashboard/ongoing-events`
- Job Referral Board → `/dashboard/opportunities`
- Merch Storefront → `/dashboard/shop`
- ISIJ Member Portal → external `https://jaffari.org` in a new tab (open to confirmation; see question below)

### 5. Deeper red Tabarruk banner in Muharram theme
In `src/styles.css`, add a `.theme-muharram` rule targeting `.bg-midnight-sapphire` used by `SponsorNotice` (or add a `.sponsor-notice` class to it and override). Replace the existing dark navy with a deeper crimson/oxblood — proposed `#3d0508` background with `#7a0810` accent ring, keeping gold text legible. Existing default-theme styling is untouched.

### Open question
Where should "ISIJ Member Portal" link to? If you have a URL I'll wire it; otherwise I'll point it to `https://jaffari.org` opening in a new tab.
