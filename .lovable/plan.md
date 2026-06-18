## Goal
Replace the current plain ogee clip-path arch with an ornate inline SVG arch frame inspired by the reference: a pointed Moorish/ogee silhouette wrapped in a thick decorative band filled with an 8-point geometric star pattern, applied to every ogee-arch portal across the site.

## Approach
Build a single reusable component `OrnamentalArchFrame` (in `src/components/dashboard/`) that renders an absolutely-positioned inline SVG overlay sized to its parent. The SVG contains:

1. **Star-pattern tile** — an SVG `<pattern>` with an 8-point interlaced star motif (thin strokes, `currentColor`), tileable.
2. **Frame band** — outer rectangle minus inner ogee arch silhouette, using `fill-rule="evenodd"`, filled with the star pattern. This gives the patterned border around the photo.
3. **Double outline** — two stroked ogee paths (thick outer + thin inner with small gap) tracing the inner arch edge, matching the reference's double-line apex detail.
4. **Outer rectangle border** — thin rule around the whole frame.

Colors use brand tokens: pattern + outlines in `text-midnight-sapphire` (or `text-deep-garnet` on dark backgrounds) via `currentColor`, so the frame inherits per-placement.

## Integration
- Existing `.ogee-arch-portal` clip-path keeps masking the photo to the arch shape underneath.
- The new `<OrnamentalArchFrame />` is rendered as a sibling overlay inside every `.ogee-arch-portal` container (homepage hero, ongoing, upcoming events, team hero, team leadership cards).
- Update the clip-path geometry in `OgeeArchDefs` (both `src/routes/index.tsx` and `src/routes/team.tsx`) to match the new SVG's inner arch path exactly so photo and frame align.
- Cards may need slight padding adjustment so the patterned band doesn't crop the photo — handled via a CSS class `arch-frame-inset` on the inner image wrapper.

## Files to change
- **Create** `src/components/dashboard/OrnamentalArchFrame.tsx` — the SVG component, plus exported `OGEE_ARCH_PATH_D` constant so the clip-path stays in sync.
- **Edit** `src/routes/index.tsx` — import component; replace inline `OgeeArchDefs` path with shared constant; drop `<OrnamentalArchFrame />` into each ogee portal (~5 placements).
- **Edit** `src/routes/team.tsx` — same: shared path constant + frame overlay in hero portal and each leadership card.
- **Edit** `src/styles.css` — add `.arch-frame-inset` padding helper if needed.

## Technical notes
- Pattern tile size scales with viewBox so density stays consistent regardless of container aspect ratio.
- `preserveAspectRatio="none"` on the overlay SVG so the frame stretches to match each photo's aspect ratio (matches reference behavior).
- Star motif drawn once as a `<symbol>` and referenced via `<use>` inside the pattern for clean source.
- No new dependencies, no font changes, no DB changes.

## Out of scope
- Admin toggle to switch between plain/ornate frames.
- Per-placement color overrides (single brand color across the site for now).
