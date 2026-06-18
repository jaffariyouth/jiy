import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createEvent } from "@/lib/jiy/events.functions";
import { listFormTemplates } from "@/lib/jiy/form-templates.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudiencePanel, DEFAULT_AUDIENCE, type AudienceValue } from "@/components/admin/AudiencePanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/events/new")({
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = useNavigate();
  const fn = useServerFn(createEvent);
  const tplList = useServerFn(listFormTemplates);
  const tpls = useQuery({ queryKey: ["admin", "forms"], queryFn: () => tplList() });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [memberOnly, setMemberOnly] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [formTplId, setFormTplId] = useState<string>("none");
  const [requiresPayment, setRequiresPayment] = useState(false);

  const uploadCover = async (file: File) => {
    const path = `events/new/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("editorial-media").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    toast.success("Cover uploaded");
  };

  const mut = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");
      if (!startsAt) throw new Error("Start date is required");
      const startsIso = new Date(startsAt).toISOString();
      if (Number.isNaN(Date.parse(startsIso))) throw new Error("Invalid start date");
      const endsIso = endsAt ? new Date(endsAt).toISOString() : undefined;
      if (endsIso && new Date(endsIso) <= new Date(startsIso)) {
        throw new Error("End date must be after start date");
      }
      return fn({
        data: {
          idempotencyKey: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          starts_at: startsIso,
          ends_at: endsIso,
          capacity: capacity ? Number(capacity) : undefined,
          is_member_only: memberOnly,
          cover_image_url: coverUrl || undefined,
          form_template_id: formTplId === "none" ? null : formTplId,
          requires_payment: requiresPayment,
        },
      });
    },
    onSuccess: (r) => {
      toast.success("Draft created");
      navigate({ to: "/admin/events/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader
        title="New event"
        subtitle="Creates a draft. You'll publish from the editor."
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
            <Label>Ends at (optional)</Label>
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
          <div>
            <Label>Capacity (optional)</Label>
            <Input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Cover image (optional)</Label>
          <div className="flex flex-col sm:flex-row gap-3 items-start mt-1">
            {coverUrl && <img src={coverUrl} alt="" className="h-24 w-40 object-cover border border-[#e5dec9] rounded-sm" />}
            <input
              type="file" accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
              className="text-sm"
            />
            {coverUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setCoverUrl("")}>Remove</Button>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Registration form</Label>
            <Select value={formTplId} onValueChange={setFormTplId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (default registration)</SelectItem>
                {tpls.data?.templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#6b6453] mt-1">
              Create reusable templates under <code className="font-mono">Forms</code>.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Payment</Label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={requiresPayment} onChange={(e) => setRequiresPayment(e.target.checked)} />
              Requires payment
            </label>
            {requiresPayment && (
              <p className="text-xs text-[#9b2c2c]">Stripe not yet configured. Toggle saved; checkout activates once keys are added.</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={memberOnly} onChange={(e) => setMemberOnly(e.target.checked)} />
          Members-only event
        </label>

        <Button type="submit" disabled={mut.isPending}>
          {mut.isPending ? "Creating…" : "Create draft"}
        </Button>
      </form>
    </div>
  );
}
