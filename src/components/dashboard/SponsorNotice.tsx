import { useDashboard } from "./DashboardContext";

export function SponsorNotice() {
  const { openModal } = useDashboard();
  return (
    <section className="bg-midnight-sapphire text-white w-full border-b border-damascus-gold/20 py-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-damascus-gold/15 via-transparent to-transparent opacity-60" />
      <div className="max-w-[1280px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <p className="font-headline text-lg italic text-white/95">
            Sponsor Tabarruk for your Marhumeen
          </p>
          <p className="font-body text-xs text-white/80">
            Honor your loved ones by providing food and refreshments for our youth gatherings.
          </p>
        </div>
        <button
          onClick={() => openModal("sponsor")}
          className="interactive-btn border border-damascus-gold text-damascus-gold hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.15em] py-2 px-5 rounded-[4px] uppercase shrink-0 transition-all duration-300"
        >
          Sponsor an Event
        </button>
      </div>
    </section>
  );
}
