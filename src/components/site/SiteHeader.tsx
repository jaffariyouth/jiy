import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function EventsDropdown() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-events-dropdown]")) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const goHash = (hash: string) => {
    setOpen(false);
    if (onHome) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = hash;
    } else {
      window.location.href = `/${hash}`;
    }
  };

  return (
    <div className="relative py-1" data-events-dropdown>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover:text-damascus-gold transition-colors duration-200 flex items-center gap-1 uppercase outline-none"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Events
        <span
          className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${open ? "-rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-horizon-mist shadow-xl flex flex-col z-50 rounded-sm transition-all duration-200 ${
          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"
        }`}
        role="menu"
      >
        <Link
          to="/events"
          onClick={() => setOpen(false)}
          className="text-left px-5 py-3.5 hover:bg-alabaster-parchment hover:text-damascus-gold border-b border-horizon-mist/50 transition-colors whitespace-nowrap"
        >
          All Events
        </Link>
        <button
          type="button"
          onClick={() => goHash("#upcoming-events")}
          className="text-left px-5 py-3.5 hover:bg-alabaster-parchment hover:text-damascus-gold border-b border-horizon-mist/50 transition-colors whitespace-nowrap"
        >
          Upcoming Events
        </button>
        <button
          type="button"
          onClick={() => goHash("#ongoing-events")}
          className="text-left px-5 py-3.5 hover:bg-alabaster-parchment hover:text-damascus-gold transition-colors whitespace-nowrap"
        >
          Ongoing Events
        </button>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-horizon-mist sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-max-width mx-auto px-margin-safe h-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col group">
            <span className="font-headline text-3xl font-extrabold tracking-tight text-persian-indigo leading-none group-hover:text-damascus-gold transition-colors duration-200">
              JIY
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 font-body text-xs uppercase tracking-[0.2em] font-semibold text-ash-slate items-center">
          <a
            className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
            href="/#about-us"
          >
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
          </a>
          <Link
            to="/team"
            className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
          >
            Our Team
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
          </Link>
          <EventsDropdown />

          <a
            className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
            href="/#journal"
          >
            The Press
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="font-body text-[10px] font-bold tracking-[0.2em] uppercase text-persian-indigo hover:text-damascus-gold transition-colors py-2 px-3"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
              >
                Join JIY
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
