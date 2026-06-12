## Goal

Every current page renders cleanly from 320px → 1536px+ with no horizontal scroll, no clipped text, and tap targets ≥40px. Establish a standing rule so all future frontend work inherits the same constraints.

## Where the breakage is today

Auditing the editorial system (`src/styles.css`, `src/components/auth/*`) and pages (`auth`, `register`, `onboarding.step-1..3`, `_authenticated/admin.users`, `events`, `index`):

- `--spacing-margin-safe: 48px` and `--spacing-gap-section: 64px` are applied as hard values everywhere (`AuthLayout`, headers, footers). On a 360px viewport that leaves the card 264px wide — content gets squeezed.
- `AuthCard` uses `p-12 md:p-[48px]` → 48px padding even at the smallest breakpoint. Should be ~20px mobile / 32px tablet / 48px desktop.
- Fixed header (`AuthLayout` with `headerPosition="fixed"`) reserves `pt-[120px]` regardless of viewport; with the smaller header it should be `pt-[88px] md:pt-[120px]`.
- `TransactionalFooter` (variant `full`) renders 4 links in a `flex gap-6` row that doesn't wrap — overflows below ~480px.
- `TransactionalHeader` "back-to-login" label is `text-body` (16px) and can crowd the JIY mark on 320px; should compress to icon-only or `text-body-sm` on `<sm`.
- Type scale: `--text-headline-sm: 48px` and `--text-form-title: 32px` are used in `<h1>`s without responsive shrink. On mobile they should clamp.
- `admin.users.tsx`: the shadcn `<Table>` has no horizontal-scroll wrapper, the header `flex items-center justify-between` doesn't stack, and the search `Input` is fixed `w-64`. Breaks under ~640px.
- `events.tsx`: `flex items-baseline justify-between gap-4` on each card title row doesn't wrap — long titles + date push off-screen.
- `index.tsx` is still the blank-page placeholder (out of scope here; flagged separately).
- `dashboard.tsx` is an iframe to a static HTML file — not in scope (separate asset, not a React screen).

## Approach

Two parts: (1) fix tokens + shared components so most pages get responsive for free, (2) touch the few pages that still need page-level changes.

### 1. Make design tokens fluid (`src/styles.css`)

Convert the spacing/typography tokens that drive layout to `clamp()` so every consumer scales without per-page media queries:

```text
--spacing-margin-safe : clamp(20px, 5vw, 48px)
--spacing-gap-section : clamp(32px, 6vw, 64px)
--spacing-gap-element : clamp(12px, 2.5vw, 16px)
--spacing-nav-height  : clamp(56px, 8vw, 72px)
--text-headline-sm    : clamp(28px, 6vw, 48px)
--text-form-title     : clamp(24px, 4.5vw, 32px)
--text-headline       : clamp(36px, 7vw, 64px)
--text-headline-lg    : clamp(44px, 8vw, 72px)
--text-display        : clamp(48px, 9vw, 80px)
```

`--spacing-max-width` stays at 1536px (already a max).

### 2. Shared auth shell (`src/components/auth/*`)

- `AuthLayout`: replace fixed `pt-[120px]` with `pt-[calc(var(--spacing-nav-height)+var(--spacing-gap-element))]`. Add `min-w-0` to `<main>` so child cards can shrink.
- `AuthCard`: change inner padding to `p-5 sm:p-8 md:p-12` (≈20/32/48px). Keep 640px max width but add `w-full`.
- `TransactionalHeader`:
  - Outer row already `flex justify-between items-center`; add `gap-3 min-w-0`.
  - Wrap each side's content (`JIY` mark + right-side cluster) in `min-w-0` containers.
  - Hide the "Return to Homepage" / "Back to Login" label text on `<sm` (`hidden sm:inline`) keeping the icon visible.
  - Wizard variant: show `STEP n/N` as `text-[11px] sm:text-label-eyebrow`, drop the `w-12` spacer on mobile.
- `TransactionalFooter` (full variant): change link row to `flex flex-wrap justify-center gap-x-6 gap-y-2`. Minimal/wizard variants already collapse fine.

### 3. Per-page touch-ups

- `routes/auth.tsx`: change `mb-[40px]` blocks to `mb-8 md:mb-10`. Heading max-width stays. Form-controls row (`Keep me signed in` + `Forgot password?`) wrap with `flex-wrap gap-y-2`.
- `routes/register.tsx`: nothing beyond shell + token fixes (already a single-column form).
- `routes/_authenticated/onboarding.step-1..3.tsx`: replace hard `text-[32px]` H1s with the responsive `text-form-title` token; replace `pt-gap-section` button wrappers with `pt-6 md:pt-gap-section`.
- `routes/_authenticated/admin.users.tsx`:
  - Header: `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`.
  - Search input: `w-full sm:w-64`.
  - Wrap table in `<div className="rounded-md border overflow-x-auto"><Table className="min-w-[720px]">…</Table></div>`.
  - In `UserRow` action cell, drop `inline-flex` for `flex flex-wrap justify-end gap-2`.
- `routes/events.tsx`: container `max-w-4xl px-4 sm:px-6 py-10 md:py-12`; card title row becomes `flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1`; H2 gets `min-w-0`.

### 4. Verification

- `bun run lint` / `tsc --noEmit` (build script runs automatically).
- `browser--view_preview` at `375x812` (mobile) and `820x1180` (tablet) for `/auth`, `/register`, `/onboarding/step-1`, `/onboarding/step-3`, `/events`. Confirm no horizontal scrollbar and no text clipping. Admin Users is gated; verify at `1280x720` (already its target) and `375x812` for layout structure only.

### 5. Standing rule for future screens (project memory)

Add `mem://design/responsive-rules.md` and reference it from `mem://index.md` Core so every new screen follows the same playbook:

> All pages must render cleanly 320px → 1536px+. Use fluid tokens from `styles.css` (`--spacing-margin-safe`, `--spacing-gap-section`, `--text-headline-*`, `--text-form-title`) instead of fixed `px`. Use the responsive-layout grid pattern (`grid-cols-[minmax(0,1fr)_auto] sm:flex`) for any header row mixing flexible text with fixed widgets; `min-w-0` on text containers, `shrink-0` on icons/avatars, `truncate` on single-line headings. Wide tables go in `overflow-x-auto` wrappers with a `min-w-[…]` inner. No `flex` row of >2 items without `flex-wrap`.

## Out of scope

- Replacing the `index.tsx` placeholder (separate task).
- The `/dashboard` iframe (static HTML asset, not a React screen).
- Visual redesign of any screen — this pass is purely responsive plumbing; pixel-perfect desktop appearance is preserved.
