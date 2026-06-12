import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile } from "@/lib/jiy/profiles.functions";

const AGE_OPTIONS = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" },
  { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" },
  { value: "55_plus", label: "55+" },
] as const;

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Complete your profile — JIY" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const submitProfile = useServerFn(updateMyProfile);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [ageDemographic, setAgeDemographic] = useState<string>("");
  const [country, setCountry] = useState("");
  const [consentMarketing, setConsentMarketing] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.onboardingCompletedAt) {
      navigate({ to: "/dashboard" });
      return;
    }
    setDisplayName(profile.displayName ?? "");
    setAgeDemographic(profile.ageDemographic ?? "");
    setCountry(profile.country ?? "");
    setConsentMarketing(profile.consentMarketing);
  }, [profile, navigate]);

  const mutation = useMutation({
    mutationFn: (input: {
      displayName: string;
      ageDemographic: string;
      country: string;
      consentMarketing: boolean;
    }) =>
      submitProfile({
        data: {
          idempotencyKey: crypto.randomUUID(),
          displayName: input.displayName,
          ageDemographic: input.ageDemographic as
            | "under_18" | "18_24" | "25_34" | "35_44" | "45_54" | "55_plus",
          country: input.country,
          consentMarketing: input.consentMarketing,
          markOnboardingComplete: true,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      router.invalidate();
      navigate({ to: "/dashboard" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us a bit about yourself so we can tailor your JIY experience.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!displayName.trim() || !ageDemographic || !country.trim()) {
            toast.error("Please fill in all required fields.");
            return;
          }
          mutation.mutate({
            displayName: displayName.trim(),
            ageDemographic,
            country: country.trim(),
            consentMarketing,
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age range</Label>
          <Select value={ageDemographic} onValueChange={setAgeDemographic}>
            <SelectTrigger id="age">
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              {AGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={consentMarketing}
            onCheckedChange={(v) => setConsentMarketing(v === true)}
          />
          <span className="text-muted-foreground">
            Send me occasional updates about JIY events and programs. You can opt
            out anytime.
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Finish setup"}
        </Button>
      </form>
    </main>
  );
}