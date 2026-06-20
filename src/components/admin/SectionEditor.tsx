import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSectionContent, updateSectionContent, type SectionKey } from "@/lib/jiy/site-content.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const q = useQuery({
    queryKey: ["site_content", sectionKey],
    queryFn: () => get({ data: { key: sectionKey } }),
  });

  const [state, setState] = useState<T>(defaults);
  useEffect(() => {
    if (q.data?.section?.content) {
      setState({ ...defaults, ...(q.data.section.content as T) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data?.section]);

  const set = (patch: Partial<T>) => setState((prev) => ({ ...prev, ...patch }));

  const mut = useMutation({
    mutationFn: () => upd({ data: { key: sectionKey, content: state as Record<string, unknown> } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
      qc.invalidateQueries({ queryKey: ["homepage"] });
      qc.invalidateQueries({ queryKey: ["team-page"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="px-6 sm:px-10 py-8 text-sm text-[#6b6453]">Loading…</div>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
      className="px-6 sm:px-10 py-8 max-w-3xl space-y-5"
    >
      {children(state, set)}
      <Button type="submit" disabled={mut.isPending}>
        {mut.isPending ? "Saving…" : "Save changes"}
      </Button>
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
  const upload = async (file: File) => {
    const path = `homepage/${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("editorial-media").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
    onChange(data.publicUrl);
    toast.success("Uploaded");
  };
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col sm:flex-row gap-3 items-start mt-1">
        {value && (
          <img src={value} alt="" className="h-24 w-40 object-cover border border-[#e5dec9] rounded-sm" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
          className="text-sm"
        />
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </div>
      <Input
        className="mt-2"
        placeholder="…or paste an image URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
