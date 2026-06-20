
# Member dashboard + emails — multi-stage plan

Two parallel tracks. Each stage is shippable on its own; do not combine.

---

## Track A — Member dashboard & member pages

Today `/dashboard` renders a beautifully designed shell, but the widgets use placeholder data and the top-nav links (`Events`, `Scholar Q&A`, `The Press`, `Opportunity Board`, `Merch Shop`) all point to `#`. The user (`"Ali R."`) is hardcoded. None of the member-facing pages behind those nav links exist yet.

### Stage A1 — Make the dashboard real
Wire the existing shell to live data with no visual redesign.
- Replace hardcoded `Ali R.` / `Member` with the signed-in profile (`getMyProfile`).
- `WelcomeBlock`, `UpcomingEvents`, `RegistrationTicket` → pull from `events` + `event_registrations` (server fns already exist).
- `AnnouncementsWidget` → `announcements` (server fn exists).
- `EditorialJournalFeed` → latest published `youth_press_articles`.
- `VolunteerCorpWidget` / `AssociationLinks` → static for now, content sourced from a new `site_content` section `dashboard.sidebar` so admin can edit copy.
- `TopNavBar` links become real `<Link>`s to the routes built in A2/A3.

### Stage A2 — Public/member content pages (read-only)
Create the routes the nav promises. Public reads, but signed-in users see "save / RSVP / ask" CTAs.
- `/press` — index of published `youth_press_articles`, with `/press/$slug` detail.
- `/scholar-qa` — list answered `scholar_questions`, with `/scholar-qa/ask` form (auth required) that uses the existing `askQuestion` server fn.
- `/opportunities` — read-only board backed by a new `opportunities` table (admin-managed). One migration: table + RLS + grants + admin CRUD route under `_authenticated/admin.opportunities.*`.
- `/shop` — placeholder route only (no commerce yet); shows "coming soon" + email-me-when-live opt-in writing to a new `shop_waitlist` table. Keep scope tight; full Stripe is out of scope here.

### Stage A3 — Member self-service area
Routes under `_authenticated/` so they're gated automatically.
- `/account` — view/edit profile (calls existing `updateMyProfile`), change password, manage notification preferences (see B3).
- `/account/registrations` — list of the member's event registrations with cancel button.
- `/account/submissions` — their scholar questions + press article drafts.

### Stage A4 — Notifications inbox
- `notifications` rows already exist. Add an in-app bell in `TopNavBar` with unread count + dropdown listing recent rows. Mark-as-read writes back via a new `markNotificationRead` server fn.

---

## Track B — Email + notification delivery

Today `enqueue_notification` writes rows to `public.notifications`, but nothing drains the queue or sends email. The user has Supabase but Lovable Emails infra isn't set up yet on this stack.

### Stage B1 — Email infrastructure
- Verify/create an email domain via the Lovable Emails setup flow (one-time DNS step by the user).
- Run `email_domain--setup_email_infra` (creates pgmq queues, cron, vault secret).
- Run `email_domain--scaffold_auth_email_templates` — brand the six auth templates (signup confirm, magic link, recovery, invite, email change, reauth) with JIY colors/fonts.
- Run `email_domain--scaffold_transactional_email` — gets us `/lovable/email/transactional/send`, preview, unsubscribe, suppression.

### Stage B2 — Bridge existing `notifications` queue → email sender
- New TanStack server route (cron-triggered) `/api/public/notifications/drain` that:
  1. Selects pending `notifications` rows where `channel='email'` and `scheduled_for <= now()`.
  2. Resolves recipient email from `auth.users` via admin client.
  3. Calls `sendTransactionalEmail({ templateName, recipientEmail, idempotencyKey: notification.id, templateData: payload })`.
  4. Updates the row's status (`sent` / `failed`) + writes `notification_deliveries`.
- pg_cron schedule: every minute. Idempotent via the notification id.

### Stage B3 — Email templates for each event
Create React Email templates in `src/lib/email-templates/`:
- `event-registration-confirmation` — already enqueued by `event-registrations.functions.ts`.
- `scholar-question-received` (admin broadcast) + `scholar-question-answered` (asker) — already enqueued.
- `event-reminder-24h` — new cron-enqueued reminder.
- `announcement-published` — fanned out to opted-in members when admin publishes.
- `welcome` — on signup (hook into `handle_new_user`).
- `password-changed`, `email-changed` — wired via auth templates in B1.

### Stage B4 — Member preferences
- Add `notification_prefs` jsonb to `profiles` (per-template-key opt in/out).
- `/account` UI to toggle.
- Drain worker (B2) skips emails when prefs say off.
- Unsubscribe link in every email already handled by Lovable Emails infra; we just persist the unsubscribe token mapping to the right `template_key`.

---

## Suggested shipping order

1. **B1** (email infra & domain) — depends on user doing DNS, so start early in parallel.
2. **A1** (live dashboard data) — small, immediately visible.
3. **A2** (Press + Scholar Q&A + Opportunities public pages).
4. **B2 + B3** (drain worker + first 3 templates) — once B1 is verified.
5. **A3** (account self-service) + **B4** (prefs).
6. **A4** (in-app inbox) + remaining templates.
7. **A2/shop** waitlist last; full commerce is its own future plan.

---

## Open questions before build
- For `/opportunities`: should members be able to submit opportunities, or admin-only?
- For `/shop`: confirm "coming soon + waitlist" is enough for now vs. full Stripe storefront.
- For emails: do you already own a sender domain (e.g. `notify.jiy.org`) or do you want to buy one through Lovable?
