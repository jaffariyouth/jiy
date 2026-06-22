import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { MediaGalleryPicker } from "./MediaGalleryPicker";

export function EventCoverPicker({
  value,
  onChange,
  eventId,
}: {
  value: string;
  onChange: (url: string) => void;
  /** Use the event's UUID once it exists; "new" for unsaved drafts. */
  eventId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `events/${eventId}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("editorial-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        toast.error(error.message);
        return;
      }
      const { data } = supabase.storage.from("editorial-media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Cover uploaded");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Cover image</Label>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-56 aspect-[16/10] border border-[#e5dec9] rounded-sm bg-[#FAF8F5] overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-[#a39882] text-xs px-3">
              <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-60" />
              No cover image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <label className="inline-flex items-center justify-center gap-2 cursor-pointer border border-[#010b21] bg-[#010b21] text-white hover:bg-[#1a2440] px-4 py-2 rounded-sm text-sm font-medium transition-colors disabled:opacity-50">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <ImageIcon className="h-4 w-4 mr-1.5" />
            Browse gallery
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="text-[#9b2c2c] hover:text-[#9b2c2c]"
            >
              <X className="h-4 w-4 mr-1.5" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-[#6b6453]">
        Recommended 16:10 ratio (e.g. 1600×1000). Uploads go to{" "}
        <code className="font-mono">editorial-media/events/{eventId}</code>.
      </p>

      <MediaGalleryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        defaultFolder={`events/${eventId}`}
        allFolderPrefix="events"
      />
    </div>
  );
}
