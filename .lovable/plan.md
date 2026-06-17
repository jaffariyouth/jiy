## Admin Console v1 — close-out pass

Goal: finish the stubs so every nav item in the admin sidebar is fully functional, then verify the whole thing end-to-end. Shop is out of scope.

### 1. Event editor / roster (`admin.events.$id.tsx`)
Currently a placeholder. Build the working editor:
- **Details tab** — edit title, description, location, starts_at/ends_at, capacity, cover image (upload to `editorial-media`), member-only toggle, attach a `form_template`, `requires_payment` + price (UI only — Stripe scaffold).
- **Actions** — Publish / Cancel / Duplicate buttons (call existing `publishEvent`, `cancelEvent`, plus a new `duplicateEvent` server fn).
- **Roster tab** — list `event_registrations` (name, email, status, paid?), check-in toggle, CSV export, cancel registration.
- **Submissions tab** — if a form template is attached, list `form_submissions` for this event.

### 2. Press editor (`admin.press.tsx` + `admin.press.$id.tsx`)
- List view: drafts + published `youth_press_articles` with status, author, updated_at, quick publish/unpublish.
- Editor: title, slug, cover image, excerpt, body via `MarkdownEditor`, tags, status. Uses existing `createDraft` / `updateDraft` / `publishArticle` server fns.

### 3. Recurring events polish
Already 71 lines — verify create/edit/delete works, add cover image upload and a "next occurrence" hint based on `cadence_rrule`.

### 4. Forms — public render + submission
- New public route `src/routes/forms/$templateId.tsx` that renders a `form_template` schema as a real form, validates with Zod from the schema, and inserts into `form_submissions` (already has a server fn).
- Wire "Register" on a published event with an attached form template to navigate to that page.

### 5. Audit log viewer
Currently 39 lines (likely list-only). Add: filter by actor, action prefix, entity, date range; show metadata JSON in an expandable row.

### 6. Admin dashboard (`admin.index.tsx`)
KPI tiles already scaffolded — wire them to real counts: upcoming events, total members, pending submissions, recent audit entries (last 10).

### 7. Sidebar fix
`admin.tsx` NAV includes `/admin/users` (good, file exists) but not the press sub-routes; verify all nav items resolve.

### 8. Verification pass
- Sign in as `jiy@jaffari.org`, click every sidebar item, confirm no 404 / blank pages.
- Create an event → attach a form → publish → register from public side → see submission in roster.
- Create an announcement with image + internal link → confirm it shows on dashboard `AnnouncementsWidget`.
- Create a press draft → publish → confirm it shows on editorial feed.
- Add a recurring event → confirm it lands on dashboard `UpcomingEvents`.
- Toggle a feature flag → confirm audit entry appears.
- Run `supabase--linter` after any new migration.

### Out of scope (explicit)
- Shop / Shopify
- Stripe live keys (scaffolding stays; "Payments not yet configured" message remains)
- Email/SMS broadcast composer
- Block editor

### Deliverables
- ~6 new/expanded route files, 1 new public form route, 1 new `duplicateEvent` server fn, possibly 1 small migration if any column is missing (will surface during build).
- No new dependencies expected.
