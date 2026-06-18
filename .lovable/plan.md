## Event Detail & Public Registration Page

Build a public event detail page at `/events/$eventId` styled like the mockup (editorial portal image, breadcrumbs, side registration card, featured speakers). Anyone can register with name + email — no sign-in required. Paid events route through Stripe Checkout.

### Pages

- **`/events/$eventId`** — public route, SSR-friendly. Loads event via a new public server fn.
  - Breadcrumbs: Community Events / [Category] / [Title]
  - Left column: kicker label, headline, date/time/venue meta row, About section, Featured Speakers cards
  - Right column: sticky "Public Registration" card — price (or "Free"), quantity stepper, full name, email, "Complete Registration" CTA
  - Mosque-arch portal image on hero right (re-use existing `ogee-arch-portal` mask)

- **`/events`** — turn each list item into a `<Link to="/events/$eventId">` and refresh visual style to match the editorial look.

### Database

New migration:

1. Add JSONB columns to `public.events`:
   - `speakers jsonb NOT NULL DEFAULT '[]'::jsonb` — `[{ name, role, bio, photo_url }]`
   - `category_label text` — e.g. "Lectures & Seminars"
2. New `public.event_public_registrations` table for unauthenticated sign-ups:
   - `event_id uuid → events(id)`, `full_name`, `email`, `quantity int default 1`, `status` (`pending|confirmed|cancelled`), `stripe_session_id`, `amount_cents`, `currency`, `confirmed_at`, timestamps
   - RLS: no anon read, no anon write; all writes go through server functions using service role after Zod validation + rate-limit check on email/event pair
   - GRANTs: `service_role` ALL only
3. Update `getEventAdmin` / create/update schemas to accept `speakers` and `category_label`.

### Server Functions (new in `events.functions.ts` + `event-registrations.functions.ts`)

- `getPublicEvent({ id })` — public, returns event + payment row (price/currency/requires_payment) + remaining capacity. Uses publishable client; restricts to `status='published'` and `audience_visibility='public'`.
- `registerPublicForEvent({ eventId, fullName, email, quantity })` — public (no auth):
  - Validates with Zod (email regex, name length, quantity 1–10)
  - Loads event + payment row server-side; rejects if not public/published or full
  - If `requires_payment`: creates Stripe Checkout Session, writes `event_public_registrations` row with `status='pending'`, returns `{ checkoutUrl }`
  - If free: writes row `status='confirmed'`, returns `{ ok: true }`
  - Uses admin client inside handler (after validation) to bypass RLS for the insert
- Stripe webhook in existing `/api/public/webhooks/stripe.ts` (or new) marks `confirmed_at`/`status='confirmed'` on `checkout.session.completed`. If no webhook file exists, add one with signature verification.

### Admin

- `admin.events.$id.tsx` — extend the existing event editor with:
  - Category label input
  - Speakers repeater (add/remove/reorder; name, role, bio, photo URL using existing storage bucket)
- New `admin.events.$id.registrations.tsx` viewer — list public registrations for the event (read-only table) using a new admin server fn.

### Visual/Design

- Re-use brand tokens from `styles.css` (persian-indigo, damascus-gold, alabaster-parchment, hanken/playfair fonts)
- Use existing `.ogee-arch-portal` for the cover image frame
- Right registration card: white surface, horizon-mist border, persian-indigo CTA filled button with damascus-gold hover
- Responsive: two-column grid at `lg`, single column below; sticky card disabled on mobile

### Out of scope

- Member-only event detail variant (kept for follow-up — current flow only renders public events at this URL; member-only events will 404 here)
- Refunds / cancellations from the public side
- Speakers media upload UI in this pass (URLs only)

### Technical notes

- Stripe price is computed per-quantity server-side; client never sets price
- Webhook re-checks event capacity before confirming
- All public mutations protected by Zod validation, length limits, and idempotency key on the checkout endpoint
