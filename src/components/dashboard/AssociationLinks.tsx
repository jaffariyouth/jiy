import { Link } from "@tanstack/react-router";

type GateLink =
  | { label: string; to: string; external?: false }
  | { label: string; href: string; external: true };

const LINKS: GateLink[] = [
  { label: "Fajr Football", to: "/dashboard/ongoing-events" },
  { label: "Monday Mubahatha", to: "/dashboard/ongoing-events" },
  { label: "Job Referral Board", to: "/dashboard/opportunities" },
  { label: "Merch Storefront", to: "/dashboard/shop" },
  { label: "ISIJ Member Portal", href: "https://jaffari.org", external: true },
];

export function AssociationLinks() {
  return (
    <div className="border-t border-b border-double border-horizon-mist py-5 flex flex-col gap-3">
      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold mb-1">
        Quick Gate Hub
      </p>
      {LINKS.map((link) => {
        const content = (
          <>
            <span>{link.label}</span>
            <span
              className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              arrow_forward
            </span>
          </>
        );
        const cls =
          "font-headline text-base italic text-primary-dark hover:text-damascus-gold transition-colors flex items-center justify-between group";
        return link.external ? (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {content}
          </a>
        ) : (
          <Link key={link.label} to={link.to} className={cls}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
