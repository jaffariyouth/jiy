import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkIdempotency, writeAudit } from "./idempotency.server";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const AGE_DEMOGRAPHICS = ["under_18", "18_24", "25_34", "35_44", "45_54", "55_plus"] as const;

const UpdateProfileSchema = z.object({
  idempotencyKey: z.string().min(8),
  displayName: z.string().min(1).max(80).optional(),
  ageDemographic: z.enum(AGE_DEMOGRAPHICS).optional(),
  country: z.string().min(2).max(80).optional(),
  consentMarketing: z.boolean().optional(),
  markOnboardingComplete: z.boolean().optional(),
});

export type ProfileDTO = {
  id: string;
  displayName: string | null;
  ageDemographic: string | null;
  country: string | null;
  consentMarketing: boolean;
  onboardingCompletedAt: string | null;
  avatarUrl: string | null;
};

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileDTO> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, age_demographic, country, consent_marketing, onboarding_completed_at, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      // The auth trigger normally creates this row; defensively insert.
      const { data: inserted, error: insErr } = await supabase
        .from("profiles")
        .insert({ id: userId })
        .select("id, display_name, age_demographic, country, consent_marketing, onboarding_completed_at, avatar_url")
        .single();
      if (insErr) throw new Error(insErr.message);
      return mapProfile(inserted);
    }
    return mapProfile(data);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateProfileSchema.parse(input))
  .handler(async ({ data, context }): Promise<ProfileDTO> => {
    const { supabase, userId } = context;
    const { cached, complete } = await checkIdempotency<ProfileDTO>(
      supabase,
      data.idempotencyKey,
      userId,
    );
    if (cached) return cached;

    const patch: ProfileUpdate = {};
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    if (data.ageDemographic !== undefined) patch.age_demographic = data.ageDemographic;
    if (data.country !== undefined) patch.country = data.country;
    if (data.consentMarketing !== undefined) patch.consent_marketing = data.consentMarketing;
    if (data.markOnboardingComplete) patch.onboarding_completed_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select("id, display_name, age_demographic, country, consent_marketing, onboarding_completed_at, avatar_url")
      .single();
    if (error) throw new Error(error.message);

    const dto = mapProfile(updated);
    await writeAudit(supabase, {
      actorId: userId,
      action: "profile.update",
      entity: "profiles",
      entityId: userId,
      metadata: { fields: Object.keys(patch) },
    });
    await complete(dto);
    return dto;
  });

function mapProfile(row: {
  id: string;
  display_name: string | null;
  age_demographic: string | null;
  country: string | null;
  consent_marketing: boolean | null;
  onboarding_completed_at: string | null;
  avatar_url: string | null;
}): ProfileDTO {
  return {
    id: row.id,
    displayName: row.display_name,
    ageDemographic: row.age_demographic,
    country: row.country,
    consentMarketing: row.consent_marketing ?? false,
    onboardingCompletedAt: row.onboarding_completed_at,
    avatarUrl: row.avatar_url,
  };
}