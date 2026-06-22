import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";

type GalleryItem = { name: string; path: string; url: string; created_at?: string | null };

const BUCKET = "editorial-media";

async function listFolder(prefix: string): Promise<GalleryItem[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (error) {
    toast.error(error.message);
    return [];
  }
  return (data ?? [])
    .filter((f) => f.name && !f.name.endsWith("/") && f.id) // skip subfolders
    .map((f) => {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { name: f.name, path, url: pub.publicUrl, created_at: f.created_at };
    });
}

export function MediaGalleryPicker({
  open,
  onClose,
  onSelect,
  defaultFolder,
  allFolderPrefix,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultFolder: string; // e.g. "homepage/hero" or "events"
  /** Top-level prefix to walk when scope === "all". Defaults to first segment of defaultFolder. */
  allFolderPrefix?: string;
}) {
  const allRoot = allFolderPrefix ?? defaultFolder.split("/")[0] ?? defaultFolder;
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<"folder" | "all">("folder");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      if (scope === "folder") {
        setItems(await listFolder(defaultFolder));
      } else {
        // Walk top-level tree two levels deep.
        const top = await supabase.storage.from(BUCKET).list(allRoot, { limit: 100 });
        const folders = (top.data ?? []).filter((f) => !f.id).map((f) => `${allRoot}/${f.name}`);
        const all = await Promise.all([listFolder(allRoot), ...folders.map(listFolder)]);
        setItems(all.flat().sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      }
      setLoading(false);
    })();
  }, [open, scope, defaultFolder, allRoot]);

  if (!open) return null;

  const filtered = items.filter((i) =>
    search ? i.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const remove = async (item: GalleryItem) => {
    if (!confirm(`Delete ${item.name}? This can't be undone.`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([item.path]);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.filter((p) => p.path !== item.path));
    toast.success("Deleted");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-sm w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#e5dec9] flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#010b21]">Media gallery</h2>
            <p className="text-xs text-[#6b6453] mt-0.5">
              Pick from previously uploaded images in <code className="font-mono">{defaultFolder}</code>.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-3 border-b border-[#e5dec9] flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={scope === "folder" ? "default" : "outline"}
              onClick={() => setScope("folder")}
            >
              This section
            </Button>
            <Button
              type="button"
              size="sm"
              variant={scope === "all" ? "default" : "outline"}
              onClick={() => setScope("all")}
            >
              All homepage
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-sm text-[#6b6453]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-[#6b6453]">No images yet in this folder.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => (
                <div key={item.path} className="group relative border border-[#e5dec9] rounded-sm overflow-hidden bg-[#FAF8F5]">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className="block w-full text-left"
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                    <div className="p-2">
                      <div className="text-xs text-[#010b21] truncate" title={item.name}>{item.name}</div>
                      {item.created_at && (
                        <div className="text-[10px] text-[#6b6453] mt-0.5">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="absolute top-1 right-1 bg-white/90 hover:bg-white border border-[#e5dec9] rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#a23b2c]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
