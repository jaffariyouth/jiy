const LINKS = [
  "Fajr Football",
  "Monday Mubahatha",
  "Job Referral Board",
  "Merch Storefront",
  "ISIJ Member Portal",
];

export function AssociationLinks() {
  return (
    <div className="border-t border-b border-double border-horizon-mist py-5 flex flex-col gap-3">
      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold mb-1">
        Quick Gate Hub
      </p>
      {LINKS.map((label) => (
        <a
          key={label}
          href="#"
          className="font-headline text-base italic text-primary-dark hover:text-damascus-gold transition-colors flex items-center justify-between group"
        >
          <span>{label}</span>
          <span
            className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ fontVariationSettings: "'wght' 300" }}
          >
            arrow_forward
          </span>
        </a>
      ))}
    </div>
  );
}
