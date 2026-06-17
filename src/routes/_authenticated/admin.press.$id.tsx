import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { supabase } from "@/integrations/supabase/client";
import {
  getArticleByIdAdmin, updateDraft, publishArticle, unpublishArticle,
} from "@/lib/jiy/youth-press.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/press/$id")({
  component: PressEditPage,
});

function PressEditPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const get = useServerFn(getArticleByIdAdmin);
  const upd = useServerFn(updateDraft);
  const pub = useServerFn(publishArticle);
  const unpub = useServerFn(unpublishArticle);
  const q = useQuery({ queryKey: ["admin", "article", id], queryFn: () => get({ data: { id } }) });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState("");

  useEffect(() => {
    const a = q.data?.article;
    if (!a) return;
    setTitle(a.title); setSlug(a.slug);
    setExcerpt(a.excerpt ?? ""); setBody(a.body_md); setCover(a.cover_image_url ?? "");
  }, [q.data?.article]);

  const uploadCover = async (file: File) => {
    const path = `press/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("editorial-media").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
    setCover(data.publicUrl);
  };

  const save = async () => {
    try {
      await upd({ data: {
        id, idempotencyKey: crypto.randomUUID(),
        title, slug, excerpt: excerpt || undefined, body_md: body,
        cover_image_url: cover || undefined,
      }});
      toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "article", id] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const status = q.data?.article.status;

  return (
    <div>
      <AdminPageHeader
        title={title || "Article"}
        subtitle={status ? `Status: ${status}` : undefined}
        backTo={{ to: "/admin/press", label: "Press" }}
        actions={
          <>
            <Button onClick={save}>Save</Button>
            {status !== "published" ? (
              <Button variant="outline" onClick={async () => {
                await save();
                await pub({ data: { id, idempotencyKey: crypto.randomUUID() } });
                toast.success("Published"); qc.invalidateQueries({ queryKey: ["admin", "article", id] });
              }}>Save & publish</Button>
            ) : (
              <Button variant="outline" onClick={async () => {
                await unpub({ data: { id, idempotencyKey: crypto.randomUUID() } });
                toast.success("Unpublished"); qc.invalidateQueries({ queryKey: ["admin", "article", id] });
              }}>Unpublish</Button>
            )}
          </>
        }
      />
      <div className="px-6 sm:px-10 py-8 max-w-3xl space-y-5">
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></div>
        <div><Label>Excerpt</Label><Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={500} /></div>
        <div>
          <Label>Cover image</Label>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {cover && <img src={cover} alt="" className="h-24 w-40 object-cover border border-[#e5dec9] rounded-sm" />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} className="text-sm" />
            {cover && <Button type="button" variant="ghost" size="sm" onClick={() => setCover("")}>Remove</Button>}
          </div>
        </div>
        <div><Label>Body</Label><MarkdownEditor value={body} onChange={setBody} rows={20} /></div>
      </div>
    </div>
  );
}
