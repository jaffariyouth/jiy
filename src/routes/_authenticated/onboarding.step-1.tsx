import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthLayout,
  AuthCard,
  FormInput,
  FormSelect,
  PrimaryButton,
  MaterialIcon,
} from "@/components/auth";

export const Route = createFileRoute("/_authenticated/onboarding/step-1")({
  head: () => ({ meta: [{ title: "JIY — Profile Step 1: Core Identity" }] }),
  component: Step1Page,
});

function Step1Page() {
  const navigate = useNavigate();
  const [contactNumber, setContactNumber] = useState("");
  const [educationLevel, setEducationLevel] = useState("high-school");
  const [academicStatus, setAcademicStatus] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("single");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: persist via server fn once profile schema accepts these fields.
    console.log("[onboarding step-1]", { contactNumber, educationLevel, academicStatus, maritalStatus });
    navigate({ to: "/onboarding/step-2" });
  }

  return (
    <AuthLayout
      headerVariant={{ kind: "wizard", current: 1, total: 3 }}
      headerBordered
      footerVariant="wizard"
    >
      <AuthCard contentClassName="">
        <div className="text-center mb-gap-section">
          <h1 className="font-headline-sm text-form-title text-midnight-sapphire mb-base">
            Tell us about yourself
          </h1>
        </div>

        <form className="space-y-gap-element" onSubmit={onSubmit}>
          <FormInput
            id="contactNumber"
            label="Primary Contact Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />

          <FormSelect
            id="educationLevel"
            label="Level of Current Education"
            containerClassName="pt-4"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            options={[
              { value: "high-school", label: "High School" },
              { value: "undergraduate", label: "Undergraduate" },
              { value: "graduate", label: "Graduate" },
              { value: "postgraduate", label: "Postgraduate" },
              { value: "other", label: "Other" },
            ]}
          />

          <FormInput
            id="academicStatus"
            label="Current Institutional or Academic Status"
            type="text"
            placeholder="e.g., Toronto Metropolitan University - Software Engineering"
            containerClassName="pt-4"
            value={academicStatus}
            onChange={(e) => setAcademicStatus(e.target.value)}
          />

          <FormSelect
            id="maritalStatus"
            label="Marital Status"
            containerClassName="pt-4"
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "prefer-not-to-answer", label: "Prefer not to answer" },
            ]}
          />

          <div className="pt-gap-section">
            <PrimaryButton
              type="submit"
              className="py-[12px]"
              trailingIcon={<MaterialIcon name="arrow_forward" className="text-[20px]" />}
            >
              Save & Continue to Step 2
            </PrimaryButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
