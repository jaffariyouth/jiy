import { useState } from "react";
import { useDashboard } from "./DashboardContext";

export function WelcomeBlock() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { dispatchToast } = useDashboard();

  const submit = () => {
    if (!value.trim()) {
      dispatchToast("Question cannot be blank.", false);
      return;
    }
    setValue("");
    setOpen(false);
    dispatchToast("Your question was submitted anonymously.");
  };

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-6">
        <h1 className="font-headline text-3xl md:text-4xl text-primary-dark tracking-tight">
          Salaam, Ali.{" "}
          <span className="font-light italic text-2xl text-ash-slate block sm:inline">
            Welcome back to the Hub
          </span>
        </h1>
      </div>

      <div className="studio-card rounded-lg p-6 bg-white">
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer group"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warm-silk-grey flex items-center justify-center text-damascus-gold group-hover:bg-damascus-gold group-hover:text-primary-dark transition-all duration-300">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                help_center
              </span>
            </div>
            <div>
              <p className="font-headline text-xl italic text-primary-dark group-hover:text-damascus-gold transition-colors duration-200">
                Have a question for a resident scholar?
              </p>
              <p className="font-body text-xs text-ash-slate mt-0.5">
                Submit anonymously anytime. Answers are posted on the board weekly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-ash-slate group-hover:text-damascus-gold transition-colors shrink-0">
            <span className="font-body text-[11px] uppercase tracking-[0.2em] font-bold">
              [ Expand Form ]
            </span>
            <span
              className={`material-symbols-outlined transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              expand_more
            </span>
          </div>
        </div>

        <div
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: open ? "500px" : "0px" }}
        >
          <div className="mt-6 pt-6 border-t border-horizon-mist">
            <div className="bg-warm-silk-grey/40 border border-horizon-mist p-6 rounded-lg relative">
              <label className="block font-body text-[11px] uppercase tracking-[0.2em] text-ash-slate font-bold mb-3">
                Your Anonymous Inquiry
              </label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white border border-horizon-mist rounded-lg p-4 font-body text-sm text-primary-dark placeholder:text-ash-slate/50 focus:outline-none focus:border-damascus-gold focus:ring-1 focus:ring-damascus-gold resize-none h-32 mb-4 transition-all duration-300"
                placeholder="Type your question here..."
              />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="font-body text-xs italic text-ash-slate">
                  Your identity is absolutely protected. No metadata is recorded.
                </p>
                <button
                  onClick={submit}
                  className="interactive-btn bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-7 rounded-[4px] uppercase transition-all duration-300"
                >
                  Submit to Scholar Board
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
