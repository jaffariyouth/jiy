import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useDashboard } from "./DashboardContext";
import { submitSponsorInterest } from "@/lib/jiy/interests.functions";

export function SponsorModal() {
  const { modal, dismissModal, dispatchToast } = useDashboard();
  const submit = useServerFn(submitSponsorInterest);

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (input: { phone: string; amount?: number | null; message?: string | null }) =>
      submit({ data: input }),
    onSuccess: () => {
      setSubmitted(true);
      dispatchToast("Thank you! We'll be in touch shortly.");
    },
    onError: (e: Error) => setLocalErr(e.message),
  });

  // reset on close
  useEffect(() => {
    if (!modal) {
      setTimeout(() => {
        setPhone("");
        setAmount("");
        setMessage("");
        setSubmitted(false);
        setLocalErr(null);
        mut.reset();
      }, 300);
    }
  }, [modal, mut]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    const trimmed = phone.trim();
    if (trimmed.length < 5 || !/^[+0-9()\-\s]+$/.test(trimmed)) {
      setLocalErr("Please enter a valid phone number.");
      return;
    }
    const amt = amount.trim() === "" ? null : Number(amount);
    if (amt !== null && (!Number.isFinite(amt) || amt < 0)) {
      setLocalErr("Amount must be zero or greater.");
      return;
    }
    mut.mutate({
      phone: trimmed,
      amount: amt,
      message: message.trim() || null,
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-primary-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        modal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white border border-damascus-gold max-w-md w-full p-8 relative rounded-lg editorial-double-border shadow-2xl max-h-[90vh] overflow-y-auto">
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

        {modal === "sponsor" && !submitted && (
          <div>
            <div className="text-center">
              <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold mb-2">
                SPONSORSHIP
              </p>
              <h3 className="font-headline text-2xl text-primary-dark mb-3">Sponsor Tabarruk</h3>
              <p className="font-body text-xs text-ash-slate leading-relaxed mb-6">
                Thank you for choosing to sponsor tabarruk for your marhumeen. Your generosity
                helps nourish our youth gatherings — may Allah accept it from you.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-left">
              <div>
                <label className="block font-body text-[10px] uppercase tracking-[0.2em] text-primary-dark font-bold mb-1.5">
                  Phone Number<span className="text-deep-garnet ml-1">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  placeholder="e.g. +1 416 555 0199"
                  className="w-full border border-horizon-mist focus:border-damascus-gold outline-none px-3 py-2.5 font-body text-sm text-primary-dark bg-white rounded-sm"
                />
              </div>
              <div>
                <label className="block font-body text-[10px] uppercase tracking-[0.2em] text-primary-dark font-bold mb-1.5">
                  Amount (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Any amount"
                  className="w-full border border-horizon-mist focus:border-damascus-gold outline-none px-3 py-2.5 font-body text-sm text-primary-dark bg-white rounded-sm"
                />
              </div>
              <div>
                <label className="block font-body text-[10px] uppercase tracking-[0.2em] text-primary-dark font-bold mb-1.5">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="A note for our team"
                  className="w-full border border-horizon-mist focus:border-damascus-gold outline-none px-3 py-2.5 font-body text-sm text-primary-dark bg-white rounded-sm resize-none"
                />
              </div>

              {localErr && (
                <p className="font-body text-xs text-deep-garnet">{localErr}</p>
              )}

              <button
                type="submit"
                disabled={mut.isPending}
                className="interactive-btn w-full bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-6 rounded-[4px] uppercase transition-all duration-300 disabled:opacity-60"
              >
                {mut.isPending ? "Submitting…" : "Submit"}
              </button>

              <p className="text-center font-body text-[11px] italic text-ash-slate pt-2">
                Any amount is appreciated. Jazakallah.
              </p>
            </form>
          </div>
        )}

        {modal === "sponsor" && submitted && (
          <div className="text-center py-4">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold mb-3">
              JAZAKALLAH
            </p>
            <h3 className="font-headline text-2xl text-primary-dark mb-3">Submission received</h3>
            <p className="font-body text-xs text-ash-slate leading-relaxed mb-6">
              We've received your details and will reach out shortly to coordinate. May Allah
              accept your generosity.
            </p>
            <button
              onClick={dismissModal}
              className="interactive-btn border border-damascus-gold text-damascus-gold hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3 px-8 rounded-[4px] uppercase transition-all"
            >
              Close
            </button>
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
