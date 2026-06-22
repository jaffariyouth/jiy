import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AudiencePanel, DEFAULT_AUDIENCE, type AudienceValue } from "@/components/admin/AudiencePanel";
import {
  getEventAdmin, updateEvent, publishEvent, cancelEvent, duplicateEvent,
  schedulePublish, unschedulePublish,
  listPublicRegistrationsAdmin,
} from "@/lib/jiy/events.functions";
import { listEventRoster, checkInRegistration } from "@/lib/jiy/event-registrations.functions";
import { listFormTemplates, listSubmissionsForEvent } from "@/lib/jiy/form-templates.functions";
import { EventCoverPicker } from "@/components/admin/EventCoverPicker";

type SpeakerInput = { name: string; role: string; bio: string; photo_url: string };

export const Route = createFileRoute("/_authenticated/admin/events/$id")({
  component: EventEditPage,
});

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const get = useServerFn(getEventAdmin);
  const upd = useServerFn(updateEvent);
  const pub = useServerFn(publishEvent);
  const can = useServerFn(cancelEvent);
  const dup = useServerFn(duplicateEvent);
  const sched = useServerFn(schedulePublish);
  const unsched = useServerFn(unschedulePublish);
  const tplList = useServerFn(listFormTemplates);

  const q = useQuery({ queryKey: ["admin", "event", id], queryFn: () => get({ data: { id } }) });
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
  const [categoryLabel, setCategoryLabel] = useState("");
  const [speakers, setSpeakers] = useState<SpeakerInput[]>([]);

  useEffect(() => {
    const e = q.data?.event;
    if (!e) return;
    setTitle(e.title);
    setDescription(e.description ?? "");
    setLocation(e.location ?? "");
    setStartsAt(toLocalInput(e.starts_at));
    setEndsAt(toLocalInput(e.ends_at));
    setCapacity(e.capacity?.toString() ?? "");
    setCoverUrl(e.cover_image_url ?? "");
    setFormTplId(e.form_template_id ?? "none");
    setRequiresPayment(e.requires_payment);
    setFeatured((e as { featured_on_home?: boolean }).featured_on_home ?? false);
    setAudience({
      audience_visibility: (e.audience_visibility as "public" | "members") ?? (e.is_member_only ? "members" : "public"),
      audience_gender: (e.audience_gender as "all" | "male" | "female") ?? "all",
      audience_min_age: e.audience_min_age ?? null,
      audience_max_age: e.audience_max_age ?? null,
    });
    setCategoryLabel((e as { category_label?: string | null }).category_label ?? "");
    const rawSpeakers = (e as { speakers?: unknown }).speakers;
    setSpeakers(
      Array.isArray(rawSpeakers)
        ? (rawSpeakers as Array<Partial<SpeakerInput>>).map((s) => ({
            name: s.name ?? "",
            role: s.role ?? "",
            bio: s.bio ?? "",
            photo_url: s.photo_url ?? "",
          }))
        : [],
    );
  }, [q.data?.event]);

  const uploadCover = async (file: File) => {
    const path = `events/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("editorial-media").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    toast.success("Cover uploaded");
  };

  const saveMut = useMutation({
    mutationFn: () => upd({
      data: {
        id, idempotencyKey: crypto.randomUUID(),
        title, description: description || undefined,
        location: location || undefined,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
        capacity: capacity ? Number(capacity) : undefined,
        is_member_only: audience.audience_visibility === "members",
        cover_image_url: coverUrl || undefined,
        form_template_id: formTplId === "none" ? null : formTplId,
        requires_payment: requiresPayment,
        featured_on_home: featured,
        category_label: categoryLabel.trim() || null,
        speakers: speakers
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            role: s.role.trim(),
            bio: s.bio.trim(),
            photo_url: s.photo_url.trim(),
          })),
        ...audience,
      },
    }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "event", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const status = q.data?.event.status;

  return (
    <div>
      <AdminPageHeader
        title={q.data?.event.title ?? "Event"}
        subtitle={status ? `Status: ${status}` : undefined}
        backTo={{ to: "/admin/events", label: "Events" }}
        actions={
          <>
            {status === "draft" && (
              <Button variant="outline" onClick={async () => {
                await pub({ data: { id, idempotencyKey: crypto.randomUUID() } });
                toast.success("Published"); qc.invalidateQueries({ queryKey: ["admin", "event", id] });
              }}>Publish</Button>
            )}
            {status === "published" && (
              <Button variant="outline" onClick={async () => {
                if (!confirm("Cancel this event?")) return;
                await can({ data: { id, idempotencyKey: crypto.randomUUID() } });
                toast.success("Cancelled"); qc.invalidateQueries({ queryKey: ["admin", "event", id] });
              }}>Cancel</Button>
            )}
            <Button variant="outline" onClick={async () => {
              const r = await dup({ data: { id, idempotencyKey: crypto.randomUUID() } });
              toast.success("Duplicated"); navigate({ to: "/admin/events/$id", params: { id: r.id } });
            }}>Duplicate</Button>
          </>
        }
      />

      <div className="px-6 sm:px-10 py-8 max-w-5xl">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="public">Public sign-ups</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-5">
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div>
              <Label>Category label (shown above title)</Label>
              <Input
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                placeholder="e.g. Lectures & Seminars"
                maxLength={120}
              />
            </div>
            <div><Label>Description (markdown)</Label><MarkdownEditor value={description} onChange={setDescription} rows={10} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Starts at</Label><Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
              <div><Label>Ends at (optional)</Label><Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
              <div><Label>Capacity</Label><Input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
              <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            </div>
            <div>
              <Label>Cover image</Label>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
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
                {formTplId !== "none" && (
                  <p className="text-xs text-[#6b6453] mt-2">
                    Public link: <code className="font-mono">/forms/{formTplId}?event={id}</code>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Payment</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={requiresPayment} onChange={(e) => setRequiresPayment(e.target.checked)} />
                  Requires payment
                </label>
                {requiresPayment && (
                  <p className="text-xs text-[#9b2c2c]">Stripe is not yet configured. Toggle is saved; checkout will activate once keys are added.</p>
                )}
              </div>
            </div>
            <AudiencePanel value={audience} onChange={setAudience} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Feature on homepage
            </label>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : "Save changes"}
            </Button>
          </TabsContent>

          <TabsContent value="speakers" className="mt-6">
            <SpeakersEditor speakers={speakers} setSpeakers={setSpeakers} onSave={() => saveMut.mutate()} saving={saveMut.isPending} />
          </TabsContent>

          <TabsContent value="roster" className="mt-6">
            <RosterTab eventId={id} />
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            <PublicRegistrationsTab eventId={id} />
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <SubmissionsTab eventId={id} hasTemplate={!!q.data?.event.form_template_id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RosterTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const list = useServerFn(listEventRoster);
  const check = useServerFn(checkInRegistration);
  const q = useQuery({ queryKey: ["admin", "roster", eventId], queryFn: () => list({ data: { eventId } }) });

  const exportCsv = () => {
    const rows = q.data?.registrations ?? [];
    const header = ["user_id", "status", "registered_at", "checked_in_at", "notes"];
    const body = rows.map((r) => header.map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? "")).join(","));
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `roster-${eventId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#6b6453]">{q.data?.registrations.length ?? 0} registrations</p>
        <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Registered</th>
              <th className="text-left px-4 py-3">Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ead7]">
            {q.data?.registrations.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 font-mono text-xs">{r.user_id}</td>
                <td className="px-4 py-2">{r.check_in_status}</td>
                <td className="px-4 py-2 text-xs text-[#6b6453]">{new Date(r.registered_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-xs">{r.notes ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  {r.check_in_status !== "checked_in" && r.check_in_status !== "cancelled" && (
                    <Button size="sm" variant="outline" onClick={async () => {
                      await check({ data: { registrationId: r.id, idempotencyKey: crypto.randomUUID() } });
                      toast.success("Checked in"); qc.invalidateQueries({ queryKey: ["admin", "roster", eventId] });
                    }}>Check in</Button>
                  )}
                </td>
              </tr>
            ))}
            {q.data && q.data.registrations.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-[#6b6453]">No registrations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubmissionsTab({ eventId, hasTemplate }: { eventId: string; hasTemplate: boolean }) {
  const list = useServerFn(listSubmissionsForEvent);
  const q = useQuery({
    queryKey: ["admin", "submissions", eventId],
    queryFn: () => list({ data: { eventId } }),
    enabled: hasTemplate,
  });
  if (!hasTemplate) {
    return <p className="text-sm text-[#6b6453]">Attach a form template in Details to collect submissions.</p>;
  }
  return (
    <div className="space-y-3">
      {q.data?.submissions.map((s) => (
        <article key={s.id} className="bg-white border border-[#e5dec9] rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#6b6453]">{s.user_id ?? "anon"}</span>
            <time className="text-xs text-[#6b6453]">{new Date(s.created_at).toLocaleString()}</time>
          </div>
          <pre className="text-xs bg-[#FAF8F5] p-3 rounded-sm overflow-x-auto">{JSON.stringify(s.data, null, 2)}</pre>
        </article>
      ))}
      {q.data && q.data.submissions.length === 0 && <p className="text-sm text-[#6b6453]">No submissions yet.</p>}
    </div>
  );
}

function SpeakersEditor({
  speakers,
  setSpeakers,
  onSave,
  saving,
}: {
  speakers: SpeakerInput[];
  setSpeakers: React.Dispatch<React.SetStateAction<SpeakerInput[]>>;
  onSave: () => void;
  saving: boolean;
}) {
  const update = (i: number, patch: Partial<SpeakerInput>) =>
    setSpeakers((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => setSpeakers((arr) => arr.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setSpeakers((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const copy = [...arr];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6b6453]">
        Add speakers shown on the public event page. Order here is the order shown publicly.
      </p>
      {speakers.map((s, i) => (
        <div key={i} className="bg-white border border-[#e5dec9] rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-[#6b6453]">Speaker {i + 1}</span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0}>↑</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === speakers.length - 1}>↓</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>Remove</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={s.name} onChange={(e) => update(i, { name: e.target.value })} /></div>
            <div><Label>Role / Title</Label><Input value={s.role} onChange={(e) => update(i, { role: e.target.value })} /></div>
          </div>
          <div><Label>Photo URL</Label><Input value={s.photo_url} onChange={(e) => update(i, { photo_url: e.target.value })} placeholder="https://…" /></div>
          <div>
            <Label>Bio</Label>
            <textarea
              value={s.bio}
              onChange={(e) => update(i, { bio: e.target.value })}
              rows={3}
              maxLength={2000}
              className="w-full border border-[#e5dec9] rounded-sm px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setSpeakers((arr) => [...arr, { name: "", role: "", bio: "", photo_url: "" }])}
        >
          + Add speaker
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save speakers"}
        </Button>
      </div>
    </div>
  );
}

function PublicRegistrationsTab({ eventId }: { eventId: string }) {
  const list = useServerFn(listPublicRegistrationsAdmin);
  const q = useQuery({
    queryKey: ["admin", "public-regs", eventId],
    queryFn: () => list({ data: { eventId } }),
  });
  const rows = q.data?.registrations ?? [];

  return (
    <div>
      <p className="text-sm text-[#6b6453] mb-3">{rows.length} public sign-ups</p>
      <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Qty</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ead7]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2">{r.full_name}</td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2">{r.quantity}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">
                  {r.amount_cents > 0
                    ? `${(r.amount_cents / 100).toFixed(2)} ${r.currency.toUpperCase()}`
                    : "Free"}
                </td>
                <td className="px-4 py-2 text-xs text-[#6b6453]">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-[#6b6453]">No public sign-ups yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

