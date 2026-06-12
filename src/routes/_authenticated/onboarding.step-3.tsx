import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AuthLayout,
  AuthCard,
  PrimaryButton,
  ToggleSwitch,
  MaterialIcon,
} from "@/components/auth";
import { updateMyProfile } from "@/lib/jiy/profiles.functions";

export const Route = createFileRoute("/_authenticated/onboarding/step-3")({
  head: () => ({ meta: [{ title: "JIY — Profile Step 3: Notifications" }] }),
  component: Step3Page,
});

function Step3Page() {
  const navigate = useNavigate();
  const router = useRouter();
  const submitProfile = useServerFn(updateMyProfile);

  const [scholarQA, setScholarQA] = useState(true);
  const [youthPress, setYouthPress] = useState(true);
  const [summitAlerts, setSummitAlerts] = useState(true);

  const mutation = useMutation({
    mutationFn: () =>
      submitProfile({
        data: {
          idempotencyKey: crypto.randomUUID(),
          consentMarketing: scholarQA || youthPress || summitAlerts,
          markOnboardingComplete: true,
        },
      }),
    onSuccess: () => {
      console.log("[onboarding step-3]", { scholarQA, youthPress, summitAlerts });
      router.invalidate();
      navigate({ to: "/dashboard" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AuthLayout
      headerVariant={{ kind: "wizard", current: 3, total: 3 }}
      headerBordered
      footerVariant="wizard"
    >
      <AuthCard contentClassName="gap-gap-section">
        {/* Header */}
        <div className="text-center flex flex-col gap-base">
          <h1 className="font-headline text-midnight-sapphire tracking-tighter text-form-title leading-tight">
            Stay close to the community
          </h1>
          <p className="font-body-sm text-body-sm text-ash-slate">
            Configure your email notifications below.
          </p>
        </div>

        {/* Toggle Stack */}
        <div className="flex flex-col">
          <ToggleSwitch
            id="toggle-scholar"
            label="Scholar Q&A Dispatches"
            description="Receive immediate notifications when new scholarly insights are published."
            checked={scholarQA}
            onChange={setScholarQA}
          />
          <ToggleSwitch
            id="toggle-youthpress"
            label="The Youth Press Bulletins"
            description="Monthly content feature alerts curated by the youth editorial board."
            checked={youthPress}
            onChange={setYouthPress}
          />
          <ToggleSwitch
            id="toggle-summit"
            label="Summit & Opportunity Alerts"
            description="Urgent physical event entrance codes and fellowship opportunities."
            checked={summitAlerts}
            onChange={setSummitAlerts}
          />
        </div>

        <PrimaryButton
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-4 group"
          trailingIcon={
            <MaterialIcon
              name="arrow_forward"
              className="text-[18px] group-hover:translate-x-1 transition-transform"
            />
          }
        >
          {mutation.isPending ? "Saving…" : "Submit & Complete Profile"}
        </PrimaryButton>
      </AuthCard>
    </AuthLayout>
  );
}
