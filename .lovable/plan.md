## Three fixes

### 1. Add "All Events" to the homepage Events dropdown
In `src/routes/index.tsx`, the `EventsDropdown` (around line 207) currently has only two items: "Upcoming Events" and "Ongoing Events" — both scroll to homepage hashes. Add a third item **"All Events"** at the top that uses TanStack `<Link to="/events">` so users can jump to the full events list page.

### 2. Use the homepage header on all non-logged-in pages
The homepage has a polished `<Header />` (logo, About Us, Our Team, Events dropdown, The Press, Login / Join JIY buttons). The `/events` list and `/events/$eventId` detail pages currently have their own slim ad‑hoc top bar with just "Home / Our Team / Events" + "Join JIY".

- Extract the homepage `Header` and `EventsDropdown` into a shared file: `src/components/site/SiteHeader.tsx`.
- Update `src/routes/index.tsx` to import + use it (no visual change to homepage).
- Replace the local `<header>` in `src/routes/events.tsx` and `src/routes/events.$eventId.tsx` with `<SiteHeader />`.
- `signedIn` state: read the Supabase session the same way the homepage does (inside `SiteHeader` itself, via the same `supabase.auth.getSession()` + `onAuthStateChange` effect used in `HomePage`), so the header works on every public route without prop wiring.
- Apply the same to other public pages that ship their own header (`/team`) if they exist — check and swap.

### 3. Fix "click event → nothing happens" (event detail page is glitched)
Root cause: file-routing collision. We have both `src/routes/events.tsx` (the list page, route id `/events`) and `src/routes/events.$eventId.tsx` (detail, route id `/events/$eventId`). TanStack treats `events.tsx` as a **parent layout** of `events.$eventId.tsx`, but `events.tsx`'s component renders the list directly with **no `<Outlet />`**. Result: navigating to `/events/{id}` matches the child route, but the parent never gives it a place to render → blank screen / "nothing happens".

Fix: rename `src/routes/events.tsx` → `src/routes/events.index.tsx` and update its `createFileRoute("/events")` to `createFileRoute("/events/")`. Now `events.index.tsx` is the leaf for `/events`, `events.$eventId.tsx` is a sibling leaf, and there is no broken parent layout. (Alternative — keep `events.tsx` as a layout that returns `<Outlet />` and move the list into `events.index.tsx` — same end result, more files.) Going with the simple rename.

## Out of scope
- No backend / data changes.
- No new copy or design changes to the homepage header itself — it's lifted as‑is.

## Files touched
- `src/components/site/SiteHeader.tsx` *(new — extracted header + dropdown)*
- `src/routes/index.tsx` *(use `SiteHeader`, add "All Events" link in dropdown)*
- `src/routes/events.tsx` → **rename** to `src/routes/events.index.tsx`, swap local header for `SiteHeader`, update `createFileRoute` path
- `src/routes/events.$eventId.tsx` *(swap local header for `SiteHeader`)*
- `src/routes/team.tsx` *(swap to `SiteHeader` if it has a custom header)*
