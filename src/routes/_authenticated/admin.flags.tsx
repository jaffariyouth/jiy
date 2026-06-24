import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listFeatureFlags, setFeatureFlag } from "@/lib/jiy/feature-flags.functions";
import { THEMES, type ThemeKey } from "@/lib/jiy/themes";
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
    refresh();
  };

  // Determine active theme from flags.
  const flagsByKey = new Map(q.data?.flags.map((f) => [f.key, f.enabled]) ?? []);
  const activeTheme: ThemeKey =
    (Object.entries(THEMES).find(
      ([key, t]) => key !== "default" && t.flag && flagsByKey.get(t.flag),
    )?.[0] as ThemeKey) ?? "default";

  const selectTheme = async (next: ThemeKey) => {
    // Flip the chosen theme's flag on and every other theme's flag off in one batch.
    const ops: Promise<unknown>[] = [];
    for (const [key, t] of Object.entries(THEMES)) {
      if (!t.flag) continue;
      const shouldBeOn = key === next;
      if (flagsByKey.get(t.flag) !== shouldBeOn) {
        ops.push(
          setFn({
            data: { idempotencyKey: crypto.randomUUID(), key: t.flag, enabled: shouldBeOn },
          }),
        );
      }
    }
    await Promise.all(ops);
    toast.success(`Theme: ${THEMES[next].label}. Reload to see it everywhere.`);
    refresh();
  };

  return (
    <div>
      <AdminPageHeader title="Appearance & flags" subtitle="Switch the active theme and toggle feature flags." />
      <div className="px-6 sm:px-10 py-8 space-y-8 max-w-3xl">
        <section className="bg-white border border-[#e5dec9] rounded-sm p-5">
          <div className="font-serif text-lg text-[#010b21]">Active site theme</div>
          <p className="text-sm text-[#6b6453] mt-1 mb-4">
            Applies site-wide (public pages, dashboard, admin). Selecting a theme flips its flag on and disables others.
          </p>
          <div className="flex flex-col gap-2">
            {(Object.entries(THEMES) as Array<[ThemeKey, (typeof THEMES)[ThemeKey]]>).map(([key, t]) => (
              <label
                key={key}
                className={`flex items-start gap-3 border rounded-sm px-4 py-3 cursor-pointer transition-colors ${
                  activeTheme === key ? "border-[#caa460] bg-[#fdf9ef]" : "border-[#e5dec9] hover:bg-[#fdf9ef]/40"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  className="mt-1"
                  checked={activeTheme === key}
                  onChange={() => selectTheme(key)}
                />
                <div className="min-w-0">
                  <div className="font-serif text-base text-[#010b21]">{t.label}</div>
                  <div className="text-xs text-[#6b6453] mt-0.5">{t.description}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#e5dec9] rounded-sm divide-y divide-[#f0ead7]">
          <div className="px-4 py-3 font-serif text-base text-[#010b21]">All feature flags</div>
          {q.data?.flags.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm text-[#010b21] truncate">{f.key}</div>
                {f.description && <div className="text-xs text-[#6b6453] truncate">{f.description}</div>}
              </div>
              <label className="flex items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  checked={f.enabled}
                  onChange={(e) => {
                    toggle(f.key, e.target.checked);
                    toast.success(`${f.key}: ${e.target.checked ? "on" : "off"}`);
                  }}
                />
                <span className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">
                  {f.enabled ? "On" : "Off"}
                </span>
              </label>
            </div>
          ))}
          {q.data && q.data.flags.length === 0 && (
            <div className="px-4 py-6 text-sm text-[#6b6453] text-center">No flags yet.</div>
          )}
        </section>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newKey.trim()) return;
            await toggle(newKey.trim(), false);
            toast.success(`Created ${newKey.trim()}`);
            setNewKey("");
          }}
          className="flex gap-2"
        >
          <Input placeholder="new.flag.key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Button type="submit">Create flag</Button>
        </form>
      </div>
    </div>
  );
}

