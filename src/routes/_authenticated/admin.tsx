import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { getMyRoles } from "@/lib/jiy/admin.functions";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  Home,
  Briefcase,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
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

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/team", label: "Team Page", icon: Users },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/forms", label: "Forms", icon: FormInput },
  { to: "/admin/press", label: "Press", icon: Newspaper },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/admin/shop-waitlist", label: "Shop waitlist", icon: ShoppingBag },
  { to: "/admin/recurring", label: "Recurring", icon: Repeat },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/flags", label: "Feature Flags", icon: Flag },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5]">
      <aside
        className={cn(
          "border-r border-[#e5dec9] bg-white md:sticky md:top-0 transition-all duration-300 md:min-h-screen flex flex-col shrink-0",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div className="px-5 py-5 border-b border-[#e5dec9] flex items-center justify-between min-h-[73px]">
          {!isCollapsed && (
            <Link to="/dashboard" className="block truncate">
              <div className="font-serif text-lg tracking-tight text-[#010b21]">JIY Admin</div>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b6453] mt-1">Console</div>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/dashboard" className="mx-auto font-serif text-xl font-bold tracking-tight text-[#010b21]">
              JIY
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-[#f3eedc] text-[#6b6453] transition-colors cursor-pointer ml-auto"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible flex-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all duration-200 shrink-0",
                  isCollapsed ? "md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto" : "",
                  active
                    ? "bg-[#010b21] text-[#FAF8F5]"
                    : "text-[#2b2a26] hover:bg-[#f3eedc]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
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
