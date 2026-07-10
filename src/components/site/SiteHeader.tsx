import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";



export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

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
      <div className="max-w-max-width mx-auto px-margin-safe h-20 flex justify-between items-center gap-3">
        <div className="flex items-center gap-4 min-w-0">
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
            href="/press"
          >
            The Press
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-damascus-gold transition-all duration-300 group-hover:w-full" />
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:inline-flex font-body text-[10px] font-bold tracking-[0.2em] uppercase text-persian-indigo hover:text-damascus-gold transition-colors py-2 px-3"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="hidden sm:inline-flex interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
              >
                Join JIY
              </Link>
            </>
          )}

          {/* Hamburger — shown below md */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-persian-indigo hover:text-damascus-gold transition-colors p-1"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <SiteMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        signedIn={signedIn}
      />
    </header>
  );
}

function SiteMobileDrawer({
  open,
  onClose,
  signedIn,
}: {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
}) {
  const goHash = useEventsHashNav();
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-persian-indigo/40 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[86%] max-w-[360px] bg-alabaster-parchment z-[70] md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="relative border-b border-horizon-mist">
          <div className="h-[3px] bg-damascus-gold" />
          <div className="flex items-center justify-between px-6 py-5">
            <span className="font-headline text-2xl font-extrabold tracking-tight text-persian-indigo leading-none">
              JIY
            </span>
            <button
              onClick={onClose}
              className="text-persian-indigo hover:text-damascus-gold transition-colors p-1"
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
            <DrawerAnchor href="/#about-us" label="About Us" onClose={onClose} />
            <DrawerLink to="/team" label="Our Team" onClose={onClose} />

            <li className="mt-2">
              <p className="px-4 pt-3 pb-1 font-body text-[9px] uppercase tracking-[0.25em] text-damascus-gold font-bold">
                Events
              </p>
              <ul className="flex flex-col">
                <DrawerLink to="/events" label="All Events" onClose={onClose} />
                <DrawerButton
                  label="Upcoming Events"
                  onClick={() => {
                    onClose();
                    goHash("#upcoming-events");
                  }}
                />
                <DrawerButton
                  label="Ongoing Events"
                  onClick={() => {
                    onClose();
                    goHash("#ongoing-events");
                  }}
                />
              </ul>
            </li>

            <DrawerAnchor href="/press" label="The Press" onClose={onClose} />
          </ul>
        </nav>

        <div className="border-t border-horizon-mist px-6 py-4 flex flex-col gap-3">
          {signedIn ? (
            <Link
              to="/dashboard"
              onClick={onClose}
              className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300 text-center"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                onClick={onClose}
                className="font-body text-[11px] uppercase tracking-[0.2em] font-semibold text-ash-slate hover:text-damascus-gold transition-colors text-center"
              >
                Login
              </Link>
              <Link
                to="/auth"
                onClick={onClose}
                className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300 text-center"
              >
                Join JIY
              </Link>
            </>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
}

function DrawerLink({ to, label, onClose }: { to: string; label: string; onClose: () => void }) {
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

function DrawerAnchor({
  href,
  label,
  onClose,
}: {
  href: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <li>
      <a
        href={href}
        onClick={onClose}
        className="block px-4 py-3 font-headline text-base text-primary-dark hover:bg-white hover:text-damascus-gold rounded-sm transition-colors border-l-2 border-transparent hover:border-damascus-gold"
      >
        {label}
      </a>
    </li>
  );
}

function DrawerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left block px-4 py-3 font-headline text-base text-primary-dark hover:bg-white hover:text-damascus-gold rounded-sm transition-colors border-l-2 border-transparent hover:border-damascus-gold"
      >
        {label}
      </button>
    </li>
  );
}
