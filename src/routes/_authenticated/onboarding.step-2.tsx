import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AuthLayout,
  AuthCard,
  PrimaryButton,
} from "@/components/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding/step-2")({
  head: () => ({ meta: [{ title: "JIY — Profile Step 2: Calendar Sync" }] }),
  component: Step2Page,
});

function Step2Page() {
  const navigate = useNavigate();

  function onGoogleConnect() {
    toast.info("Google Calendar sync coming soon.");
  }

  function goNext() {
    navigate({ to: "/onboarding/step-3" });
  }

  return (
    <AuthLayout
      headerVariant={{ kind: "wizard", current: 2, total: 3 }}
      headerBordered
      footerVariant="wizard"
    >
      <AuthCard contentClassName="items-center">
        {/* Header */}
        <div className="text-center mb-10 max-w-lg">
          <h1 className="font-headline-sm text-headline-sm text-midnight-sapphire mb-4">
            Sync your personal calendar
          </h1>
          <p className="font-body-sm text-body-sm text-ash-slate leading-relaxed">
            Connect your Google Account so that upcoming events track automatically across your personal devices.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={onGoogleConnect}
          className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-surface-container-lowest border border-midnight-sapphire rounded-component hover:bg-surface-variant transition-colors duration-200 mb-12 mx-auto"
        >
          <svg className="w-5 h-5 text-midnight-sapphire" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          <span className="font-body text-body text-midnight-sapphire font-medium">
            Connect Your Google Account
          </span>
        </button>

        {/* Action Navigation */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <button
            type="button"
            onClick={goNext}
            className="font-label-eyebrow text-label-eyebrow text-ash-slate hover:text-midnight-sapphire transition-colors duration-200 uppercase tracking-widest px-4 py-2"
          >
            Skip this step
          </button>
          <PrimaryButton type="button" onClick={goNext} className="w-auto px-8 py-3">
            Continue to Step 3
          </PrimaryButton>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
