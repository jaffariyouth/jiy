## Phase 1 — Signup, Profile, Role Assignment (no Turnstile, ISIJ stub)

Goal: a working auth + onboarding flow so a new user can sign up, complete their profile, and (manually, by an admin) be flipped to `member_isij`. Stripe and Turnstile are deferred — everyone gets full access until those land.

### Decisions locked in
- **No CAPTCHA**: skip Turnstile entirely this phase. Signup is open email/password.
- **ISIJ sync: option C (stub)**. `isij_registry_cache` stays in schema but is not populated. Admins flip a user to `member_isij` manually via an admin action; the row in `isij_registry_cache` is created at the same time as a placeholder. Real external sync = future phase.
- **No Stripe / subscription gate**: every authenticated user has full member-level access. `member_standalone` role + `subscriptions` table remain in schema, unused.

### Turn 1 — Auth routes + profile completion

**New files:**
- `src/routes/auth.tsx` — pathless `/auth` page: tabs for Sign In / Sign Up. Uses `supabase.auth.signInWithPassword` and `signUp`. On signup success → redirect to `/onboarding`. On signin → `/dashboard`.
- `src/routes/_authenticated.tsx` — pathless layout route gating all signed-in pages. Reads session; redirects to `/auth` if missing. Renders `<Outlet />`.
- `src/routes/_authenticated/onboarding.tsx` — first-time profile completion form: `display_name`, `age_demographic`, `country`, `consent_marketing` (bool). Writes to `profiles` via a server fn.
- `src/lib/jiy/profiles.functions.ts`:
  - `getMyProfile()` — auth, returns own profile row.
  - `updateMyProfile(input)` — auth, Zod-validated, idempotency + audit.
  - `markOnboardingComplete()` — auth, sets `onboarding_completed_at`.

**Migration:**
- Add `profiles.display_name text`, `country text`, `consent_marketing bool default false`, `onboarding_completed_at timestamptz` (if missing — verify before writing migration).
- No new tables.

**Move `/dashboard` and `/events` (member-only views) under `_authenticated/`** by renaming `src/routes/dashboard.tsx` → `src/routes/_authenticated/dashboard.tsx`. Public `/events` stays public (already anon-readable).

### Turn 2 — Role assignment + admin stub

**Server functions** (`src/lib/jiy/admin.functions.ts`):
- `listUsers({ search, limit, offset })` — admin only. Joins `profiles` + `user_roles`.
- `grantRole({ userId, role })` / `revokeRole({ userId, role })` — admin only, audit-logged. Cannot self-revoke admin (guard).
- `markUserAsISIJMember({ userId, isijId, expiresAt })` — admin only. Inserts/updates `isij_registry_cache` row AND grants `member_isij` role in one transactional intent (two writes, both audited).

**Bootstrap admin**: a tiny migration that, *only if `user_roles` is empty*, no-ops (admins must be granted manually via SQL once). Document this in the plan output — first admin is set by the user running a one-liner in the SQL editor.

**Default role on signup**: a trigger on `auth.users` insert that runs `handle_new_user` (already exists for `profiles`). Extend it to also INSERT a `user_roles` row with role `member_standalone` so everyone has at least one role and the "everyone gets access" policy works via `has_role(uid, 'member_standalone')` checks elsewhere.

**Admin page** (`src/routes/_authenticated/admin/users.tsx`):
- Guarded client-side by `has_role` check (server fn `getMyRoles()`); RLS is the real gate.
- Table of users with role chips, search, and buttons: Grant admin / Grant scholar / Mark as ISIJ member / Revoke.
- Minimal UI — shadcn `Table`, `Dialog`, `Input`. No fancy filtering this phase.

### Turn 3 — Wiring + smoke test

- Update `__root.tsx` nav: show Sign In/Sign Out, link to /dashboard and /admin/users (admin-only).
- Update `_authenticated` layout: if `onboarding_completed_at` is null and path isn't `/onboarding`, redirect to `/onboarding`.
- Smoke-test script in plan output: sign up → onboarding → /dashboard renders → admin grants `member_isij` → user's role list updates.

### Out of scope (deferred)
- Cloudflare Turnstile signup gate (Phase 1.5 when keys arrive)
- Stripe checkout + `subscriptions` enforcement (later phase)
- External ISIJ registry API sync (later phase — admin manually flips users for now)
- Password reset / email verification customization (uses Supabase defaults)

### Risks / call-outs
1. **First admin bootstrap**: the user will need to run `INSERT INTO user_roles (user_id, role) VALUES ('<their uid>', 'admin');` in the SQL editor after their first signup. I'll surface a SQL editor link in the chat after Turn 2.
2. **Default `member_standalone` for everyone** is a *temporary* substitute for the Stripe gate. When Stripe lands, this default goes away and the trigger only grants on successful checkout. Flagged in code with a `// TODO(stripe): remove default role grant` comment.
3. **No email confirmation flow customizing**: Supabase's default confirm email is used. If you want a branded one, that's a separate task.

Reply "go" to execute Turn 1 (auth routes + onboarding + profile migration).
