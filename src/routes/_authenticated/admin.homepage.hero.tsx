import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";

export const Route = createFileRoute("/_authenticated/admin/homepage/hero")({
  component: HeroEditor,
});

type HeroContent = {
  eyebrow: string;
  headline: string;
  headline_italic: string;
  body: string;
  image_url: string;
  image_caption: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  linktree_url: string;
};

const defaults: HeroContent = {
  eyebrow: "",
  headline: "",
  headline_italic: "",
  body: "",
  image_url: "",
  image_caption: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  linktree_url: "",
};

function HeroEditor() {
  return (
    <SectionEditor<HeroContent> sectionKey="hero" defaults={defaults}>
      {(state, set) => (
        <>
          <TextField label="Eyebrow" value={state.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Headline (main)" value={state.headline} onChange={(v) => set({ headline: v })} />
          <TextField label="Headline (italic line)" value={state.headline_italic} onChange={(v) => set({ headline_italic: v })} />
          <TextareaField label="Body paragraph" value={state.body} onChange={(v) => set({ body: v })} rows={4} />
          <ImageField label="Hero image" value={state.image_url} onChange={(v) => set({ image_url: v })} folder="hero" />
          <TextField label="Image alt/caption" value={state.image_caption} onChange={(v) => set({ image_caption: v })} />
          <TextField label="Instagram URL" value={state.instagram_url} onChange={(v) => set({ instagram_url: v })} />
          <TextField label="LinkedIn URL" value={state.linkedin_url} onChange={(v) => set({ linkedin_url: v })} />
          <TextField label="YouTube URL" value={state.youtube_url} onChange={(v) => set({ youtube_url: v })} />
          <TextField label="Linktree URL" value={state.linktree_url} onChange={(v) => set({ linktree_url: v })} />
        </>
      )}
    </SectionEditor>
  );
}
