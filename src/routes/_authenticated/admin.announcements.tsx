import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAllAnnouncements, createAnnouncement, publishAnnouncement, deleteAnnouncement } from "@/lib/jiy/announcements.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AudiencePanel, DEFAULT_AUDIENCE, type AudienceValue } from "@/components/admin/AudiencePanel";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAllAnnouncements);
  const create = useServerFn(createAnnouncement);
  const pub = useServerFn(publishAnnouncement);
  const del = useServerFn(deleteAnnouncement);

  const q = useQuery({ queryKey: ["admin", "announcements"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "announcements"] });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AudienceValue>(DEFAULT_AUDIENCE);

  const createMut = useMutation({
    mutationFn: () => create({ data: { idempotencyKey: crypto.randomUUID(), title, body_md: body, ...audience } }),
    onSuccess: () => { toast.success("Draft created"); setOpen(false); setTitle(""); setBody(""); setAudience(DEFAULT_AUDIENCE); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        subtitle="Short posts surfaced on the member dashboard."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>New announcement</Button></DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader><DialogTitle>New announcement</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <MarkdownEditor value={body} onChange={setBody} rows={10} />
              </div>
              <DialogFooter>
                <Button onClick={() => createMut.mutate()} disabled={!title.trim() || createMut.isPending}>
                  {createMut.isPending ? "Saving…" : "Save draft"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-6 sm:px-10 py-8 space-y-3">
        {q.isLoading && <p className="text-sm text-[#6b6453]">Loading…</p>}
        {q.data?.announcements.map((a) => (
          <article key={a.id} className="bg-white border border-[#e5dec9] rounded-sm p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-serif text-lg text-[#010b21]">{a.title}</h3>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">{a.status}</span>
            </div>
            <p className="text-sm text-[#2b2a26] line-clamp-2">{a.body_md}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {a.status !== "published" && (
                <Button size="sm" variant="outline" onClick={async () => {
                  await pub({ data: { id: a.id, idempotencyKey: crypto.randomUUID() } });
                  toast.success("Published"); refresh();
                }}>Publish</Button>
              )}
              <Button size="sm" variant="ghost" onClick={async () => {
                if (!confirm("Delete this announcement?")) return;
                await del({ data: { id: a.id, idempotencyKey: crypto.randomUUID() } });
                toast.success("Deleted"); refresh();
              }}>Delete</Button>
            </div>
          </article>
        ))}
        {q.data && q.data.announcements.length === 0 && (
          <p className="text-sm text-[#6b6453] italic">No announcements yet.</p>
        )}
        <p className="text-xs text-[#6b6453] mt-6"><Link to="/admin">← Dashboard</Link></p>
      </div>
    </div>
  );
}
