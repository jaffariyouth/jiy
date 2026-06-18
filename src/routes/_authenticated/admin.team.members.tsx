import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TEAM_DEFAULTS, type Member } from "@/routes/team";

type MembersContent = {
  section_kicker: string;
  section_headline: string;
  section_subhead_italic: string;
  body: string;
  items: Member[];
};

const DEF: MembersContent = TEAM_DEFAULTS.members;

export const Route = createFileRoute("/_authenticated/admin/team/members")({
  component: () => (
    <SectionEditor<MembersContent> sectionKey="team_members" defaults={DEF}>
      {(s, set) => {
        const setItem = (i: number, patch: Partial<Member>) => {
          const next = [...s.items];
          next[i] = { ...next[i], ...patch };
          set({ items: next });
        };
        const remove = (i: number) => set({ items: s.items.filter((_, j) => j !== i) });
        const move = (i: number, dir: -1 | 1) => {
          const j = i + dir;
          if (j < 0 || j >= s.items.length) return;
          const next = [...s.items];
          [next[i], next[j]] = [next[j], next[i]];
          set({ items: next });
        };
        return (
          <>
            <TextField label="Section kicker" value={s.section_kicker} onChange={(v) => set({ section_kicker: v })} />
            <TextField label="Section headline" value={s.section_headline} onChange={(v) => set({ section_headline: v })} />
            <TextField label="Section subhead (italic)" value={s.section_subhead_italic} onChange={(v) => set({ section_subhead_italic: v })} />
            <TextareaField label="Intro body" value={s.body} onChange={(v) => set({ body: v })} rows={3} />

            <div>
              <Label>Members</Label>
              <p className="text-xs text-[#6b6453] mt-1">Leave empty to hide this section on the public page.</p>
              <div className="space-y-4 mt-3">
                {s.items.map((m, i) => (
                  <div key={i} className="border border-[#e5dec9] rounded-sm p-4 space-y-3 bg-white">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#6b6453] font-bold">Member #{i + 1}</span>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => move(i, -1)}>↑</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => move(i, 1)}>↓</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>Remove</Button>
                      </div>
                    </div>
                    <ImageField label="Photo" value={m.photo_url} onChange={(v) => setItem(i, { photo_url: v })} folder="team-members" />
                    <div className="grid grid-cols-3 gap-3">
                      <TextField label="Name" value={m.name} onChange={(v) => setItem(i, { name: v })} />
                      <TextField label="Role" value={m.role} onChange={(v) => setItem(i, { role: v })} />
                      <TextField label="Region (optional)" value={m.region ?? ""} onChange={(v) => setItem(i, { region: v })} />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    set({ items: [...s.items, { photo_url: "", name: "", role: "", region: "" }] })
                  }
                >
                  + Add member
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </SectionEditor>
  ),
});
