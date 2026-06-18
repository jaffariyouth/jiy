import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField } from "@/components/admin/SectionEditor";

export const Route = createFileRoute("/_authenticated/admin/homepage/press")({
  component: PressEditor,
});

type PressContent = {
  section_kicker: string;
  section_headline: string;
  section_subhead_italic: string;
  archive_label: string;
  archive_href: string;
  volume_label: string;
  journal_title: string;
  journal_subtitle: string;
  journal_footer: string;
};

const DEF: PressContent = {
  section_kicker: "JOURNAL FEATURES",
  section_headline: "The Youth Press",
  section_subhead_italic: "& Publications",
  archive_label: "Explore Journal Archive →",
  archive_href: "#",
  volume_label: "VOLUME IX • ISSUE II",
  journal_title: "The Youth Press",
  journal_subtitle: "A Journal of Thought & Art",
  journal_footer: "Published by JIY Board",
};

function PressEditor() {
  return (
    <SectionEditor<PressContent> sectionKey="press" defaults={DEF}>
      {(s, set) => (
        <>
          <p className="text-xs text-[#6b6453]">
            Featured articles displayed in this section come from Press Articles marked as <strong>Feature on homepage</strong>.
          </p>
          <TextField label="Section kicker" value={s.section_kicker} onChange={(v) => set({ section_kicker: v })} />
          <TextField label="Section headline" value={s.section_headline} onChange={(v) => set({ section_headline: v })} />
          <TextField label="Headline italic subhead" value={s.section_subhead_italic} onChange={(v) => set({ section_subhead_italic: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Archive link label" value={s.archive_label} onChange={(v) => set({ archive_label: v })} />
            <TextField label="Archive link href" value={s.archive_href} onChange={(v) => set({ archive_href: v })} />
          </div>
          <TextField label="Volume label (cover plate)" value={s.volume_label} onChange={(v) => set({ volume_label: v })} />
          <TextField label="Journal title (cover plate)" value={s.journal_title} onChange={(v) => set({ journal_title: v })} />
          <TextField label="Journal subtitle (cover plate)" value={s.journal_subtitle} onChange={(v) => set({ journal_subtitle: v })} />
          <TextField label="Journal footer (cover plate)" value={s.journal_footer} onChange={(v) => set({ journal_footer: v })} />
        </>
      )}
    </SectionEditor>
  );
}
