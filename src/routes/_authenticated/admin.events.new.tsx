import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createEvent, publishEvent, schedulePublish } from "@/lib/jiy/events.functions";
import { listFormTemplates } from "@/lib/jiy/form-templates.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudiencePanel, DEFAULT_AUDIENCE, type AudienceValue } from "@/components/admin/AudiencePanel";
import { EventCoverPicker } from "@/components/admin/EventCoverPicker";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/events/new")({
  component: NewEventPage,
});

type Mode = "draft" | "publish" | "schedule";

function NewEventPage() {
  const navigate = useNavigate();
  const create = useServerFn(createEvent);
  const pub = useServerFn(publishEvent);
  const sched = useServerFn(schedulePublish);
  const tplList = useServerFn(listFormTemplates);
  const tpls = useQuery({ queryKey: ["admin", "forms"], queryFn: () => tplList() });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [formTplId, setFormTplId] = useState<string>("none");
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [audience, setAudience] = useState<AudienceValue>(DEFAULT_AUDIENCE);
  const [publishAt, setPublishAt] = useState("");

  const submit = useMutation({
    mutationFn: async (mode: Mode) => {
      if (!title.trim()) throw new Error("Title is required");
      if (!startsAt) throw new Error("Start date is required");
      const startsIso = new Date(startsAt).toISOString();
      const endsIso = endsAt ? new Date(endsAt).toISOString() : undefined;
      if (endsIso && new Date(endsIso) <= new Date(startsIso)) {
        throw new Error("End date must be after start date");
      }
      let schedIso: string | undefined;
      if (mode === "schedule") {
        if (!publishAt) throw new Error("Pick a publish date/time");
        schedIso = new Date(publishAt).toISOString();
        if (new Date(schedIso).getTime() <= Date.now()) {
          throw new Error("Scheduled time must be in the future");
        }
      }
      const created = await create({
        data: {
          idempotencyKey: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          starts_at: startsIso,
          ends_at: endsIso,
          capacity: capacity ? Number(capacity) : undefined,
          is_member_only: audience.audience_visibility === "members",
          cover_image_url: coverUrl || undefined,
          form_template_id: formTplId === "none" ? null : formTplId,
          requires_payment: requiresPayment,
          featured_on_home: featured,
          publish_at: schedIso ?? null,
          ...audience,
        },
      });
      if (mode === "publish") {
        await pub({ data: { id: created.id, idempotencyKey: crypto.randomUUID() } });
      } else if (mode === "schedule" && schedIso) {
        await sched({
          data: { id: created.id, publish_at: schedIso, idempotencyKey: crypto.randomUUID() },
        });
      }
      return { id: created.id, mode };
    },
    onSuccess: ({ id, mode }) => {
      toast.success(
        mode === "publish" ? "Published" : mode === "schedule" ? "Scheduled" : "Draft saved",
      );
      navigate({ to: "/admin/events/$id", params: { id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader
        title="New event"
        subtitle="Save as a draft, publish immediately, or schedule for later."
        backTo={{ to: "/admin/events", label: "Events" }}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate("draft");
        }}
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

        <EventCoverPicker value={coverUrl} onChange={setCoverUrl} eventId="new" />

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

        <AudiencePanel value={audience} onChange={setAudience} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Feature on homepage
        </label>

        <div className="border-t border-[#e5dec9] pt-5 space-y-4">
          <div>
            <Label>Schedule publish (optional)</Label>
            <Input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-[#6b6453] mt-1">
              Leave empty to save as a draft or publish immediately.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="outline"
              disabled={submit.isPending}
            >
              {submit.isPending && submit.variables === "draft" ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={submit.isPending || !publishAt}
              onClick={() => submit.mutate("schedule")}
            >
              {submit.isPending && submit.variables === "schedule" ? "Scheduling…" : "Schedule publish"}
            </Button>
            <Button
              type="button"
              disabled={submit.isPending}
              onClick={() => submit.mutate("publish")}
            >
              {submit.isPending && submit.variables === "publish" ? "Publishing…" : "Publish now"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
