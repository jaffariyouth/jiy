Three scoped Muharram-theme tweaks. No other themes or components touched.

### 1. Charcoal card surface (Muharram only)
In `src/styles.css`, update the `.theme-muharram .studio-card` rule:
- Background: `#1f1f22` (deep charcoal grey — lifts off the near-black page bg so cards pop, still high contrast with `#e5dada` text)
- Border: `#2f2f33` (subtle, slightly lighter than the surface)
- Hover border stays crimson `#d91823`
- Also bump `--role-bg-surface` to `#1f1f22` so any component reading the role token matches

The Ticket and Announcements cards both use `.studio-card` + `bg-white`. The existing `.theme-muharram .bg-white` override remaps to `#130607` and overrides the studio-card color. Update that override (scoped via `:where(.studio-card)`) so studio cards stay charcoal while non-card white surfaces remain `#130607`. Simplest: add `.theme-muharram .studio-card.bg-white { background-color: #1f1f22 !important }`.

### 2. Remove gradient overlay on dashboard EventCard image
In `src/components/dashboard/EventCard.tsx`, delete the absolutely-positioned `<div>` (lines 27–33) that paints the `linear-gradient(to top, …role-bg-page…)` over the photo. Applies to all themes (user request was unscoped).

### 3. Soften small "glowy red" eyebrow text in Muharram
Currently `.theme-muharram .text-deep-garnet` and `.text-damascus-gold` both map to `#d91823` (crimson-glow), which is what makes "CONFIRMATION REGISTER", "COMMUNITY", "VOLUNTEER CORPS", etc. feel hot.

Split the mapping:
- `.text-deep-garnet` → `#a8545c` (muted dusty rose — used for the small uppercase eyebrows)
- `.text-damascus-gold` → keep `#d91823` (used for active tab underlines, buttons, accents that should pop)

Update the existing combined rule in `src/styles.css` to two separate selectors.

### Files
- `src/styles.css` — card bg override + split eyebrow color
- `src/components/dashboard/EventCard.tsx` — remove gradient overlay div
