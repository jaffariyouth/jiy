import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSectionContent,
  updateSectionContent,
  publishSectionContent,
  type SectionKey,
} from "@/lib/jiy/site-content.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaGalleryPicker } from "./MediaGalleryPicker";
import { Images } from "lucide-react";

type Content = Record<string, unknown>;

export function SectionEditor<T extends Content>({
  sectionKey,
  defaults,
  children,
}: {
  sectionKey: SectionKey;
  defaults: T;
  children: (state: T, set: (patch: Partial<T>) => void) => ReactNode;
}) {
  const qc = useQueryClient();
  const get = useServerFn(getSectionContent);
  const upd = useServerFn(updateSectionContent);
  const pub = useServerFn(publishSectionContent);
  const q = useQuery({
    queryKey: ["site_content", sectionKey],
    queryFn: () => get({ data: { key: sectionKey } }),
  });

  const [state, setState] = useState<T>(defaults);
  useEffect(() => {
    if (q.data?.section?.draft_content) {
      setState({ ...defaults, ...(q.data.section.draft_content as T) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data?.section]);

  const set = (patch: Partial<T>) => setState((prev) => ({ ...prev, ...patch }));

  const saveDraft = useMutation({
    mutationFn: () => upd({ data: { key: sectionKey, content: state as Record<string, unknown> } }),
    onSuccess: () => {
      toast.success("Draft saved (not yet visible to the public)");
      qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publish = useMutation({
    mutationFn: async () => {
      // Always save the latest edits to the draft before publishing.
      await upd({ data: { key: sectionKey, content: state as Record<string, unknown> } });
      return pub({ data: { key: sectionKey } });
    },
    onSuccess: () => {
      toast.success("Published — live on the public page");
      qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
      qc.invalidateQueries({ queryKey: ["homepage"] });
      qc.invalidateQueries({ queryKey: ["team-page"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="px-6 sm:px-10 py-8 text-sm text-[#6b6453]">Loading…</div>;

  const section = q.data?.section;
  const publishedAt = section?.published_at;
  const hasUnpublished = section?.has_unpublished_changes ?? false;
  const status = !publishedAt
    ? { label: "Not yet published", color: "bg-[#caa460]/20 text-[#7a6638] border-[#caa460]/40" }
    : hasUnpublished
    ? { label: "Unpublished changes", color: "bg-[#caa460]/20 text-[#7a6638] border-[#caa460]/40" }
    : { label: "Published", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveDraft.mutate();
      }}
      className="px-6 sm:px-10 py-8 max-w-3xl space-y-5"
    >
      <div className="flex flex-wrap items-center gap-3 border border-[#e5dec9] rounded-sm bg-white px-4 py-3">
        <span className={`text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-1 rounded-sm border ${status.color}`}>
          {status.label}
        </span>
        <span className="text-xs text-[#6b6453]">
          {publishedAt
            ? `Last published ${new Date(publishedAt).toLocaleString()}`
            : "This section has never been published."}
        </span>
      </div>

      {children(state, set)}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e5dec9]">
        <Button type="submit" variant="outline" disabled={saveDraft.isPending}>
          {saveDraft.isPending ? "Saving…" : "Save draft"}
        </Button>
        <Button
          type="button"
          disabled={publish.isPending}
          onClick={() => publish.mutate()}
        >
          {publish.isPending ? "Publishing…" : "Publish to public site"}
        </Button>
        <p className="text-xs text-[#6b6453] basis-full">
          Saving stores your edits privately. Publishing copies them to the live public page.
        </p>
      </div>
    </form>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        className="w-full border border-[#e5dec9] rounded-sm px-3 py-2 text-sm bg-white"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `homepage/${folder}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from("editorial-media").upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col sm:flex-row gap-3 items-start mt-1">
        {value && (
          <img src={value} alt="" className="h-24 w-40 object-cover border border-[#e5dec9] rounded-sm" />
        )}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setGalleryOpen(true)}>
              <Images className="h-3.5 w-3.5 mr-1.5" />
              Choose from gallery
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
          {uploading && <p className="text-xs text-[#6b6453]">Uploading…</p>}
        </div>
      </div>
      <Input
        className="mt-2"
        placeholder="…or paste an image URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <MediaGalleryPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={onChange}
        defaultFolder={`homepage/${folder}`}
      />
    </div>
  );
}
