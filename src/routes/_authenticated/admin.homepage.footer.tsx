import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor, TextField } from "@/components/admin/SectionEditor";

export const Route = createFileRoute("/_authenticated/admin/homepage/footer")({
  component: FooterEditor,
});

type FooterContent = {
  tagline: string;
  copyright: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  linktree_url: string;
};

const defaults: FooterContent = {
  tagline: "",
  copyright: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  linktree_url: "",
};

function FooterEditor() {
  return (
    <SectionEditor<FooterContent> sectionKey="footer" defaults={defaults}>
      {(state, set) => (
        <>
          <TextField label="Tagline" value={state.tagline} onChange={(v) => set({ tagline: v })} />
          <TextField label="Copyright" value={state.copyright} onChange={(v) => set({ copyright: v })} />
          <TextField label="Instagram URL" value={state.instagram_url} onChange={(v) => set({ instagram_url: v })} />
          <TextField label="LinkedIn URL" value={state.linkedin_url} onChange={(v) => set({ linkedin_url: v })} />
          <TextField label="YouTube URL" value={state.youtube_url} onChange={(v) => set({ youtube_url: v })} />
          <TextField label="Linktree URL" value={state.linktree_url} onChange={(v) => set({ linktree_url: v })} />
        </>
      )}
    </SectionEditor>
  );
}
