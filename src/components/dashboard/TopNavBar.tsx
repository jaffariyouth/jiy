import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown, LogOut, Shield } from "lucide-react";
import { getMyProfile } from "@/lib/jiy/profiles.functions";
import { getMyRoles } from "@/lib/jiy/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "./NotificationBell";

type NavLeaf = { label: string; to: string };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const NAV: NavItem[] = [
  { label: "Events", to: "/dashboard/events" },
  { label: "Scholar Q&A", to: "/dashboard/scholar-qa" },
  { label: "The Press", to: "/dashboard/press" },
  {
    label: "RESOURCES",
    children: [
      { label: "Opportunity Board", to: "/dashboard/opportunities" },
    ],
  },
  { label: "Merch Shop", to: "/dashboard/shop" },
];

function isGroup(item: NavItem): item is { label: string; children: NavLeaf[] } {
  return "children" in item;
}

export function TopNavBar() {
  const fetchProfile = useServerFn(getMyProfile);
  const fetchRoles = useServerFn(getMyRoles);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    staleTime: 60_000,
  });
  const { data: roles } = useQuery({
    queryKey: ["my-roles"],
    queryFn: () => fetchRoles(),
    staleTime: 60_000,
  });
  const isAdmin = roles?.includes("admin") ?? false;

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  const short = displayName.length > 18 ? `${displayName.slice(0, 16)}…` : displayName;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openDropdown]);

  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-horizon-mist sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex justify-between items-center gap-3">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-4 shrink-0 min-w-0">
          <div className="flex flex-col">
            <span className="font-headline text-2xl lg:text-3xl font-extrabold tracking-tight text-primary-dark leading-none">
              JIY
            </span>
            <span className="font-body text-[9px] lg:text-[10px] uppercase tracking-[0.25em] text-ash-slate font-bold mt-1 whitespace-nowrap">
              MEMBER SPACE
            </span>
          </div>
        </Link>

        {/* Desktop nav — fluid sizing */}
        <nav
          ref={dropdownRef}
          className="hidden lg:flex items-center gap-4 xl:gap-7 font-body uppercase tracking-[0.16em] xl:tracking-[0.2em] font-semibold text-ash-slate text-xs xl:text-sm min-w-0"
        >
          {NAV.map((item) => {
            if (isGroup(item)) {
              const open = openDropdown === item.label;
              return (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setOpenDropdown(open ? null : item.label)}
                    className="flex items-center gap-1 hover:text-damascus-gold transition-colors duration-200 py-1 group whitespace-nowrap uppercase"
                    aria-haspopup="menu"
                    aria-expanded={open}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      strokeWidth={2.5}
                    />
                  </button>
                  {open ? (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 min-w-[220px] bg-white border border-horizon-mist rounded-lg shadow-lg overflow-hidden">
                      <div className="h-[3px] bg-damascus-gold" />
                      <ul className="py-2">
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <Link
                              to={child.to}
                              onClick={() => setOpenDropdown(null)}
                              className="block px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.18em] font-semibold text-primary-dark hover:bg-alabaster-parchment hover:text-damascus-gold transition-colors"
                              activeProps={{ className: "text-damascus-gold" }}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group whitespace-nowrap"
                activeProps={{ className: "text-damascus-gold" }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        {/* Right rail */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <NotificationBell />
          <div className="h-6 w-px bg-horizon-mist hidden sm:block" />
          <Link
            to="/account"
            className="flex items-center gap-3 cursor-pointer group"
            aria-label="Account"
          >
            <div className="text-right hidden sm:block">
              <p className="font-body text-xs font-bold text-primary-dark group-hover:text-damascus-gold transition-colors">
                {short}
              </p>
              <p className="font-body text-[9px] tracking-wider text-ash-slate uppercase font-medium">
                Member
              </p>
            </div>
            <span
              aria-hidden
              className="w-9 h-9 rounded-full bg-damascus-gold/15 text-damascus-gold flex items-center justify-center font-headline text-base font-bold transition-transform group-hover:scale-105"
            >
              {initial}
            </span>
          </Link>

          {/* Hamburger — shown below lg */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden text-primary-dark hover:text-damascus-gold transition-colors p-1"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[86%] max-w-[360px] bg-alabaster-parchment z-[70] lg:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header band — gold rule echoes the dropdown */}
        <div className="relative border-b border-horizon-mist">
          <div className="h-[3px] bg-damascus-gold" />
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex flex-col">
              <span className="font-headline text-2xl font-extrabold tracking-tight text-primary-dark leading-none">
                JIY
              </span>
              <span className="font-body text-[9px] uppercase tracking-[0.25em] text-ash-slate font-bold mt-1">
                MEMBER SPACE
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-primary-dark hover:text-damascus-gold transition-colors p-1"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="px-4 pb-3 font-body text-[10px] uppercase tracking-[0.25em] text-ash-slate font-bold">
            Navigate
          </p>
          <ul className="flex flex-col gap-1">
            {NAV.map((item) =>
              isGroup(item) ? (
                <li key={item.label} className="mt-2">
                  <p className="px-4 pt-3 pb-1 font-body text-[9px] uppercase tracking-[0.25em] text-damascus-gold font-bold">
                    {item.label}
                  </p>
                  <ul className="flex flex-col">
                    {item.children.map((child) => (
                      <DrawerLink key={child.to} to={child.to} label={child.label} onClose={onClose} />
                    ))}
                  </ul>
                </li>
              ) : (
                <DrawerLink key={item.to} to={item.to} label={item.label} onClose={onClose} />
              ),
            )}
          </ul>
        </nav>

        <div className="border-t border-horizon-mist px-6 py-4">
          <Link
            to="/account"
            onClick={onClose}
            className="block font-body text-[11px] uppercase tracking-[0.2em] font-semibold text-ash-slate hover:text-damascus-gold transition-colors"
          >
            Account & Settings →
          </Link>
        </div>
      </aside>
    </>,
    document.body,
  );
}

function DrawerLink({
  to,
  label,
  onClose,
}: {
  to: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClose}
        className="block px-4 py-3 font-headline text-base text-primary-dark hover:bg-white hover:text-damascus-gold rounded-sm transition-colors border-l-2 border-transparent hover:border-damascus-gold"
        activeProps={{
          className:
            "block px-4 py-3 font-headline text-base text-damascus-gold bg-white rounded-sm border-l-2 border-damascus-gold",
        }}
      >
        {label}
      </Link>
    </li>
  );
}
