import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useDashboard } from "./DashboardContext";
import { getMyProfile } from "@/lib/jiy/profiles.functions";
import { submitQuestion } from "@/lib/jiy/scholar-questions.functions";

export function WelcomeBlock() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { dispatchToast } = useDashboard();
  const qc = useQueryClient();

  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    staleTime: 60_000,
  });

  const ask = useServerFn(submitQuestion);
  const submitMut = useMutation({
    mutationFn: (question_text: string) =>
      ask({
        data: {
          idempotencyKey: `dashboard-q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          question_text,
          is_anonymous: true,
        },
      }),
    onSuccess: () => {
      setValue("");
      setOpen(false);
      dispatchToast("Your question was submitted anonymously.");
      qc.invalidateQueries({ queryKey: ["my-questions"] });
    },
    onError: (err) => dispatchToast(err instanceof Error ? err.message : "Submission failed.", false),
  });

  const firstName = (profile?.displayName ?? "").split(/\s+/)[0] || "friend";

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length < 10) {
      dispatchToast("Question must be at least 10 characters.", false);
      return;
    }
    submitMut.mutate(trimmed);
  };

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-6">
        <h1 className="font-headline text-3xl md:text-4xl text-primary-dark tracking-tight">
          Salaam, {firstName}.{" "}
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
                  disabled={submitMut.isPending}
                  className="interactive-btn bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-7 rounded-[4px] uppercase transition-all duration-300 disabled:opacity-60"
                >
                  {submitMut.isPending ? "Submitting…" : "Submit to Scholar Board"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
