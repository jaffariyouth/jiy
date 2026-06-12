import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AuthLayout,
  AuthCard,
  FormInput,
  PrimaryButton,
  ArchitecturalDivider,
  MaterialIcon,
} from "@/components/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "JIY — Member Gateway" },
      { name: "description", content: "Sign in to your Jaffari Islamic Youth account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  function onISIJ() {
    toast.info("ISIJ Portal SSO is coming soon.");
  }

  return (
    <AuthLayout
      headerVariant={{ kind: "home" }}
      headerPosition="fixed"
      footerVariant="full"
    >
      <AuthCard
        footerSlice={
          <p className="font-body-sm text-body-sm text-midnight-sapphire text-center">
            Not an ISIJ or JIY member yet?
            <Link to="/register" className="text-deep-garnet font-medium hover:underline ml-1">
              Create a JIY Account
            </Link>
          </p>
        }
        contentClassName="items-center"
      >
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 flex flex-col items-center gap-4 w-full">
          <span className="font-label-eyebrow text-label-eyebrow text-deep-garnet uppercase">
            MEMBER Login
          </span>
          <h1 className="font-headline-sm text-headline-sm text-midnight-sapphire max-w-sm leading-tight">
            Sign in to your JIY Account
          </h1>
        </div>

        {/* SSO */}
        <div className="w-full flex flex-col items-center gap-3 mb-8 md:mb-10">
          <PrimaryButton
            type="button"
            onClick={onISIJ}
            trailingIcon={<MaterialIcon name="login" className="text-[20px]" />}
          >
            Authenticate via ISIJ Portal
          </PrimaryButton>
          <p className="font-caption text-caption text-ash-slate text-center max-w-xs">
            Use your existing ISIJ credentials for seamless access and automatic membership verification.
          </p>
        </div>

        {/* Separator */}
        <div className="w-full mb-8 md:mb-10">
          <ArchitecturalDivider chipBgClassName="bg-surface-container-lowest">
            <span className="font-caption text-[11px] text-muted-dusk uppercase tracking-widest">
              or use JIY credentials
            </span>
          </ArchitecturalDivider>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              required
              label="Email Address"
              placeholder="scholar@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              required
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 rounded border-horizon-mist text-midnight-sapphire focus:ring-midnight-sapphire bg-surface-container-lowest cursor-pointer"
              />
              <span className="font-body-sm text-body-sm text-ash-slate group-hover:text-midnight-sapphire transition-colors">
                Keep me signed in
              </span>
            </label>
            <a
              href="#"
              className="font-body-sm text-body-sm text-ash-slate hover:text-midnight-sapphire hover:underline transition-all"
            >
              Forgot password?
            </a>
          </div>

          <PrimaryButton type="submit" variant="outline" className="mt-4" disabled={busy}>
            {busy ? "Signing in…" : "Sign In with JIY Account"}
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
