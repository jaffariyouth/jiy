import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/homepage/ongoing")({
  component: OngoingEditor,
});

type Initiative = { icon: string; title: string; description: string };
type OngoingContent = {
  eyebrow: string;
  heading: string;
  body_1: string;
  body_2: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  initiatives: Initiative[];
};

const defaults: OngoingContent = {
  eyebrow: "",
  heading: "",
  body_1: "",
  body_2: "",
  image_url: "",
  cta_label: "",
  cta_url: "",
  initiatives: [],
};

function OngoingEditor() {
  return (
    <SectionEditor<OngoingContent> sectionKey="ongoing" defaults={defaults}>
      {(state, set) => (
        <>
          <TextField label="Eyebrow" value={state.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Heading" value={state.heading} onChange={(v) => set({ heading: v })} />
          <TextareaField label="First paragraph" value={state.body_1} onChange={(v) => set({ body_1: v })} rows={4} />
          <TextareaField label="Second paragraph" value={state.body_2} onChange={(v) => set({ body_2: v })} rows={4} />
          <ImageField label="Image" value={state.image_url} onChange={(v) => set({ image_url: v })} folder="ongoing" />
          <TextField label="CTA label" value={state.cta_label} onChange={(v) => set({ cta_label: v })} />
          <TextField label="CTA URL" value={state.cta_url} onChange={(v) => set({ cta_url: v })} />
          <div>
            <Label>Initiatives</Label>
            <p className="text-xs text-[#6b6453] mb-2">
              Icon names from{" "}
              <a className="underline" href="https://fonts.google.com/icons" target="_blank" rel="noopener">
                Material Symbols
              </a>
              .
            </p>
            <div className="space-y-3">
              {state.initiatives.map((it, i) => (
                <div key={i} className="border border-[#e5dec9] rounded-sm p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      className="w-40"
                      placeholder="icon (e.g. menu_book)"
                      value={it.icon}
                      onChange={(e) => {
                        const next = [...state.initiatives];
                        next[i] = { ...it, icon: e.target.value };
                        set({ initiatives: next });
                      }}
                    />
                    <Input
                      placeholder="Title"
                      value={it.title}
                      onChange={(e) => {
                        const next = [...state.initiatives];
                        next[i] = { ...it, title: e.target.value };
                        set({ initiatives: next });
                      }}
                    />
                  </div>
                  <Input
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => {
                      const next = [...state.initiatives];
                      next[i] = { ...it, description: e.target.value };
                      set({ initiatives: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set({ initiatives: state.initiatives.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  set({
                    initiatives: [...state.initiatives, { icon: "star", title: "", description: "" }],
                  })
                }
              >
                Add initiative
              </Button>
            </div>
          </div>
        </>
      )}
    </SectionEditor>
  );
}
