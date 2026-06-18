import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/homepage/ongoing")({
  component: OngoingEditor,
});

type Initiative = { icon: string; title: string; description: string };
type OngoingContent = {
  kicker: string;
  headline: string;
  narrative_paragraph_1: string;
  narrative_paragraph_2: string;
  cta_label: string;
  cta_href: string;
  photo_url: string;
  initiatives: Initiative[];
};

const DEF: OngoingContent = {
  kicker: "COMMUNITY BUILDING",
  headline: "Ongoing Events",
  narrative_paragraph_1: "",
  narrative_paragraph_2: "",
  cta_label: "Explore Schedule",
  cta_href: "",
  photo_url: "",
  initiatives: [
    { icon: "sports_soccer", title: "", description: "" },
    { icon: "menu_book", title: "", description: "" },
    { icon: "forum", title: "", description: "" },
  ],
};

function OngoingEditor() {
  return (
    <SectionEditor<OngoingContent> sectionKey="ongoing" defaults={DEF}>
      {(s, set) => (
        <>
          <TextField label="Kicker" value={s.kicker} onChange={(v) => set({ kicker: v })} />
          <TextField label="Headline" value={s.headline} onChange={(v) => set({ headline: v })} />
          <TextareaField label="Narrative paragraph 1" value={s.narrative_paragraph_1} onChange={(v) => set({ narrative_paragraph_1: v })} />
          <TextareaField label="Narrative paragraph 2" value={s.narrative_paragraph_2} onChange={(v) => set({ narrative_paragraph_2: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="CTA label" value={s.cta_label} onChange={(v) => set({ cta_label: v })} />
            <TextField label="CTA link" value={s.cta_href} onChange={(v) => set({ cta_href: v })} />
          </div>
          <ImageField label="Center photo (inside Ogee arch)" value={s.photo_url} onChange={(v) => set({ photo_url: v })} folder="ongoing" />

          <div>
            <Label>Initiatives</Label>
            <p className="text-xs text-[#6b6453] mt-1 mb-3">
              Icon = Material Symbols name (e.g. sports_soccer, menu_book, forum).
            </p>
            <div className="space-y-3">
              {s.initiatives.map((it, i) => (
                <div key={i} className="border border-[#e5dec9] rounded-sm p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      className="w-40"
                      placeholder="icon name"
                      value={it.icon}
                      onChange={(e) => {
                        const next = [...s.initiatives];
                        next[i] = { ...next[i], icon: e.target.value };
                        set({ initiatives: next });
                      }}
                    />
                    <Input
                      placeholder="Title"
                      value={it.title}
                      onChange={(e) => {
                        const next = [...s.initiatives];
                        next[i] = { ...next[i], title: e.target.value };
                        set({ initiatives: next });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => set({ initiatives: s.initiatives.filter((_, j) => j !== i) })}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    placeholder="Short description"
                    value={it.description}
                    onChange={(e) => {
                      const next = [...s.initiatives];
                      next[i] = { ...next[i], description: e.target.value };
                      set({ initiatives: next });
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set({ initiatives: [...s.initiatives, { icon: "", title: "", description: "" }] })}
              >
                + Add initiative
              </Button>
            </div>
          </div>
        </>
      )}
    </SectionEditor>
  );
}
