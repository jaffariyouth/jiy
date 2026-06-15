# Replace Dashboard with JIY Design (1:1 React Port)

## Goal
Replace the current `/_authenticated/dashboard` route (which iframes `/dashboard.html`) with a pixel-perfect React conversion of the uploaded `timeless_high_contrast_dashboard (1).html`. Every visual element comes from the HTML — no improvised markup, copy, or styling. Save `JIY.md` as the canonical style reference for all future frontend work.

## Scope
- 1:1 visual + structural parity with the HTML (markup, classes, copy, SVGs, icons, decorative motifs, toggle states all preserved).
- Split the single HTML page into React components mirroring its existing section comments.
- Keep all interactive JS behaviors from the original (toast portal, drawer toggle, ticket switcher, modal dialog) — ported to React state.
- No backend wiring changes. No new routes. Existing auth gating (`_authenticated`) stays.

## Design tokens & fonts
Add JIY tokens to `src/styles.css` under `@theme` so Tailwind utility classes from the HTML resolve natively:
- Colors: `alabaster-parchment`, `warm-silk-grey`, `midnight-sapphire`, `primary-dark`, `damascus-gold`, `deep-garnet`, `ash-slate`, `horizon-mist`.
- Fonts: `--font-headline` Playfair Display, `--font-body` Hanken Grotesk.
- Spacing utilities used by the HTML: `gap-section`, `max-width`, `gap-element`, `margin-safe` (added as `--spacing-*`).
- Border-radius default `4px`.
- Global page styles (dotted parchment background + `studio-card` + `interactive-btn` + `editorial-double-border`) scoped under a `.jiy-dashboard` wrapper so they only apply inside the dashboard page and do not bleed into auth/onboarding.

Load Playfair Display, Hanken Grotesk, and Material Symbols Outlined via `<link>` tags in `src/routes/__root.tsx` head (Google Fonts), per Tailwind v4 rules.

## Component breakdown (under `src/components/dashboard/`)
Mirrors the HTML's own section comments — no invented components.

```
src/components/dashboard/
  DashboardShell.tsx          // body wrapper + dotted background + ToastPortal mount
  ToastPortal.tsx             // <!-- Global Toast Alert Portal -->
  TopNavBar.tsx               // <!-- Elevated Floating Top Navigation Bar -->
  SponsorNotice.tsx           // <!-- Sleek Low-Profile High-Contrast Sponsor Notice -->
  WelcomeBlock.tsx            // <!-- Welcome Block --> incl. Scholar Question Drawer
  ScholarQuestionDrawer.tsx   // <!-- Hidden form drawer -->
  UpcomingEvents.tsx          // <!-- Upcoming Events Container --> (renders EventCard x2)
  EventCard.tsx               // <!-- Event 1 / Event 2 -->
  StructuralDivider.tsx       // <!-- Graphic Structural Divider -->
  EditorialJournalFeed.tsx    // <!-- Editorial Journal Feed --> (renders ArticleBlock x2)
  ArticleBlock.tsx            // <!-- Article Block 1 / 2 -->
  RegistrationTicket.tsx      // <!-- Registration Widget ... Ticket --> w/ toggle states
  AnnouncementsWidget.tsx     // <!-- Announcements Widget -->
  VolunteerCorpWidget.tsx     // <!-- Volunteer Corp -->
  AssociationLinks.tsx        // <!-- Association Quick Links List -->
  GeometricOrnament.tsx       // <!-- Archival Geometric Break Ornament -->
  DashboardFooter.tsx         // <!-- Traditional Centered Grid Footer -->
  SponsorModal.tsx            // <!-- Absolute Functional Portal Modal -->
  index.ts                    // re-exports
```

Each component's JSX is a direct port of the corresponding HTML block — same class strings, same inline SVGs, same copy, same `material-symbols-outlined` icon names. No re-styling, no copy edits, no reordering.

## Route changes
- Rewrite `src/routes/_authenticated/dashboard.tsx`: remove the iframe; render `<DashboardShell>` containing `TopNavBar`, `SponsorNotice`, the `<main>` with `WelcomeBlock` + 8/4 grid (`UpcomingEvents`, `StructuralDivider`, `EditorialJournalFeed` | `RegistrationTicket`, `AnnouncementsWidget`, `VolunteerCorpWidget`, `AssociationLinks`), `GeometricOrnament`, `DashboardFooter`, plus mounted `ToastPortal` and `SponsorModal`.
- Keep `head()` title `"JIY Central Member Dashboard Hub"`.
- Delete `public/dashboard.html` (no longer referenced).

## Interactive behavior port (from the HTML's bottom `<script>`)
Implement with React state hooks inside the relevant components — same behavior, no UX changes:
- `triggerSponsorDialog()` → `SponsorModal` open/close state, lifted to `DashboardShell`.
- Scholar question drawer expand/collapse → local `useState` in `WelcomeBlock`/`ScholarQuestionDrawer`.
- Registration ticket Active/Past toggle → local `useState` in `RegistrationTicket`.
- Toast portal → simple context + `addToast()` used by the sponsor form submit, matching original messages.

## Future-build rule
Save `JIY.md` as the design reference and record a memory:
- Write `mem://design/jiy-style-reference.md` (type: design) — summary of palette, type system, radius, double-line borders, dotted parchment background, decorative ornaments (✥, ❖), `studio-card` shadow recipe, `interactive-btn` gold-outline hover. Point at the uploaded `JIY.md` as the canonical source.
- Update `mem://index.md` Core to add: "Use JIY editorial system (Playfair Display + Hanken Grotesk, midnight-sapphire/deep-garnet/damascus-gold palette, 4px radius, double-line borders, dotted parchment bg). See mem://design/jiy-style-reference."

## Verification
- Visit `/dashboard` in the preview at 1280, 1024, 768, 375 widths; compare side-by-side with the original HTML opened directly.
- Confirm: fonts load (no fallback flash), dotted background visible, gold hover borders on cards, sponsor modal opens/closes, scholar drawer toggles, ticket switcher swaps panes, toast appears on sponsor submit.
- Build passes (`routeTree.gen.ts` unaffected since no new routes).

## Out of scope
- Wiring real data (events, articles, registrations) — copy stays exactly as in the HTML.
- Changing auth, navigation targets, or any other route.
- Restyling auth/onboarding to the new tokens (tokens are added globally but only the dashboard page applies the parchment background + card recipes via its wrapper class).
