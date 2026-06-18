import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";
import { TEAM_DEFAULTS } from "@/routes/team";

type HeroContent = typeof TEAM_DEFAULTS.hero;

export const Route = createFileRoute("/_authenticated/admin/team/hero")({
  component: () => (
    <SectionEditor<HeroContent> sectionKey="team_hero" defaults={TEAM_DEFAULTS.hero}>
      {(s, set) => (
        <>
          <TextField label="Kicker (small uppercase line)" value={s.kicker} onChange={(v) => set({ kicker: v })} />
          <TextField label="Headline — line 1" value={s.headline_line1} onChange={(v) => set({ headline_line1: v })} />
          <TextField label="Headline — line 2 (italic)" value={s.headline_line2_italic} onChange={(v) => set({ headline_line2_italic: v })} />
          <TextareaField label="Body paragraph" value={s.body} onChange={(v) => set({ body: v })} rows={4} />
          <ImageField label="Hero photo (shown inside Ogee arch)" value={s.photo_url} onChange={(v) => set({ photo_url: v })} folder="team" />
          <TextField label="Photo caption" value={s.photo_caption} onChange={(v) => set({ photo_caption: v })} />
        </>
      )}
    </SectionEditor>
  ),
});
