import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/homepage")({
  component: HomepageAdminLayout,
});

const TABS = [
  { to: "/admin/homepage/hero", label: "Hero" },
  { to: "/admin/homepage/about", label: "About" },
  { to: "/admin/homepage/ongoing", label: "Ongoing Events" },
  { to: "/admin/homepage/values", label: "Strategic Values" },
  { to: "/admin/homepage/footer", label: "Footer" },
] as const;

function HomepageAdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div>
      <div className="px-6 sm:px-10 pt-8 pb-4 border-b border-[#e5dec9] bg-white">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#010b21] tracking-tight">Homepage</h1>
        <p className="text-sm text-[#6b6453] mt-1">
          Editable content for the public homepage at <code className="font-mono">/</code>.
        </p>
        <nav className="flex flex-wrap gap-1 mt-5">
          {TABS.map((t) => {
            const active = pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "text-xs uppercase tracking-[0.18em] px-3 py-2 rounded-sm transition-colors",
                  active ? "bg-[#010b21] text-white" : "text-[#6b6453] hover:bg-[#f3eedc]",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
