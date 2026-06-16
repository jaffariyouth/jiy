import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAllRecurringEvents, createRecurringEvent } from "@/lib/jiy/recurring-events.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/recurring")({
  component: RecurringPage,
});

function RecurringPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAllRecurringEvents);
  const create = useServerFn(createRecurringEvent);
  const q = useQuery({ queryKey: ["admin", "recurring"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [cadence, setCadence] = useState("");
  const [location, setLocation] = useState("");

  const submit = async () => {
    try {
      await create({ data: { idempotencyKey: crypto.randomUUID(), title, slug, cadence_label: cadence, location, description_md: "" } });
      toast.success("Created");
      setOpen(false); setTitle(""); setSlug(""); setCadence(""); setLocation("");
      qc.invalidateQueries({ queryKey: ["admin", "recurring"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <AdminPageHeader
        title="Recurring events"
        subtitle="Sunday Soccer, Mubahatha, weekly study circles."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>New recurring</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New recurring event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title (e.g. Sunday Soccer)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
                <Input placeholder="Cadence label (e.g. Sundays at 10am)" value={cadence} onChange={(e) => setCadence(e.target.value)} />
                <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <DialogFooter><Button onClick={submit} disabled={!title.trim() || !slug.trim()}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-6 sm:px-10 py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {q.data?.recurring.map((r) => (
          <article key={r.id} className="bg-white border border-[#e5dec9] rounded-sm p-4">
            <h3 className="font-serif text-lg text-[#010b21]">{r.title}</h3>
            <p className="text-xs text-[#6b6453] mt-1">{r.cadence_label ?? r.cadence_rrule ?? "No schedule set"}</p>
            {r.location && <p className="text-sm text-[#2b2a26] mt-2">{r.location}</p>}
            <p className="text-xs uppercase tracking-[0.18em] text-[#6b6453] mt-3">{r.is_active ? "Active" : "Inactive"}</p>
          </article>
        ))}
        {q.data && q.data.recurring.length === 0 && <p className="text-sm text-[#6b6453] italic">None yet.</p>}
      </div>
    </div>
  );
}
