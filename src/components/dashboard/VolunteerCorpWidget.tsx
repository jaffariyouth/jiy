import { useDashboard } from "./DashboardContext";

export function VolunteerCorpWidget() {
  const { dispatchToast } = useDashboard();
  return (
    <div className="bg-warm-silk-grey border border-horizon-mist rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-damascus-gold" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-damascus-gold" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-damascus-gold" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-damascus-gold" />

      <p className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold mb-1 text-center">
        VOLUNTEER CORPS
      </p>
      <h4 className="font-headline text-2xl text-primary-dark mb-3 text-center">
        Shape the Future of JIY
      </h4>
      <p className="font-body text-xs text-ash-slate leading-relaxed mb-5 text-center">
        Join our dedicated team of youth volunteers and help us organize summits, coordinate press
        events, and build our growing community.
      </p>
      <button
        onClick={() =>
          dispatchToast("Thank you! Application submitted to the Volunteer Corps.")
        }
        className="interactive-btn w-full bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-6 rounded-[4px] uppercase transition-all duration-300"
      >
        Apply to Volunteer
      </button>
    </div>
  );
}
