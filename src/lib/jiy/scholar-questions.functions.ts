import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ---------- Public: answered questions (anonymity-stripped) ----------

export const listPublicAnswered = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabasePublic = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabasePublic
    .from("scholar_questions")
    .select("id, question_text, answer_text, answered_at, category, is_anonymous, submitter_id, assigned_scholar_id")
    .eq("status", "answered")
    .order("answered_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  // Strip submitter identity for anonymous submissions before returning.
  const rows = (data ?? []).map((q) => ({
    id: q.id,
    question_text: q.question_text,
    answer_text: q.answer_text,
    answered_at: q.answered_at,
    category: q.category,
    is_anonymous: q.is_anonymous,
    submitter_id: q.is_anonymous ? null : q.submitter_id,
    assigned_scholar_id: q.assigned_scholar_id,
  }));
  return { questions: rows };
});

// ---------- Authenticated reads ----------

export const listMyQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scholar_questions")
      .select("id, question_text, status, category, created_at, answered_at, answer_text")
      .eq("submitter_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { questions: data ?? [] };
  });

export const listAssignedToMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scholar_questions")
      .select("id, question_text, status, category, created_at, is_anonymous, submitter_id")
      .eq("assigned_scholar_id", context.userId)
      .in("status", ["assigned"])
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // Scholars see "Anonymous Student" for anonymous submitters.
    const rows = (data ?? []).map((q) => ({
      ...q,
      submitter_id: q.is_anonymous ? null : q.submitter_id,
    }));
    return { questions: rows };
  });

export const listTriageQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("scholar_questions")
      .select("*")
      .eq("status", "pending_triage")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { questions: data ?? [] };
  });

// ---------- Mutations ----------

const submitSchema = z.object({
  idempotencyKey: z.string().min(8),
  question_text: z.string().min(10).max(2000),
  is_anonymous: z.boolean().default(false),
  category: z.string().max(80).optional(),
});

export const submitQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ id: string }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const { data: row, error } = await context.supabase
      .from("scholar_questions")
      .insert({
        submitter_id: context.userId,
        question_text: data.question_text,
        is_anonymous: data.is_anonymous,
        category: data.category ?? null,
        status: "pending_triage",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "scholar_question.submitted",
      entity: "scholar_questions",
      entityId: row.id,
      metadata: { is_anonymous: data.is_anonymous },
    });
    const { enqueueAdminBroadcast } = await import("./notifications.server");
    await enqueueAdminBroadcast({
      channel: "in_app",
      templateKey: "scholar_question.pending_triage",
      payload: { question_id: row.id },
    });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

const assignSchema = z.object({
  idempotencyKey: z.string().min(8),
  id: z.string().uuid(),
  scholarId: z.string().uuid(),
});

export const assignQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => assignSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit, hasAnyRole } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);

    // Sanity check: assignee must actually be a scholar.
    const isScholar = await hasAnyRole(context.supabase, data.scholarId, ["scholar"]);
    if (!isScholar) throw new Error("UNPROCESSABLE_ENTITY: assignee is not a scholar");

    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    const { error } = await context.supabase
      .from("scholar_questions")
      .update({ assigned_scholar_id: data.scholarId, status: "assigned" })
      .eq("id", data.id)
      .eq("status", "pending_triage");
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "scholar_question.assigned",
      entity: "scholar_questions",
      entityId: data.id,
      metadata: { scholar_id: data.scholarId },
    });
    const { enqueueNotification } = await import("./notifications.server");
    await enqueueNotification({
      recipientId: data.scholarId,
      channel: "in_app",
      templateKey: "scholar_question.assigned",
      payload: { question_id: data.id },
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

const answerSchema = z.object({
  idempotencyKey: z.string().min(8),
  id: z.string().uuid(),
  answer_text: z.string().min(10).max(10000),
});

export const answerQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => answerSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    // RLS lets either the assigned scholar OR an admin perform this update.
    const { data: updated, error } = await context.supabase
      .from("scholar_questions")
      .update({
        answer_text: data.answer_text,
        answered_at: new Date().toISOString(),
        status: "answered",
      })
      .eq("id", data.id)
      .select("submitter_id")
      .maybeSingle();
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "scholar_question.answered",
      entity: "scholar_questions",
      entityId: data.id,
    });
    if (updated?.submitter_id) {
      const { enqueueNotification } = await import("./notifications.server");
      await enqueueNotification({
        recipientId: updated.submitter_id,
        channel: "in_app",
        templateKey: "scholar_question.answered",
        payload: { question_id: data.id },
      });
    }
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

const rejectSchema = z.object({
  idempotencyKey: z.string().min(8),
  id: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const rejectQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => rejectSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    const { error } = await context.supabase
      .from("scholar_questions")
      .update({ status: "rejected" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "scholar_question.rejected",
      entity: "scholar_questions",
      entityId: data.id,
      metadata: { reason: data.reason ?? null },
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });