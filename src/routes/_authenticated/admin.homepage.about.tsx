import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField } from "@/components/admin/SectionEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/homepage/about")({
  component: AboutEditor,
});

type Stat = { value: string; label: string };
type AboutContent = {
  eyebrow: string;
  heading: string;
  body: string;
  stats: Stat[];
};

const defaults: AboutContent = { eyebrow: "", heading: "", body: "", stats: [] };

function AboutEditor() {
  return (
    <SectionEditor<AboutContent> sectionKey="about" defaults={defaults}>
      {(state, set) => (
        <>
          <TextField label="Eyebrow" value={state.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Heading" value={state.heading} onChange={(v) => set({ heading: v })} />
          <TextareaField label="Body" value={state.body} onChange={(v) => set({ body: v })} rows={5} />
          <div>
            <Label>Stats</Label>
            <div className="space-y-2 mt-2">
              {state.stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="w-32"
                    placeholder="Value (500+)"
                    value={stat.value}
                    onChange={(e) => {
                      const next = [...state.stats];
                      next[i] = { ...stat, value: e.target.value };
                      set({ stats: next });
                    }}
                  />
                  <Input
                    placeholder="Label"
                    value={stat.label}
                    onChange={(e) => {
                      const next = [...state.stats];
                      next[i] = { ...stat, label: e.target.value };
                      set({ stats: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set({ stats: state.stats.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set({ stats: [...state.stats, { value: "", label: "" }] })}
              >
                Add stat
              </Button>
            </div>
          </div>
        </>
      )}
    </SectionEditor>
  );
}
