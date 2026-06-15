export function AnnouncementsWidget() {
  return (
    <div className="studio-card rounded-xl p-6 bg-white flex flex-col gap-5">
      <div className="border-b border-horizon-mist pb-2">
        <p className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
          COMMUNITY
        </p>
        <h4 className="font-headline text-xl text-primary-dark mt-1">Announcements</h4>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="font-body text-[9px] uppercase tracking-wider text-ash-slate">
            Posted 2 days ago
          </span>
          <p className="font-headline text-base italic text-primary-dark mt-1 leading-snug">
            New Resident Scholar joining next month
          </p>
          <p className="font-body text-xs text-ash-slate mt-1.5 leading-relaxed">
            Welcoming our newest advisory chair specializing in youth sociology and classical law.
          </p>
        </div>

        <div className="h-px bg-horizon-mist/60 w-full" />

        <div className="flex flex-col">
          <span className="font-body text-[9px] uppercase tracking-wider text-ash-slate">
            Posted 5 days ago
          </span>
          <p className="font-headline text-base italic text-primary-dark mt-1 leading-snug">
            Library hours extended for finals week
          </p>
          <p className="font-body text-xs text-ash-slate mt-1.5 leading-relaxed">
            Sustained quiet study quarters will remain open until midnight, complete with
            complimentary warm tea.
          </p>
        </div>
      </div>

      <a
        href="#"
        className="font-body text-[10px] uppercase tracking-[0.15em] text-damascus-gold hover:text-primary-dark font-bold transition-colors mt-2"
      >
        View All Announcements →
      </a>
    </div>
  );
}
