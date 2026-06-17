import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { getPublicFormTemplate } from "@/lib/jiy/youth-press.functions";
import { submitForm } from "@/lib/jiy/form-templates.functions";
import { registerForEvent } from "@/lib/jiy/event-registrations.functions";
import type { FormFieldDef } from "@/lib/jiy/form-templates.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/forms/$templateId")({
  validateSearch: (s: Record<string, unknown>) => ({ event: typeof s.event === "string" ? s.event : undefined }),
  component: PublicFormPage,
});

function PublicFormPage() {
  const { templateId } = Route.useParams();
  const { event: eventId } = useSearch({ from: "/forms/$templateId" });
  const get = useServerFn(getPublicFormTemplate);
  const submit = useServerFn(submitForm);
  const register = useServerFn(registerForEvent);
  const q = useQuery({ queryKey: ["public-form", templateId], queryFn: () => get({ data: { id: templateId } }) });

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const schema = (q.data?.template.schema as { fields?: FormFieldDef[] } | undefined)?.fields ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build zod schema from field defs.
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const f of schema) {
      let s: z.ZodTypeAny =
        f.type === "email" ? z.string().email()
        : f.type === "number" ? z.coerce.number()
        : f.type === "checkbox" ? z.boolean()
        : f.type === "date" ? z.string()
        : z.string();
      if (!f.required) s = s.optional().or(z.literal(""));
      shape[f.id] = s;
    }
    const parsed = z.object(shape).safeParse(values);
    if (!parsed.success) { toast.error("Please complete required fields"); return; }

    setSubmitting(true);
    try {
      await submit({ data: {
        idempotencyKey: crypto.randomUUID(),
        templateId, eventId: eventId ?? null,
        data: parsed.data as Record<string, unknown>,
      }});
      if (eventId) {
        try { await register({ data: { idempotencyKey: crypto.randomUUID(), eventId } }); } catch { /* may already be registered */ }
      }
      setDone(true);
      toast.success("Submitted");
    } catch (err) { toast.error((err as Error).message); }
    finally { setSubmitting(false); }
  };

  if (q.isLoading) return <main className="max-w-2xl mx-auto p-8">Loading…</main>;
  if (!q.data) return <main className="max-w-2xl mx-auto p-8">Form not found.</main>;
  if (done) return (
    <main className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="font-serif text-3xl text-[#010b21]">Thank you</h1>
      <p className="text-sm text-[#6b6453] mt-2">Your submission has been received.</p>
    </main>
  );

  return (
    <main className="max-w-2xl mx-auto p-6 sm:p-10">
      <h1 className="font-serif text-3xl text-[#010b21] mb-2">{q.data.template.name}</h1>
      {eventId && <p className="text-xs uppercase tracking-[0.18em] text-[#6b6453] mb-6">Event registration</p>}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-[#e5dec9] rounded-sm p-6">
        {schema.length === 0 && <p className="text-sm text-[#6b6453]">This form has no fields configured.</p>}
        {schema.map((f) => (
          <div key={f.id} className="space-y-1">
            <Label>{f.label}{f.required && <span className="text-[#9b2c2c] ml-1">*</span>}</Label>
            {f.type === "textarea" ? (
              <textarea
                className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm"
                rows={4} required={f.required}
                value={(values[f.id] as string) ?? ""}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              />
            ) : f.type === "select" ? (
              <select
                className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm bg-white"
                required={f.required}
                value={(values[f.id] as string) ?? ""}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              >
                <option value="">—</option>
                {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === "checkbox" ? (
              <input
                type="checkbox" checked={!!values[f.id]}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.checked })}
              />
            ) : (
              <Input
                type={f.type === "phone" ? "tel" : f.type}
                required={f.required} placeholder={f.placeholder}
                value={(values[f.id] as string) ?? ""}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              />
            )}
            {f.helpText && <p className="text-xs text-[#6b6453]">{f.helpText}</p>}
          </div>
        ))}
        <Button type="submit" disabled={submitting || schema.length === 0}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </form>
    </main>
  );
}
