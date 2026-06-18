import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { createDraft } from "@/lib/jiy/youth-press.functions";
import { AudiencePanel, DEFAULT_AUDIENCE, type AudienceValue } from "@/components/admin/AudiencePanel";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/press/new")({
  component: NewPressPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function NewPressPage() {
  const navigate = useNavigate();
  const create = useServerFn(createDraft);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AudienceValue>(DEFAULT_AUDIENCE);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const r = await create({ data: {
        idempotencyKey: crypto.randomUUID(), title,
        slug: slug || slugify(title),
        excerpt: excerpt || undefined,
        body_md: body || "Draft.",
        ...audience,
      }});
      toast.success("Draft created");
      navigate({ to: "/admin/press/$id", params: { id: r.id } });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <AdminPageHeader title="New article" backTo={{ to: "/admin/press", label: "Press" }} />
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="px-6 sm:px-10 py-8 max-w-3xl space-y-5">
        <div><Label>Title</Label><Input value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} required /></div>
        <div><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required /></div>
        <div><Label>Excerpt</Label><Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={500} /></div>
        <div><Label>Body</Label><MarkdownEditor value={body} onChange={setBody} rows={18} /></div>
        <Button type="submit" disabled={saving || !title.trim()}>{saving ? "Creating…" : "Create draft"}</Button>
      </form>
    </div>
  );
}
