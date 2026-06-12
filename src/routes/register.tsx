import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AuthLayout,
  AuthCard,
  FormInput,
  FormSelect,
  PrimaryButton,
} from "@/components/auth";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "JIY — Account Creation" },
      { name: "description", content: "Create your Jaffari Islamic Youth profile." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!terms) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }
    setBusy(true);
    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/onboarding/step-1` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { full_name: fullName, dob, gender },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/onboarding/step-1" });
    } else {
      toast.success("Check your email to confirm your account.");
    }
  }

  return (
    <AuthLayout
      headerVariant={{ kind: "back-to-login" }}
      headerBordered
      footerVariant="minimal"
    >
      <AuthCard
        footerSlice={
          <span className="font-body text-body-sm text-ash-slate text-center">
            Already holding an account or an ISIJ membership?
            <Link
              to="/auth"
              className="text-deep-garnet hover:text-midnight-sapphire underline decoration-1 underline-offset-4 transition-colors font-medium ml-1"
            >
              Sign In
            </Link>
          </span>
        }
        contentClassName="gap-[32px]"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-base">
          <span className="font-label-eyebrow text-label-eyebrow text-deep-garnet uppercase tracking-[0.06em]">
            REGISTer With Jaffari Youth
          </span>
          <h1 className="font-display text-form-title text-midnight-sapphire">
            Create your JIY profile
          </h1>
        </div>

        <form className="flex flex-col gap-gap-element" onSubmit={onSubmit}>
          <FormInput
            id="fullName"
            label="Full Name"
            type="text"
            required
            placeholder="e.g., Ali Jaffar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            containerClassName="gap-1"
          />
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            required
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            containerClassName="gap-1"
          />
          <FormInput
            id="dob"
            label="Date of Birth"
            type="date"
            eyebrowColor="garnet"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            containerClassName="gap-1"
          />
          <FormSelect
            id="gender"
            label="Gender"
            eyebrowColor="garnet"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Select Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Prefer not to say" },
            ]}
            containerClassName="gap-1"
          />
          <FormInput
            id="password"
            label="Choose Password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            containerClassName="gap-1"
          />
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            containerClassName="gap-1"
          />

          <div className="flex items-start gap-3 mt-2">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 rounded border-horizon-mist text-midnight-sapphire focus:ring-midnight-sapphire bg-surface-container-lowest cursor-pointer"
              />
            </div>
            <label
              htmlFor="terms"
              className="font-body text-form-disclaimer text-midnight-sapphire cursor-pointer"
            >
              I agree to the Jaffari Youth Terms and Conditions and Privacy Policy
            </label>
          </div>

          <PrimaryButton type="submit" className="mt-4 py-[14px]" disabled={busy}>
            {busy ? "Creating account…" : "Create Account"}
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
