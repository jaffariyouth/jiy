import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField } from "@/components/admin/SectionEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/homepage/values")({
  component: ValuesEditor,
});

type Tab = { title: string; body: string };
type ValuesContent = { eyebrow: string; heading: string; tabs: Tab[] };

const defaults: ValuesContent = { eyebrow: "", heading: "", tabs: [] };

function ValuesEditor() {
  return (
    <SectionEditor<ValuesContent> sectionKey="values" defaults={defaults}>
      {(state, set) => (
        <>
          <TextField label="Eyebrow" value={state.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Heading" value={state.heading} onChange={(v) => set({ heading: v })} />
          <div>
            <Label>Tabs</Label>
            <div className="space-y-3 mt-2">
              {state.tabs.map((tab, i) => (
                <div key={i} className="border border-[#e5dec9] rounded-sm p-3 space-y-2">
                  <Input
                    placeholder="Title"
                    value={tab.title}
                    onChange={(e) => {
                      const next = [...state.tabs];
                      next[i] = { ...tab, title: e.target.value };
                      set({ tabs: next });
                    }}
                  />
                  <textarea
                    className="w-full border border-[#e5dec9] rounded-sm px-3 py-2 text-sm bg-white"
                    rows={3}
                    placeholder="Body"
                    value={tab.body}
                    onChange={(e) => {
                      const next = [...state.tabs];
                      next[i] = { ...tab, body: e.target.value };
                      set({ tabs: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set({ tabs: state.tabs.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set({ tabs: [...state.tabs, { title: "", body: "" }] })}
              >
                Add tab
              </Button>
            </div>
          </div>
        </>
      )}
    </SectionEditor>
  );
}
