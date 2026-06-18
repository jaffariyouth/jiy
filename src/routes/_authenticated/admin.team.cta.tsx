import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField } from "@/components/admin/SectionEditor";
import { TEAM_DEFAULTS } from "@/routes/team";

type CtaContent = typeof TEAM_DEFAULTS.cta;

export const Route = createFileRoute("/_authenticated/admin/team/cta")({
  component: () => (
    <SectionEditor<CtaContent> sectionKey="team_cta" defaults={TEAM_DEFAULTS.cta}>
      {(s, set) => (
        <>
          <TextField label="Kicker" value={s.kicker} onChange={(v) => set({ kicker: v })} />
          <TextField label="Headline" value={s.headline} onChange={(v) => set({ headline: v })} />
          <TextareaField label="Body" value={s.body} onChange={(v) => set({ body: v })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Button label" value={s.cta_label} onChange={(v) => set({ cta_label: v })} />
            <TextField label="Button link" value={s.cta_href} onChange={(v) => set({ cta_href: v })} />
          </div>
        </>
      )}
    </SectionEditor>
  ),
});
