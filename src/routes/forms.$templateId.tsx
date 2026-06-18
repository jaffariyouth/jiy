import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { getPublicFormTemplate } from "@/lib/jiy/youth-press.functions";
import { submitForm } from "@/lib/jiy/form-templates.functions";
import { evalVisibility } from "@/components/admin/FormBuilder";
import { registerForEvent } from "@/lib/jiy/event-registrations.functions";
import type { FormFieldDef, FormSettings } from "@/lib/jiy/form-templates.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forms/$templateId")({
  validateSearch: (s: Record<string, unknown>) => ({ event: typeof s.event === "string" ? s.event : undefined }),
  component: PublicFormPage,
});

const NON_INPUT: FormFieldDef["type"][] = ["section", "paragraph"];

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

  const schemaRaw = q.data?.template.schema as { fields?: FormFieldDef[]; settings?: FormSettings } | undefined;
  const fields = schemaRaw?.fields ?? [];
  const settings = schemaRaw?.settings ?? {};

  const visibleFields = useMemo(
    () => fields.filter((f) => evalVisibility(f, values)),
    [fields, values],
  );

  const uploadFile = async (fieldId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be 10 MB or smaller"); return; }
    const path = `submissions/${templateId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("editorial-media").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
    setValues((v) => ({ ...v, [fieldId]: data.publicUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const f of visibleFields) {
      if (NON_INPUT.includes(f.type)) continue;
      let s: z.ZodTypeAny =
        f.type === "email" ? z.string().email()
        : f.type === "number" ? z.coerce.number()
        : f.type === "checkbox" ? z.boolean()
        : f.type === "date" ? z.string()
        : f.type === "file" ? z.string().url()
        : z.string();
      if (!f.required) s = s.optional().or(z.literal(""));
      shape[f.id] = s;
    }
    const parsed = z.object(shape).safeParse(values);
    if (!parsed.success) { toast.error("Please complete required fields"); return; }

    setSubmitting(true);
    try {
      await submit({
        data: {
          idempotencyKey: crypto.randomUUID(),
          templateId,
          eventId: eventId ?? null,
          data: parsed.data as Record<string, unknown>,
        },
      });
      if (eventId) {
        try { await register({ data: { idempotencyKey: crypto.randomUUID(), eventId } }); } catch { /* may already be registered */ }
      }
      toast.success("Submitted");
      if (settings.redirectUrl) {
        const url = settings.redirectUrl;
        if (/^https?:\/\//i.test(url)) window.location.href = url;
        else window.location.assign(url);
        return;
      }
      setDone(true);
    } catch (err) { toast.error((err as Error).message); }
    finally { setSubmitting(false); }
  };

  if (q.isLoading) return <main className="max-w-2xl mx-auto p-8">Loading…</main>;
  if (!q.data) return <main className="max-w-2xl mx-auto p-8">Form not found.</main>;
  if (done) return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="font-serif text-3xl text-[#010b21] mb-3">Thank you</h1>
      <div className="prose prose-sm max-w-none text-[#2b2a26]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {settings.confirmationMessage ?? "Your submission has been received."}
        </ReactMarkdown>
      </div>
    </main>
  );

  return (
    <main className="max-w-2xl mx-auto p-6 sm:p-10">
      <h1 className="font-serif text-3xl text-[#010b21] mb-2">{q.data.template.name}</h1>
      {eventId && <p className="text-xs uppercase tracking-[0.18em] text-[#6b6453] mb-6">Event registration</p>}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-[#e5dec9] rounded-sm p-6">
        {visibleFields.length === 0 && <p className="text-sm text-[#6b6453]">This form has no fields configured.</p>}
        {visibleFields.map((f) => {
          if (f.type === "section") {
            return (
              <div key={f.id} className="border-b border-[#e5dec9] pb-1">
                <h2 className="font-serif text-xl text-[#010b21]">{f.label}</h2>
                {f.helpText && <p className="text-xs text-[#6b6453]">{f.helpText}</p>}
              </div>
            );
          }
          if (f.type === "paragraph") {
            return (
              <div key={f.id} className="prose prose-sm max-w-none text-[#2b2a26]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{f.helpText ?? ""}</ReactMarkdown>
              </div>
            );
          }
          return (
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
              ) : f.type === "radio" ? (
                <div className="space-y-1">
                  {(f.options ?? []).map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio" name={f.id} value={o} required={f.required}
                        checked={(values[f.id] as string) === o}
                        onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox" checked={!!values[f.id]}
                  onChange={(e) => setValues({ ...values, [f.id]: e.target.checked })}
                />
              ) : f.type === "file" ? (
                <div className="space-y-1">
                  <input
                    type="file"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadFile(f.id, file); }}
                    className="text-sm"
                  />
                  {typeof values[f.id] === "string" && (values[f.id] as string).length > 0 && (
                    <a href={values[f.id] as string} target="_blank" rel="noreferrer" className="text-xs underline text-[#caa460] break-all">
                      {`Uploaded: ${values[f.id] as string}`}
                    </a>
                  )}
                </div>
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
          );
        })}
        <Button type="submit" disabled={submitting || visibleFields.length === 0}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </form>
    </main>
  );
}
