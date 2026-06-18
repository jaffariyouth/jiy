import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TEAM_DEFAULTS, type Leader } from "@/routes/team";

type LeadershipContent = {
  section_kicker: string;
  section_headline: string;
  section_subhead_italic: string;
  members: Leader[];
};

const DEF: LeadershipContent = TEAM_DEFAULTS.leadership;

export const Route = createFileRoute("/_authenticated/admin/team/leadership")({
  component: () => (
    <SectionEditor<LeadershipContent> sectionKey="team_leadership" defaults={DEF}>
      {(s, set) => {
        const setMember = (i: number, patch: Partial<Leader>) => {
          const next = [...s.members];
          next[i] = { ...next[i], ...patch };
          set({ members: next });
        };
        const remove = (i: number) => set({ members: s.members.filter((_, j) => j !== i) });
        const move = (i: number, dir: -1 | 1) => {
          const j = i + dir;
          if (j < 0 || j >= s.members.length) return;
          const next = [...s.members];
          [next[i], next[j]] = [next[j], next[i]];
          set({ members: next });
        };
        return (
          <>
            <TextField label="Section kicker" value={s.section_kicker} onChange={(v) => set({ section_kicker: v })} />
            <TextField label="Section headline" value={s.section_headline} onChange={(v) => set({ section_headline: v })} />
            <TextField label="Section subhead (italic)" value={s.section_subhead_italic} onChange={(v) => set({ section_subhead_italic: v })} />

            <div>
              <Label>Board members</Label>
              <div className="space-y-6 mt-3">
                {s.members.map((m, i) => (
                  <div key={i} className="border border-[#e5dec9] rounded-sm p-4 space-y-3 bg-white">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#6b6453] font-bold">Member #{i + 1}</span>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => move(i, -1)}>↑</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => move(i, 1)}>↓</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>Remove</Button>
                      </div>
                    </div>
                    <ImageField label="Photo" value={m.photo_url} onChange={(v) => setMember(i, { photo_url: v })} folder="team" />
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="Name" value={m.name} onChange={(v) => setMember(i, { name: v })} />
                      <TextField label="Role" value={m.role} onChange={(v) => setMember(i, { role: v })} />
                    </div>
                    <TextareaField label="Short bio" value={m.bio} onChange={(v) => setMember(i, { bio: v })} rows={3} />
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="Email (optional)" value={m.email ?? ""} onChange={(v) => setMember(i, { email: v })} />
                      <TextField label="LinkedIn URL (optional)" value={m.linkedin ?? ""} onChange={(v) => setMember(i, { linkedin: v })} />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    set({
                      members: [
                        ...s.members,
                        { photo_url: "", name: "", role: "", bio: "", email: "", linkedin: "" },
                      ],
                    })
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
