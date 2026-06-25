import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const phoneSchema = z
  .string()
  .trim()
  .min(5, "Phone number is required")
  .max(30, "Phone number too long")
  .regex(/^[+0-9()\-\s]+$/, "Invalid phone number");

const sponsorSchema = z.object({
  phone: phoneSchema,
  amount: z.number().nonnegative().max(1_000_000).optional().nullable(),
  message: z.string().trim().max(500).optional().nullable(),
});

const volunteerSchema = z.object({
  phone: phoneSchema,
  message: z.string().trim().max(500).optional().nullable(),
});

export const submitSponsorInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => sponsorSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("interest_submissions").insert({
      kind: "sponsor",
      user_id: context.userId,
      phone: data.phone,
      amount: data.amount ?? null,
      message: data.message ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const submitVolunteerInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => volunteerSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("interest_submissions").insert({
      kind: "volunteer",
      user_id: context.userId,
      phone: data.phone,
      message: data.message ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
