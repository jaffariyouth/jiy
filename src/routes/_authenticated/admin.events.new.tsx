import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createEvent } from "@/lib/jiy/events.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/events/new")({
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = useNavigate();
  const fn = useServerFn(createEvent);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [memberOnly, setMemberOnly] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      fn({
        data: {
          idempotencyKey: crypto.randomUUID(),
          title,
          description: description || undefined,
          location: location || undefined,
          starts_at: new Date(startsAt).toISOString(),
          capacity: capacity ? Number(capacity) : undefined,
          is_member_only: memberOnly,
        },
      }),
    onSuccess: (r) => {
      toast.success("Event created");
      navigate({ to: "/admin/events/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader
        title="New event"
        backTo={{ to: "/admin/events", label: "Events" }}
      />
      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
        className="px-6 sm:px-10 py-8 max-w-3xl space-y-5"
      >
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label>Description (markdown)</Label>
          <MarkdownEditor value={description} onChange={setDescription} rows={10} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Starts at</Label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </div>
          <div>
            <Label>Capacity (optional)</Label>
            <Input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={memberOnly} onChange={(e) => setMemberOnly(e.target.checked)} />
          Members-only event
        </label>
        <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Creating…" : "Create draft"}</Button>
      </form>
    </div>
  );
}
