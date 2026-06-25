import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useDashboard } from "./DashboardContext";
import { submitVolunteerInterest } from "@/lib/jiy/interests.functions";

export function VolunteerCorpWidget() {
  const { dispatchToast } = useDashboard();
  const submit = useServerFn(submitVolunteerInterest);

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [localErr, setLocalErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (input: { phone: string; message?: string | null }) => submit({ data: input }),
    onSuccess: () => {
      dispatchToast("Thank you! Application submitted to the Volunteer Corps.");
    },
    onError: (e: Error) => setLocalErr(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    const trimmed = phone.trim();
    if (trimmed.length < 5 || !/^[+0-9()\-\s]+$/.test(trimmed)) {
      setLocalErr("Please enter a valid phone number.");
      return;
    }
    mut.mutate({ phone: trimmed, message: message.trim() || null });
  };

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

      {mut.isSuccess ? (
        <div className="text-center py-3">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold mb-2">
            ✓ APPLICATION RECEIVED
          </p>
          <p className="font-body text-xs text-ash-slate leading-relaxed">
            Thank you! We'll reach out on WhatsApp shortly to welcome you to the Corps.
          </p>
        </div>
      ) : (
        <>
          <p className="font-body text-xs text-ash-slate leading-relaxed mb-5 text-center">
            Join our dedicated team of youth volunteers. Drop your WhatsApp number and we'll reach
            out.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block font-body text-[10px] uppercase tracking-[0.2em] text-primary-dark font-bold mb-1.5">
                WhatsApp Number<span className="text-deep-garnet ml-1">*</span>
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
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Tell us how you'd like to help"
                className="w-full border border-horizon-mist focus:border-damascus-gold outline-none px-3 py-2.5 font-body text-sm text-primary-dark bg-white rounded-sm resize-none"
              />
            </div>

            {localErr && <p className="font-body text-xs text-deep-garnet">{localErr}</p>}

            <button
              type="submit"
              disabled={mut.isPending}
              className="interactive-btn w-full bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-6 rounded-[4px] uppercase transition-all duration-300 disabled:opacity-60"
            >
              {mut.isPending ? "Submitting…" : "Apply to Volunteer"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
