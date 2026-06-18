import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField } from "@/components/admin/SectionEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/homepage/values")({
  component: ValuesEditor,
});

type Item = { number: string; title: string; body: string };
type ValuesContent = {
  section_kicker: string;
  section_headline: string;
  items: Item[];
};

const DEF: ValuesContent = {
  section_kicker: "OUR CORE VALUES",
  section_headline: "Strategic Foundations",
  items: [
    { number: "01", title: "Authentic Engagement", body: "" },
    { number: "02", title: "Sustainability", body: "" },
    { number: "03", title: "Service & Social Impact", body: "" },
    { number: "04", title: "Faith as Identity", body: "" },
    { number: "05", title: "Community Connection", body: "" },
    { number: "06", title: "Scholarly Guidance", body: "" },
  ],
};

function ValuesEditor() {
  return (
    <SectionEditor<ValuesContent> sectionKey="values" defaults={DEF}>
      {(s, set) => (
        <>
          <TextField label="Section kicker" value={s.section_kicker} onChange={(v) => set({ section_kicker: v })} />
          <TextField label="Section headline" value={s.section_headline} onChange={(v) => set({ section_headline: v })} />

          <div>
            <Label>Strategic foundations (tabs)</Label>
            <div className="space-y-3 mt-2">
              {s.items.map((it, i) => (
                <div key={i} className="border border-[#e5dec9] rounded-sm p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      className="w-20"
                      placeholder="01"
                      value={it.number}
                      onChange={(e) => {
                        const next = [...s.items];
                        next[i] = { ...next[i], number: e.target.value };
                        set({ items: next });
                      }}
                    />
                    <Input
                      placeholder="Title"
                      value={it.title}
                      onChange={(e) => {
                        const next = [...s.items];
                        next[i] = { ...next[i], title: e.target.value };
                        set({ items: next });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => set({ items: s.items.filter((_, j) => j !== i) })}
                    >
                      Remove
                    </Button>
                  </div>
                  <textarea
                    className="w-full border border-[#e5dec9] rounded-sm px-3 py-2 text-sm bg-white"
                    rows={3}
                    placeholder="Body"
                    value={it.body}
                    onChange={(e) => {
                      const next = [...s.items];
                      next[i] = { ...next[i], body: e.target.value };
                      set({ items: next });
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set({ items: [...s.items, { number: "", title: "", body: "" }] })}
              >
                + Add value
              </Button>
            </div>
          </div>
        </>
      )}
    </SectionEditor>
  );
}
