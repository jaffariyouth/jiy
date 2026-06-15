import { useState } from "react";
import { useDashboard } from "./DashboardContext";

export function RegistrationTicket() {
  const [tab, setTab] = useState<"active" | "past">("active");
  const { openModal } = useDashboard();

  const tabBase =
    "pb-2 transition-colors";
  const activeTab = "text-primary-dark border-b-2 border-damascus-gold";
  const inactiveTab = "text-ash-slate hover:text-primary-dark";

  return (
    <div className="studio-card rounded-xl p-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 -left-[9px] -translate-y-1/2 w-4 h-4 bg-alabaster-parchment rounded-full border-r border-horizon-mist" />
      <div className="absolute top-1/2 -right-[9px] -translate-y-1/2 w-4 h-4 bg-alabaster-parchment rounded-full border-l border-horizon-mist" />

      <div className="absolute -top-6 -right-6 pointer-events-none opacity-[0.03] text-primary-dark">
        <svg className="h-32 w-32 fill-current" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
          <text x="50" y="55" fontFamily="serif" fontSize="16" textAnchor="middle">
            JIY
          </text>
        </svg>
      </div>

      <div className="flex gap-4 border-b border-horizon-mist pb-3 mb-5 text-[11px] font-body uppercase tracking-[0.2em] font-bold">
        <button
          onClick={() => setTab("active")}
          className={`${tabBase} ${tab === "active" ? activeTab : inactiveTab}`}
        >
          Signed Up
        </button>
        <button
          onClick={() => setTab("past")}
          className={`${tabBase} ${tab === "past" ? activeTab : inactiveTab}`}
        >
          History
        </button>
      </div>

      {tab === "active" ? (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-warm-silk-grey/20 border border-horizon-mist/60 relative rounded-lg">
            <span className="font-body text-[8px] uppercase tracking-[0.2em] text-damascus-gold font-bold block">
              CONFIRMATION REGISTER
            </span>
            <h4 className="font-headline text-lg italic text-primary-dark mt-1.5 mb-1">
              Youth Summit Summer 2026
            </h4>
            <p className="font-body text-[10px] text-ash-slate uppercase tracking-wide">
              Aug 20 - Aug 22 • Hall Precinct
            </p>

            <div className="mt-4 pt-4 border-t border-horizon-mist/60 flex justify-between items-center">
              <p className="font-body text-[10px] text-ash-slate">Tap for pass key</p>
              <button
                onClick={() => openModal("ticket")}
                className="p-1.5 bg-white border border-horizon-mist hover:border-damascus-gold hover:text-damascus-gold rounded-md transition-colors"
                aria-label="Show ticket barcode"
              >
                <svg className="w-7 h-7 text-primary-dark fill-current" viewBox="0 0 100 100">
                  <path d="M0 0h30v10H10v20H0V0zm70 0h30v30H90V10H70V0zM0 70h10v20h20v10H0V70zm100 0v30H70v-10h20V70h10zM20 20h20v20H20V20zm50 0h10v10H70V20zm10 10h10v10H80V30zM20 70h20v20H20V70zm50 10h10v10H70V80zm10-10h10v10H80V70zM50 40h10v10H50V40zm10 10h10v10H60V50zm-10 10h10v10H50V60z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-warm-silk-grey/10 border border-horizon-mist/40 flex justify-between items-center rounded-md">
            <div>
              <h5 className="font-headline text-sm text-ash-slate">Spiritual Retreat Spring '26</h5>
              <p className="font-body text-[9px] text-ash-slate/60 uppercase mt-0.5">
                Ended Apr 12
              </p>
            </div>
            <span
              className="material-symbols-outlined text-ash-slate/50"
              style={{ fontVariationSettings: "'wght' 200" }}
            >
              verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
