import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField, TextareaField, ImageField } from "@/components/admin/SectionEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/homepage/hero")({
  component: HeroEditor,
});

type Social = { network: string; url: string };
type HeroContent = {
  kicker: string;
  headline_line1: string;
  headline_line2_italic: string;
  body: string;
  photo_url: string;
  quote: string;
  quote_attribution: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  socials: Social[];
};

const DEF: HeroContent = {
  kicker: "Jaffari Islamic Youth",
  headline_line1: "Rooted in Heritage.",
  headline_line2_italic: "Built for the Future.",
  body: "",
  photo_url: "",
  quote: "",
  quote_attribution: "",
  cta_primary_label: "Upcoming Events",
  cta_primary_href: "#upcoming-events",
  cta_secondary_label: "Meet Our Team",
  cta_secondary_href: "#about-us",
  socials: [
    { network: "instagram", url: "" },
    { network: "linkedin", url: "" },
    { network: "youtube", url: "" },
    { network: "linktree", url: "" },
  ],
};

function HeroEditor() {
  return (
    <SectionEditor<HeroContent> sectionKey="hero" defaults={DEF}>
      {(s, set) => (
        <>
          <TextField label="Kicker (small uppercase text above headline)" value={s.kicker} onChange={(v) => set({ kicker: v })} />
          <TextField label="Headline — line 1" value={s.headline_line1} onChange={(v) => set({ headline_line1: v })} />
          <TextField label="Headline — line 2 (italic)" value={s.headline_line2_italic} onChange={(v) => set({ headline_line2_italic: v })} />
          <TextareaField label="Body paragraph" value={s.body} onChange={(v) => set({ body: v })} rows={4} />
          <ImageField label="Hero photo (shown inside Ogee arch)" value={s.photo_url} onChange={(v) => set({ photo_url: v })} folder="hero" />
          <TextField label="Pull quote (over photo)" value={s.quote} onChange={(v) => set({ quote: v })} />
          <TextField label="Quote attribution" value={s.quote_attribution} onChange={(v) => set({ quote_attribution: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Primary CTA label" value={s.cta_primary_label} onChange={(v) => set({ cta_primary_label: v })} />
            <TextField label="Primary CTA link" value={s.cta_primary_href} onChange={(v) => set({ cta_primary_href: v })} />
            <TextField label="Secondary CTA label" value={s.cta_secondary_label} onChange={(v) => set({ cta_secondary_label: v })} />
            <TextField label="Secondary CTA link" value={s.cta_secondary_href} onChange={(v) => set({ cta_secondary_href: v })} />
          </div>

          <div>
            <Label>Social links</Label>
            <div className="space-y-2 mt-2">
              {s.socials.map((soc, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    className="w-32"
                    placeholder="network"
                    value={soc.network}
                    onChange={(e) => {
                      const next = [...s.socials];
                      next[i] = { ...next[i], network: e.target.value };
                      set({ socials: next });
                    }}
                  />
                  <Input
                    placeholder="https://…"
                    value={soc.url}
                    onChange={(e) => {
                      const next = [...s.socials];
                      next[i] = { ...next[i], url: e.target.value };
                      set({ socials: next });
                    }}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => set({ socials: s.socials.filter((_, j) => j !== i) })}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set({ socials: [...s.socials, { network: "", url: "" }] })}>
                + Add social
              </Button>
            </div>
            <p className="text-xs text-[#6b6453] mt-2">
              Supported networks (use brand color icon): instagram, linkedin, youtube, linktree
            </p>
          </div>
        </>
      )}
    </SectionEditor>
  );
}
