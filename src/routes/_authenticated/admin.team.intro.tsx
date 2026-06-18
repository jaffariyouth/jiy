import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField } from "@/components/admin/SectionEditor";
import { TEAM_DEFAULTS } from "@/routes/team";

type IntroContent = typeof TEAM_DEFAULTS.intro;

export const Route = createFileRoute("/_authenticated/admin/team/intro")({
  component: () => (
    <SectionEditor<IntroContent> sectionKey="team_intro" defaults={TEAM_DEFAULTS.intro}>
      {(s, set) => (
        <>
          <TextField label="Kicker" value={s.kicker} onChange={(v) => set({ kicker: v })} />
          <TextField label="Headline" value={s.headline} onChange={(v) => set({ headline: v })} />
          <TextareaField label="Body paragraph 1" value={s.body_paragraph_1} onChange={(v) => set({ body_paragraph_1: v })} rows={4} />
          <TextareaField label="Body paragraph 2" value={s.body_paragraph_2} onChange={(v) => set({ body_paragraph_2: v })} rows={4} />
          <TextareaField label="Pull quote" value={s.pull_quote} onChange={(v) => set({ pull_quote: v })} rows={2} />
          <TextField label="Pull quote attribution" value={s.pull_quote_attribution} onChange={(v) => set({ pull_quote_attribution: v })} />
        </>
      )}
    </SectionEditor>
  ),
});
