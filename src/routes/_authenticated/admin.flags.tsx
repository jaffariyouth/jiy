import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listFeatureFlags, setFeatureFlag } from "@/lib/jiy/feature-flags.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/flags")({
  component: FlagsPage,
});

function FlagsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listFeatureFlags);
  const setFn = useServerFn(setFeatureFlag);
  const q = useQuery({ queryKey: ["admin", "flags"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "flags"] });

  const [newKey, setNewKey] = useState("");

  const toggle = async (key: string, enabled: boolean) => {
    await setFn({ data: { idempotencyKey: crypto.randomUUID(), key, enabled } });
    toast.success(`${key}: ${enabled ? "on" : "off"}`);
    refresh();
  };

  const muharramFlag = q.data?.flags.find((f) => f.key === "theme_muharram");
  const muharramOn = Boolean(muharramFlag?.enabled);

  return (
    <div>
      <AdminPageHeader title="Feature flags" subtitle="Toggle features without a deploy." />
      <div className="px-6 sm:px-10 py-8 space-y-6 max-w-3xl">
        <div className="bg-white border border-[#e5dec9] rounded-sm p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-serif text-lg text-[#010b21]">Muharram theme</div>
            <p className="text-sm text-[#6b6453] mt-1">
              Switch the entire site — public pages, dashboard, and admin — into the dark crimson
              Muharram &amp; Safar mourning palette.
            </p>
          </div>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={muharramOn}
              onChange={(e) => toggle("theme_muharram", e.target.checked)}
            />
            <span className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              {muharramOn ? "On" : "Off"}
            </span>
          </label>
        </div>
        <div className="bg-white border border-[#e5dec9] rounded-sm divide-y divide-[#f0ead7]">

          {q.data?.flags.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm text-[#010b21] truncate">{f.key}</div>
                {f.description && <div className="text-xs text-[#6b6453] truncate">{f.description}</div>}
              </div>
              <label className="flex items-center gap-2 shrink-0">
                <input type="checkbox" checked={f.enabled} onChange={(e) => toggle(f.key, e.target.checked)} />
                <span className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">{f.enabled ? "On" : "Off"}</span>
              </label>
            </div>
          ))}
          {q.data && q.data.flags.length === 0 && (
            <div className="px-4 py-6 text-sm text-[#6b6453] text-center">No flags yet.</div>
          )}
        </div>
        <form
          onSubmit={async (e) => { e.preventDefault(); if (!newKey.trim()) return; await toggle(newKey.trim(), false); setNewKey(""); }}
          className="flex gap-2"
        >
          <Input placeholder="new.flag.key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Button type="submit">Create flag</Button>
        </form>
      </div>
    </div>
  );
}
