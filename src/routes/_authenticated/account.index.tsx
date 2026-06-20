import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/jiy/profiles.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({ meta: [{ title: "Profile — JIY" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setCountry(profile.country ?? "");
    }
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: () =>
      updateProfile({
        data: {
          idempotencyKey: `acct-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          displayName: displayName.trim() || undefined,
          country: country.trim() || undefined,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (isLoading) {
    return <p className="font-body text-sm text-ash-slate italic">Loading…</p>;
  }

  return (
    <div className="studio-card rounded-xl p-8 bg-white flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold">
          Display name
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-white border border-horizon-mist rounded-md p-3 font-body text-sm focus:outline-none focus:border-damascus-gold"
          placeholder="How members see you"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold">
          Country
        </label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-white border border-horizon-mist rounded-md p-3 font-body text-sm focus:outline-none focus:border-damascus-gold"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-horizon-mist">
        <button
          onClick={signOut}
          className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet hover:text-primary-dark font-bold"
        >
          Sign out
        </button>
        <div className="flex items-center gap-4">
          {saved ? (
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold font-bold">
              Saved
            </span>
          ) : null}
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="interactive-btn bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3 px-6 rounded-[4px] uppercase transition-all disabled:opacity-60"
          >
            {saveMut.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
