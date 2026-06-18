import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField } from "@/components/admin/SectionEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/homepage/footer")({
  component: FooterEditor,
});

type Link = { label: string; href: string };
type Social = { network: string; url: string };
type FooterContent = {
  brand_tagline: string;
  nav_links: Link[];
  socials: Social[];
  copyright: string;
};

const DEF: FooterContent = {
  brand_tagline: "Jaffari Islamic Youth",
  nav_links: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "#about-us" },
    { label: "Our Team", href: "" },
  ],
  socials: [
    { network: "instagram", url: "" },
    { network: "linkedin", url: "" },
    { network: "youtube", url: "" },
    { network: "linktree", url: "" },
  ],
  copyright: "© 2026 Jaffari Islamic Youth. All rights reserved.",
};

function FooterEditor() {
  return (
    <SectionEditor<FooterContent> sectionKey="footer" defaults={DEF}>
      {(s, set) => (
        <>
          <TextField label="Brand tagline (under JIY)" value={s.brand_tagline} onChange={(v) => set({ brand_tagline: v })} />
          <TextField label="Copyright line" value={s.copyright} onChange={(v) => set({ copyright: v })} />

          <div>
            <Label>Footer nav links</Label>
            <div className="space-y-2 mt-2">
              {s.nav_links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    className="w-40"
                    placeholder="Label"
                    value={l.label}
                    onChange={(e) => {
                      const next = [...s.nav_links];
                      next[i] = { ...next[i], label: e.target.value };
                      set({ nav_links: next });
                    }}
                  />
                  <Input
                    placeholder="Link"
                    value={l.href}
                    onChange={(e) => {
                      const next = [...s.nav_links];
                      next[i] = { ...next[i], href: e.target.value };
                      set({ nav_links: next });
                    }}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => set({ nav_links: s.nav_links.filter((_, j) => j !== i) })}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set({ nav_links: [...s.nav_links, { label: "", href: "" }] })}>
                + Add link
              </Button>
            </div>
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
          </div>
        </>
      )}
    </SectionEditor>
  );
}
