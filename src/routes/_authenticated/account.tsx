import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — JIY" }] }),
  component: AccountLayout,
});

const TABS = [
  { to: "/account", label: "Profile", exact: true },
  { to: "/account/registrations", label: "Registrations", exact: false },
  { to: "/account/submissions", label: "Submissions", exact: false },
] as const;

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-16">
        <Link
          to="/dashboard"
          className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-bold"
        >
          ← Dashboard
        </Link>

        <header className="border-b border-horizon-mist pb-8 mb-8 mt-6">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            JIY ACCOUNT
          </p>
          <h1 className="font-headline text-4xl text-primary-dark mt-3">Your account</h1>
        </header>

        <nav className="flex gap-6 border-b border-horizon-mist mb-10 font-body text-[11px] uppercase tracking-[0.2em] font-bold">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`pb-3 transition-colors ${active ? "text-primary-dark border-b-2 border-damascus-gold" : "text-ash-slate hover:text-primary-dark"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <Outlet />
      </div>
    </main>
  );
}
