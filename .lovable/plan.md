## Phase 2 — Core JIY Models

Goal: stand up the three content domains (`events`, `scholar_questions`, `youth_press_articles`) with strict RLS, audit logging, idempotency, and TanStack server functions for CRUD. No UI work beyond minimal wiring so a smoke test is possible — full pages come later.

### Turn 1 — Migration (one big SQL file)

**Enums**
- `event_status`: `draft | published | completed | cancelled`
- `question_status`: `pending_triage | assigned | answered | rejected`
- `article_status`: `draft | in_review | published`
- `age_demographic` already covered by profiles? if not, skip.

**Tables** (all with `id uuid PK`, `created_at`, `updated_at`, `set_updated_at` trigger)

1. `events`
   - `title text NOT NULL`, `description text`, `location text`, `starts_at timestamptz NOT NULL`, `ends_at timestamptz`, `capacity int`, `status event_status NOT NULL DEFAULT 'draft'`, `is_member_only bool NOT NULL DEFAULT false`, `created_by uuid REFERENCES profiles(id)`, `cover_image_url text`
   - Validation trigger: `ends_at > starts_at`, `capacity >= 0`.

2. `scholar_questions`
   - `submitter_id uuid NOT NULL REFERENCES profiles(id)`, `question_text text NOT NULL CHECK (char_length <= 2000)`, `is_anonymous bool NOT NULL DEFAULT false`, `status question_status NOT NULL DEFAULT 'pending_triage'`, `assigned_scholar_id uuid REFERENCES profiles(id)`, `answer_text text`, `answered_at timestamptz`, `category text`

3. `youth_press_articles`
   - `author_id uuid NOT NULL REFERENCES profiles(id)`, `title text NOT NULL`, `slug text UNIQUE NOT NULL`, `body_md text NOT NULL`, `excerpt text`, `cover_image_url text`, `status article_status NOT NULL DEFAULT 'draft'`, `published_at timestamptz`, `editor_id uuid REFERENCES profiles(id)`

**GRANTS** (every table): `authenticated` gets CRUD, `service_role` gets ALL, `anon` gets SELECT only on `events` and `youth_press_articles` (public reads are policy-gated by status).

**RLS** (default deny, enable on all three)

- `events`
  - SELECT public: `status = 'published' AND is_member_only = false`
  - SELECT members: `status = 'published' AND is_member_only = true` — requires `has_role(uid,'member_isij') OR has_role(uid,'member_standalone') OR has_role(uid,'scholar') OR has_role(uid,'admin')`
  - SELECT admins: any row, via `has_role(uid,'admin')`
  - INSERT/UPDATE/DELETE: admin only

- `scholar_questions`
  - SELECT submitter: `submitter_id = auth.uid()`
  - SELECT scholar (assigned): `has_role(uid,'scholar') AND assigned_scholar_id = auth.uid()`
  - SELECT public-answered: `status = 'answered'` (the column-level anonymity is handled at the DTO layer in the server function — RLS returns the row, the function strips `submitter_id` when `is_anonymous`)
  - SELECT admin: any
  - INSERT: any authenticated user, only with `submitter_id = auth.uid()` and `status = 'pending_triage'` (WITH CHECK)
  - UPDATE: admins (triage/assign/reject) or assigned scholar (answer their own only)
  - DELETE: admin only

- `youth_press_articles`
  - SELECT public: `status = 'published'`
  - SELECT author: own drafts
  - SELECT editor/admin: any
  - INSERT: authenticated, `author_id = auth.uid()`, `status = 'draft'`
  - UPDATE: author on own drafts; editor/admin always
  - DELETE: admin only

No CHECK constraints with `now()` — use validation triggers.

### Turn 2 — Server functions + minimal route wiring

Files (client-safe `.functions.ts` under `src/lib/`):

- `src/lib/events.functions.ts`
  - `listPublicEvents()` — public, no middleware, anon-readable
  - `listMemberEvents()` — `requireSupabaseAuth`
  - `createEvent`, `updateEvent`, `publishEvent`, `cancelEvent` — auth + `has_role` admin check, idempotency key required, writes `audit_log_write`

- `src/lib/scholar-questions.functions.ts`
  - `submitQuestion` — auth, idempotency, audit. Validates length with Zod.
  - `listMyQuestions`, `listAssignedToMe` (scholar), `listTriageQueue` (admin)
  - `assignQuestion`, `answerQuestion`, `rejectQuestion` — role-gated
  - `listPublicAnswered` — strips `submitter_id` when `is_anonymous`

- `src/lib/youth-press.functions.ts`
  - `createDraft`, `updateDraft`, `submitForReview`, `publishArticle` (editor/admin), `listPublishedArticles` (public), `getArticleBySlug`

All mutating fns:
1. Zod-validate input
2. Authorize (middleware + `has_role` RPC where needed)
3. Check/insert `idempotency_keys`
4. Single transactional intent
5. Call `audit_log_write` RPC
6. Return plain DTO

**Route wiring** (only the bare minimum needed to verify):
- Update `/events` public route to render `listPublicEvents()` via `ensureQueryData`.
- Keep `/dashboard` etc. unchanged this phase.

No new UI pages, no admin dashboard yet — those come in Phase 4.

### Out of scope for Phase 2 (Phase 3/4)

- `event_registrations`, check-in flow
- `notifications` table + send-notification function
- `recurring_events`
- Admin dashboard pages, retention crons, health checks

### Risks / decisions to confirm

1. **Anonymity model** — RLS lets anyone with role X see the row; the server function strips PII when `is_anonymous`. Alternative is a SECURITY DEFINER view. Going with server-fn DTO stripping for simplicity. OK?
2. **anon SELECT on `events` / `youth_press_articles`** — needed so the public landing page renders without auth. OK?
3. **Idempotency on reads** — skipping; idempotency_keys only on mutations.
4. No `recurring_events` this phase — the spec lists it but it's tangled with event_registrations. Defer to Phase 3.

Reply "go" to execute Turn 1 (migration). I'll stop after submitting the migration for your approval, then do Turn 2 once types regenerate.
