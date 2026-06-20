import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/jiy/profiles.functions";
import { NotificationBell } from "./NotificationBell";

const NAV = [
  { label: "Events", to: "/events" },
  { label: "Scholar Q&A", to: "/scholar-qa" },
  { label: "The Press", to: "/press" },
  { label: "Opportunity Board", to: "/opportunities" },
  { label: "Merch Shop", to: "/shop" },
] as const;

export function TopNavBar() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    staleTime: 60_000,
  });

  const displayName = profile?.displayName?.trim() || "Member";
  const initial = displayName.charAt(0).toUpperCase();
  const short = displayName.length > 18 ? `${displayName.slice(0, 16)}…` : displayName;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-horizon-mist sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-10 h-20 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-headline text-3xl font-extrabold tracking-tight text-primary-dark leading-none">
              JIY
            </span>
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-ash-slate font-bold mt-1">
              MEMBER SPACE
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex gap-8 font-body text-xs uppercase tracking-[0.2em] font-semibold text-ash-slate">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
              activeProps={{ className: "text-damascus-gold" }}
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
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
        </div>
      </div>
    </header>
  );
}
