## UI changes: registration state, sponsor form, volunteer form

### 1. Event "Register" button reflects registered state

**File:** `src/routes/_authenticated/dashboard.events.$eventId.tsx`

- `getMemberEvent` already returns the event; extend the server fn (in `src/lib/jiy/events.functions.ts`) to also return `isRegistered: boolean` by checking `event_registrations` for the current `userId + eventId`.
- In the detail page, if `data.isRegistered || mut.isSuccess`, render a disabled button styled in damascus-gold with a check icon and label "Registered ✓" instead of the active "Confirm Registration →" CTA. Hide the click handler.
- Keep the existing success path; on mutation success, invalidate `["member-event", eventId]` so the server-truth `isRegistered` flips.

### 2. Sponsor Tabarruk modal → appreciation + contact form

**File:** `src/components/dashboard/SponsorModal.tsx` (sponsor branch only; ticket branch untouched)

Replace the two event buttons with a single form:
- Heading: "Sponsor Tabarruk"
- Appreciation copy: "Thank you for choosing to sponsor tabarruk for your marhumeen. Your generosity helps nourish our youth gatherings."
- Fields:
  - Phone number (required, `tel`, validated: non-empty, max 30 chars, basic digits/`+`/spaces regex)
  - Amount (optional, `number`, min 0)
  - Message (optional, `textarea`, max 500 chars)
- Submit button "Submit" (gold CTA matching dashboard style).
- Footer line: *"Any amount is appreciated. Jazakallah."*
- On submit: call a new server fn `submitSponsorInterest` and on success swap the modal body to a confirmation state ("Thank you — we'll be in touch shortly.") with a Close button. Errors render inline in deep-garnet.

### 3. Volunteer Corps widget → contact form + submitted state

**File:** `src/components/dashboard/VolunteerCorpWidget.tsx`

- Replace the single "Apply to Volunteer" button with an inline form (collapsible: button toggles the form open, or always visible — keeping the card compact, default to **always visible** below the description).
- Fields:
  - Phone number (required, `tel`, WhatsApp-reachable, same validation as sponsor)
  - Message (optional, textarea, max 500 chars)
- Submit "Apply to Volunteer".
- On success: replace the card body with a confirmation state ("Application submitted ✓ — we'll reach out on WhatsApp shortly.") styled in the gold/indigo palette. Persist via local state for the session.
- Also fire the existing `dispatchToast` for consistency.

### 4. Backend: persist sponsor + volunteer interests

**New table** (single migration, RLS + grants per project conventions):

```text
interest_submissions
  id uuid pk
  kind text check in ('sponsor','volunteer')
  user_id uuid null (auth.uid() at submit time, nullable for safety)
  phone text not null
  amount numeric null         -- sponsor only
  message text null
  created_at timestamptz default now()
```

Policies:
- `INSERT` allowed to `authenticated` (with `user_id = auth.uid()` or null check).
- `SELECT` restricted to admins via `has_role(auth.uid(), 'admin')`.
- Grants: `INSERT` to `authenticated`, `ALL` to `service_role`, `SELECT` to `authenticated` (RLS narrows to admins).

**New server fns** in `src/lib/jiy/interests.functions.ts`:
- `submitSponsorInterest({ phone, amount?, message? })` — zod validation, uses `requireSupabaseAuth`, inserts row with `kind='sponsor'`.
- `submitVolunteerInterest({ phone, message? })` — same pattern, `kind='volunteer'`.

Admin viewing of submissions is **out of scope** for this turn (the question below covers it).

### Technical details

- All new inputs validated client-side with zod (phone non-empty, ≤30 chars, regex `^[+0-9()\-\s]+$`; message ≤500; amount ≥0).
- Modal and widget keep current editorial styling (warm-silk-grey, damascus-gold border, primary-dark text). No new color tokens.
- No changes to email/notification system (deferred per earlier instruction).

### Open question

Do you want an admin page now to view sponsor/volunteer submissions (e.g. `/admin/interests`), or is storing to the DB enough for this pass and we add the admin view in a follow-up?
