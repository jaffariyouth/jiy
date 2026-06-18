import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listFormTemplates, createFormTemplate } from "@/lib/jiy/form-templates.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/forms/")({
  component: FormsListPage,
});

function FormsListPage() {
  const qc = useQueryClient();
  const list = useServerFn(listFormTemplates);
  const create = useServerFn(createFormTemplate);
  const q = useQuery({ queryKey: ["admin", "forms"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const createMut = async () => {
    try {
      await create({ data: { idempotencyKey: crypto.randomUUID(), name, slug, schema: { fields: [] } } });
      toast.success("Form created");
      setOpen(false); setName(""); setSlug("");
      qc.invalidateQueries({ queryKey: ["admin", "forms"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <AdminPageHeader
        title="Forms"
        subtitle="Reusable registration form templates. Attach to events."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>New form</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New form template</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="slug-like-this" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
              </div>
              <DialogFooter>
                <Button onClick={createMut} disabled={!name.trim() || !slug.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-6 sm:px-10 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {q.data?.templates.map((t) => (
            <Link key={t.id} to="/admin/forms/$id" params={{ id: t.id }} className="bg-white border border-[#e5dec9] rounded-sm p-4 hover:border-[#caa460]">
              <div className="font-serif text-lg text-[#010b21]">{t.name}</div>
              <div className="text-xs font-mono text-[#6b6453] mt-1">{t.slug}</div>
              <div className="text-xs text-[#6b6453] mt-3">
                {((t.schema as { fields?: unknown[] })?.fields?.length ?? 0)} fields
              </div>
            </Link>
          ))}
          {q.data && q.data.templates.length === 0 && (
            <p className="text-sm text-[#6b6453] italic">No forms yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
