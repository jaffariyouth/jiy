import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField } from "@/components/admin/SectionEditor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/homepage/metrics")({
  component: MetricsEditor,
});

type Metric = { value: string; label: string };
type MetricsContent = { items: Metric[] };

const DEF: MetricsContent = {
  items: [
    { value: "1,200+", label: "WhatsApp Members" },
    { value: "3,000+", label: "Youths Served" },
    { value: "25+", label: "Events Yearly" },
    { value: "4,500+", label: "Instagram Followers" },
  ],
};

function MetricsEditor() {
  return (
    <SectionEditor<MetricsContent> sectionKey="metrics" defaults={DEF}>
      {(s, set) => (
        <div className="space-y-3">
          {s.items.map((m, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 items-end border-b border-[#e5dec9] pb-3">
              <TextField
                label={`Stat ${i + 1} — value`}
                value={m.value}
                onChange={(v) => {
                  const next = [...s.items];
                  next[i] = { ...next[i], value: v };
                  set({ items: next });
                }}
              />
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <TextField
                    label="Label"
                    value={m.label}
                    onChange={(v) => {
                      const next = [...s.items];
                      next[i] = { ...next[i], label: v };
                      set({ items: next });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => set({ items: s.items.filter((_, j) => j !== i) })}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set({ items: [...s.items, { value: "", label: "" }] })}>
            + Add metric
          </Button>
        </div>
      )}
    </SectionEditor>
  );
}
