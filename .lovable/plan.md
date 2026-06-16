
# Admin Console v1

A WordPress-style admin area at `/admin/*` (gated by the `admin` role), built with the existing JIY editorial system. Backend mutations use `createServerFn` with `requireSupabaseAuth` + `assertAdmin`, mirroring the patterns already in `src/lib/jiy/*.functions.ts`.

## Scope (this plan)

1. Events & registrations
2. Custom registration form builder (per-event)
3. Paid-ticket framework (Stripe scaffold, no keys yet)
4. Press posts & announcements (markdown editor with live preview + images + link embeds + internal route links)
5. Recurring events catalog (Sunday Soccer, Mubahatha, etc.)
6. User management (roles, ISIJ marking, search)
7. Audit log viewer + feature-flags toggles

Shop is **out of scope** for v1 (it's a separate Shopify enablement flow; we'll do it after this lands).

---

## Admin shell

- `src/routes/_authenticated/admin/route.tsx` — pathless `/admin` layout. `beforeLoad` calls `getMyRoles`; if `admin` not present, `redirect({ to: '/dashboard' })`.
- `AdminShell` component: left sidebar nav (Dashboard, Events, Forms, Press, Announcements, Recurring, Users, Flags, Audit), `<Outlet />` on the right. Uses existing JIY tokens (Playfair headings, Hanken body, ivory bg, sapphire/garnet/gold accents).
- Child routes (all under `_authenticated/admin/`):
  - `index.tsx` — KPI cards (upcoming events, pending registrations, draft posts, recent audit entries)
  - `events.tsx` / `events.$id.tsx` / `events.new.tsx`
  - `events.$id.registrations.tsx` (roster + check-in + CSV export)
  - `forms.tsx` / `forms.$id.tsx` (form templates that can be attached to events)
  - `press.tsx` / `press.$id.tsx` / `press.new.tsx`
  - `announcements.tsx` / `announcements.$id.tsx`
  - `recurring.tsx` / `recurring.$id.tsx`
  - `users.tsx` (already exists at `admin.users.tsx` — move under the new shell)
  - `flags.tsx`
  - `audit.tsx`

## Database changes (one migration)

New tables (all with standard GRANTs + RLS, admin-write via `has_role(auth.uid(),'admin')`, member/anon reads as appropriate):

- `form_templates` — `id, name, slug, schema jsonb, created_by, created_at, updated_at`
  - `schema` shape: `{ fields: [{ id, type: 'text'|'email'|'phone'|'textarea'|'select'|'checkbox'|'number'|'date', label, required, options?, helpText? }] }`
- `form_submissions` — `id, template_id, event_id?, user_id?, data jsonb, created_at`
- `announcements` — `id, title, body_md, status('draft'|'published'), pinned bool, published_at, created_by, created_at, updated_at`
- `recurring_events` — `id, title, slug, description_md, cadence_rrule text, location, default_capacity int?, cover_image_url, is_active bool, created_at, updated_at`
- `event_payments` — `id, event_id, price_cents int, currency text default 'usd', stripe_price_id text?, requires_payment bool, created_at`
- `event_ticket_orders` — `id, event_id, user_id, registration_id, amount_cents, status('pending'|'paid'|'refunded'|'failed'), stripe_session_id, stripe_payment_intent_id, created_at, paid_at`

Column additions:

- `events`: `form_template_id uuid null references form_templates(id)`, `recurring_event_id uuid null references recurring_events(id)`, `requires_payment bool default false`
- `youth_press_articles`: confirm `body_md`, `cover_image_url`, `status` columns (already present per existing functions); add `internal_links jsonb default '[]'` if missing for editor link picker.

Realtime: enable on `event_registrations`, `announcements`, `notifications` for live admin views.

## Server functions (`src/lib/jiy/`)

All follow the existing `assertAdmin` + idempotency + `writeAudit` pattern.

- `form-templates.functions.ts` — `listFormTemplates`, `getFormTemplate`, `createFormTemplate`, `updateFormTemplate`, `deleteFormTemplate`.
- `form-submissions.functions.ts` — `submitForm` (public when attached to a published event), `listSubmissions` (admin), `exportSubmissionsCsv` (admin).
- `announcements.functions.ts` — `listPublishedAnnouncements` (member), `listAllAnnouncements` (admin), `createAnnouncement`, `updateAnnouncement`, `publishAnnouncement`, `pinAnnouncement`, `deleteAnnouncement`.
- `recurring-events.functions.ts` — list/get/create/update/toggle.
- Extend `events.functions.ts` — accept `form_template_id`, `requires_payment`, `recurring_event_id` on create/update; add `duplicateEvent`.
- Extend `event-registrations.functions.ts` — `exportRosterCsv`.
- Extend `admin.functions.ts` — `suspendUser`, `unsuspendUser` (sets a `profiles.suspended_at`), `listAuditLog` (paginated, filter by action/entity).
- `feature-flags.functions.ts` — `listFlags`, `setFlag`.
- `payments.functions.ts` (scaffold) — `createCheckoutSession` (throws "Stripe not configured" until `STRIPE_SECRET_KEY` exists), plus a server route `src/routes/api/public/stripe/webhook.ts` that verifies signature with `STRIPE_WEBHOOK_SECRET` and updates `event_ticket_orders`. Both no-op gracefully when env vars are missing.

## Editor (markdown + live preview)

Lightweight, no heavy WYSIWYG:

- `src/components/admin/MarkdownEditor.tsx` — split pane: textarea on left, rendered preview on right (using `react-markdown` + `remark-gfm`, plus `rehype-raw` only inside admin to allow safe whitelisted embeds).
- Toolbar: bold, italic, H2/H3, list, quote, link, image, internal-link picker.
- **Image upload**: new Supabase Storage bucket `editorial-media` (public read, admin write). Uploader writes file and inserts `![alt](url)`.
- **Link embeds**: paste a URL → preview component fetches OG tags via a server fn `fetchOgPreview` (server-side fetch, 5s timeout, cached by URL hash for 24h in a tiny `og_cache` table) → inserts an `[Embed](url)` shortcode that renders as a card in the published view.
- **Internal links**: dropdown lists known routes (events, press, recurring) so the admin can insert `[Title](/events/<id>)` without typing.

Same editor is used for press posts, announcements, and recurring-event descriptions.

## Form builder (Gravity-Forms-lite)

- `src/components/admin/FormBuilder.tsx` — left column: field list (drag to reorder via `@dnd-kit/sortable`, already in repo if not we add it); right column: live preview of the form as members will see it.
- Field types: text, email, phone, textarea, select (with options editor), checkbox, number, date. Each field: label, required, help text.
- Save persists `schema` jsonb to `form_templates`.
- Attach a template to an event via the event edit page (`form_template_id`).
- Public member view: `EventRegistrationForm` reads the template, renders fields with Zod validation derived from the schema, submits to `submitForm` which creates both a `form_submissions` row and an `event_registrations` row (and, if `requires_payment`, kicks off Stripe checkout).

## Payments scaffold

- Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` slots (not asked from user yet — `payments.functions.ts` checks for them and returns a friendly "Payments not configured — ask an admin to add Stripe keys" error).
- UI: event edit page has a "Paid event" toggle + price field; saving persists `event_payments`. Public registration flow detects `requires_payment` and shows "Pay & register" CTA wired to `createCheckoutSession`.
- When the user is ready with Stripe keys, we run `secrets--add_secret` and the flow lights up — no further code changes needed.

## Acceptance checks

- Non-admin hitting `/admin` → redirected to `/dashboard`.
- Admin can: create event (with capacity, optional form template, optional price), publish/cancel/duplicate, see live roster, check people in, export CSV.
- Admin can: build a form, attach to event, see submissions list, export CSV.
- Admin can: write a press post or announcement in markdown, upload an image, embed a link, insert an internal link, publish.
- Admin can: add a recurring event; it surfaces in the member dashboard's recurring section.
- Admin can: search users, grant/revoke roles, mark ISIJ, suspend.
- Admin can: toggle feature flags and browse the audit log.
- Every admin mutation writes an `audit_log` row.
- Stripe-related UI renders but explicitly says "Payments not yet configured" until keys are added.

## Not in this plan (call out so we don't forget)

- Shop / Shopify enablement → separate flow after this.
- Email/SMS broadcast composer → next iteration (notifications table & cron already exist).
- Rich block editor → revisit only if the markdown editor proves insufficient.
