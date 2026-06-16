import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { getMyRoles } from "@/lib/jiy/admin.functions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FormInput,
  Newspaper,
  Megaphone,
  Repeat,
  Users,
  Flag,
  ScrollText,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Console — JIY" }] }),
  beforeLoad: async () => {
    const roles = await getMyRoles();
    if (!roles.includes("admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/forms", label: "Forms", icon: FormInput },
  { to: "/admin/press", label: "Press", icon: Newspaper },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/recurring", label: "Recurring", icon: Repeat },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/flags", label: "Feature Flags", icon: Flag },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5]">
      <aside className="md:w-64 md:min-h-screen border-r border-[#e5dec9] bg-white md:sticky md:top-0">
        <div className="px-5 py-5 border-b border-[#e5dec9]">
          <Link to="/dashboard" className="block">
            <div className="font-serif text-lg tracking-tight text-[#010b21]">JIY Admin</div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#6b6453] mt-1">Console</div>
          </Link>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors shrink-0",
                  active
                    ? "bg-[#010b21] text-[#FAF8F5]"
                    : "text-[#2b2a26] hover:bg-[#f3eedc]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
