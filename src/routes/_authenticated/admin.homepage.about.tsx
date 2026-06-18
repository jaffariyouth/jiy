import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";

export const Route = createFileRoute("/_authenticated/admin/homepage/about")({
  component: AboutEditor,
});

type AboutContent = {
  kicker: string;
  headline: string;
  mission_quote: string;
  body_paragraph_1: string;
  body_paragraph_2: string;
  directives_label: string;
  directives_body_1: string;
  directives_body_2: string;
  photo_top_url: string;
  photo_bottom_url: string;
  photo_tall_url: string;
};

const DEF: AboutContent = {
  kicker: "❖ About Us ❖",
  headline: "Mission & Vision",
  mission_quote: "",
  body_paragraph_1: "",
  body_paragraph_2: "",
  directives_label: "Term Directives",
  directives_body_1: "",
  directives_body_2: "",
  photo_top_url: "",
  photo_bottom_url: "",
  photo_tall_url: "",
};

function AboutEditor() {
  return (
    <SectionEditor<AboutContent> sectionKey="about" defaults={DEF}>
      {(s, set) => (
        <>
          <TextField label="Kicker" value={s.kicker} onChange={(v) => set({ kicker: v })} />
          <TextField label="Headline" value={s.headline} onChange={(v) => set({ headline: v })} />
          <TextareaField label="Mission quote (shown in dark callout)" value={s.mission_quote} onChange={(v) => set({ mission_quote: v })} rows={3} />
          <TextareaField label="Body paragraph 1" value={s.body_paragraph_1} onChange={(v) => set({ body_paragraph_1: v })} />
          <TextareaField label="Body paragraph 2" value={s.body_paragraph_2} onChange={(v) => set({ body_paragraph_2: v })} />
          <TextField label="Directives label" value={s.directives_label} onChange={(v) => set({ directives_label: v })} />
          <TextareaField label="Directives body 1 (HTML allowed for <strong>)" value={s.directives_body_1} onChange={(v) => set({ directives_body_1: v })} />
          <TextareaField label="Directives body 2" value={s.directives_body_2} onChange={(v) => set({ directives_body_2: v })} />
          <ImageField label="Top-left square photo" value={s.photo_top_url} onChange={(v) => set({ photo_top_url: v })} folder="about" />
          <ImageField label="Bottom-left square photo" value={s.photo_bottom_url} onChange={(v) => set({ photo_bottom_url: v })} folder="about" />
          <ImageField label="Right tall photo" value={s.photo_tall_url} onChange={(v) => set({ photo_tall_url: v })} folder="about" />
        </>
      )}
    </SectionEditor>
  );
}
