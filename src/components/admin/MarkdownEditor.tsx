import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Italic, Heading2, Heading3, List, Quote, Link as LinkIcon, Image as ImageIcon, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Insert = (before: string, after?: string, placeholder?: string) => void;

const TOOLBAR = (insert: Insert, pickInternal: () => void, uploadImage: () => void) => [
  { icon: Bold, label: "Bold", onClick: () => insert("**", "**", "bold") },
  { icon: Italic, label: "Italic", onClick: () => insert("_", "_", "italic") },
  { icon: Heading2, label: "H2", onClick: () => insert("\n## ", "\n", "Heading") },
  { icon: Heading3, label: "H3", onClick: () => insert("\n### ", "\n", "Subheading") },
  { icon: List, label: "List", onClick: () => insert("\n- ", "", "item") },
  { icon: Quote, label: "Quote", onClick: () => insert("\n> ", "\n", "quote") },
  { icon: LinkIcon, label: "Link", onClick: () => {
    const url = prompt("URL");
    if (url) insert("[", `](${url})`, "link text");
  } },
  { icon: ImageIcon, label: "Upload image", onClick: uploadImage },
  { icon: ExternalLink, label: "Internal link", onClick: pickInternal },
];

const INTERNAL_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Events list", path: "/events" },
  { label: "Press feed", path: "/press" },
  { label: "Profile", path: "/profile" },
];

export function MarkdownEditor({
  value,
  onChange,
  rows = 18,
  placeholder = "Write in Markdown…",
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [ref, setRef] = useState<HTMLTextAreaElement | null>(null);
  const [showInternal, setShowInternal] = useState(false);

  const insert: Insert = (before, after = "", placeholderText = "") => {
    if (!ref) return;
    const start = ref.selectionStart;
    const end = ref.selectionEnd;
    const sel = value.slice(start, end) || placeholderText;
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ref.focus();
      ref.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const uploadImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("editorial-media").upload(path, file, { upsert: false });
      if (error) {
        toast.error(`Upload failed: ${error.message}. Make sure the "editorial-media" bucket exists.`);
        return;
      }
      const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
      insert(`![${file.name}](${data.publicUrl})`, "", "");
      toast.success("Image inserted");
    };
    input.click();
  };

  const buttons = useMemo(
    () => TOOLBAR(insert, () => setShowInternal((s) => !s), uploadImage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref, value],
  );

  return (
    <div className="border border-[#e5dec9] rounded-sm bg-white">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-[#e5dec9] bg-[#FAF8F5] relative">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.label}
            onClick={b.onClick}
            className="p-1.5 rounded-sm hover:bg-[#f0ead7] text-[#2b2a26]"
          >
            <b.icon className="h-4 w-4" />
          </button>
        ))}
        {showInternal && (
          <div className="absolute z-10 top-full right-0 mt-1 bg-white border border-[#e5dec9] rounded-sm shadow-md min-w-[200px]">
            {INTERNAL_LINKS.map((l) => (
              <button
                key={l.path}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#f0ead7]"
                onClick={() => {
                  insert("[", `](${l.path})`, l.label);
                  setShowInternal(false);
                }}
              >
                {l.label} <span className="text-xs text-[#6b6453]">{l.path}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e5dec9]">
        <textarea
          ref={setRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full p-4 font-mono text-sm bg-white outline-none resize-y"
        />
        <div className="prose prose-sm max-w-none p-4 bg-[#FAF8F5] overflow-auto" style={{ minHeight: `${rows * 1.5}rem` }}>
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[#6b6453] italic">Preview…</p>
          )}
        </div>
      </div>
    </div>
  );
}
