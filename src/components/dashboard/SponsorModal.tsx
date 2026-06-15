import { useDashboard } from "./DashboardContext";

export function SponsorModal() {
  const { modal, dismissModal, dispatchToast } = useDashboard();

  const complete = (ctx: string) => {
    dismissModal();
    dispatchToast(`Sponsorship request submitted for ${ctx}.`);
  };

  return (
    <div
      className={`fixed inset-0 bg-primary-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        modal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white border border-damascus-gold max-w-md w-full p-8 relative rounded-lg editorial-double-border shadow-2xl">
        <button
          onClick={dismissModal}
          className="absolute top-4 right-4 text-ash-slate hover:text-primary-dark transition-colors"
          aria-label="Dismiss Modal"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'wght' 300" }}
          >
            close
          </span>
        </button>

        {modal === "sponsor" && (
          <div className="text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold mb-2">
              SPONSORSHIP
            </p>
            <h3 className="font-headline text-2xl text-primary-dark mb-4">Sponsor Tabarruk</h3>
            <p className="font-body text-xs text-ash-slate leading-relaxed mb-6">
              Honor your loved ones by providing healthy meals and refreshments for our upcoming
              youth gatherings.
            </p>
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => complete("July 15 - Theology")}
                className="border border-horizon-mist hover:border-damascus-gold p-3.5 text-left hover:bg-warm-silk-grey/20 transition-all font-body text-xs text-primary-dark flex justify-between items-center rounded-lg"
              >
                <span>July 15: Theology in the Digital Age</span>
                <span className="text-damascus-gold font-bold">→</span>
              </button>
              <button
                onClick={() => complete("August 02 - Leadership")}
                className="border border-horizon-mist hover:border-damascus-gold p-3.5 text-left hover:bg-warm-silk-grey/20 transition-all font-body text-xs text-primary-dark flex justify-between items-center rounded-lg"
              >
                <span>August 02: Community Leadership Workshop</span>
                <span className="text-damascus-gold font-bold">→</span>
              </button>
            </div>
          </div>
        )}

        {modal === "ticket" && (
          <div className="text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold mb-2">
              MEMBER PASS
            </p>
            <h3 className="font-headline text-2xl text-primary-dark mb-4">
              Youth Summit Summer 2026
            </h3>
            <p className="font-body text-xs text-ash-slate leading-relaxed mb-6">
              Scan this ticket confirmation pass at the registration booth for immediate entrance
              clearance.
            </p>
            <div className="bg-warm-silk-grey/30 p-4 border border-horizon-mist inline-block mb-6 rounded-lg">
              <svg
                className="w-40 h-40 text-primary-dark mx-auto fill-current"
                viewBox="0 0 100 100"
              >
                <path d="M0 0h30v10H10v20H0V0zm70 0h30v30H90V10H70V0zM0 70h10v20h20v10H0V70zm100 0v30H70v-10h20V70h10zM20 20h20v20H20V20zm50 0h10v10H70V20zm10 10h10v10H80V30zM20 70h20v20H20V70zm50 10h10v10H70V80zm10-10h10v10H80V70zM50 40h10v10H50V40zm10 10h10v10H60V50zm-10 10h10v10H50V60z" />
              </svg>
            </div>
            <p className="font-body text-[10px] text-ash-slate uppercase tracking-widest font-bold">
              PASS-ID: JIY-2026-SUMMER-88
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
