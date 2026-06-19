import { Link } from "@tanstack/react-router";

type Section = Record<string, unknown>;

const str = (sec: Section | undefined, key: string, fallback = ""): string => {
  const v = sec?.[key];
  return typeof v === "string" && v.length > 0 ? v : fallback;
};
const arr = <T,>(sec: Section | undefined, key: string, fallback: T[] = []): T[] => {
  const v = sec?.[key];
  return Array.isArray(v) && v.length > 0 ? (v as T[]) : fallback;
};

const DEFAULTS = {
  brand_tagline: "Jaffari Islamic Youth",
  nav_links: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/#about-us" },
    { label: "Our Team", href: "/team" },
    { label: "Events", href: "/events" },
  ],
  socials: [
    { network: "instagram", url: "https://instagram.com/jaffariyouth" },
    { network: "linkedin", url: "https://www.linkedin.com/company/jaffari-islamic-youth" },
    { network: "youtube", url: "https://www.youtube.com/@jaffariyouth" },
    { network: "linktree", url: "https://linktr.ee/jaffariyouth" },
  ],
  copyright: "© 2026 Jaffari Islamic Youth. All rights reserved.",
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  linktree: "#43E660",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  x: "#000000",
};

function SocialSvg({ network }: { network: string }) {
  const cls = "w-7 h-7 fill-current";
  switch (network) {
    case "instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      );
    case "linktree":
      return (
        <svg className={cls} viewBox="0 0 417 512.238" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 197.834h126.219L36.418 112.094l56.529-57.567 85.42 86.726V0h60.20v141.253l85.42-86.726 56.529 57.567-89.801 85.358H417v80.04H290.176l90.18 87.107L323.827 421.84 208.687 305.66 93.547 421.84l-56.529-56.94 90.182-87.106H0v-80.04zm178.367 124.46h60.198v189.944h-60.198V322.294z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SiteFooter({ footer }: { footer?: Section } = {}) {
  const navLinks = arr<{ label: string; href: string }>(footer, "nav_links", DEFAULTS.nav_links);
  const socials = arr<{ network: string; url: string }>(footer, "socials", DEFAULTS.socials);
  return (
    <footer className="bg-white border-t border-horizon-mist py-12 px-margin-safe w-full relative z-30">
      <div className="max-w-max-width mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-8 w-full border-b border-horizon-mist/60 pb-8 mb-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-headline text-2xl font-black tracking-tight text-persian-indigo">
              JIY
            </span>
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate mt-1 font-semibold">
              {str(footer, "brand_tagline", DEFAULTS.brand_tagline)}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body text-[11px] uppercase tracking-[0.15em] text-ash-slate font-bold">
              {navLinks.map((l, i) => (
                <a key={i} className="hover:text-damascus-gold transition-colors" href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex items-center justify-center gap-5">
              {socials.map((s) => (
                <a
                  key={s.network}
                  className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 drop-shadow-sm"
                  style={{ color: SOCIAL_COLORS[s.network] ?? "#14243b" }}
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.network}
                >
                  <SocialSvg network={s.network} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Link
              to="/auth"
              className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
            >
              Join JIY
            </Link>
          </div>
        </div>

        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate text-center font-semibold">
          {str(footer, "copyright", DEFAULTS.copyright)}
        </p>
      </div>
    </footer>
  );
}
