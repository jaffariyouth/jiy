import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedAnnouncements } from "@/lib/jiy/announcements.functions";

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  if (days < 365) return `Posted ${Math.floor(days / 30)} months ago`;
  return `Posted ${Math.floor(days / 365)} years ago`;
}

function snippet(md: string, max = 180): string {
  const text = md
    .replace(/[#>*_`~\-]/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export function AnnouncementsWidget() {
  const fetchFn = useServerFn(listPublishedAnnouncements);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-announcements"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  const items = (data?.announcements ?? []).slice(0, 3);

  return (
    <div className="studio-card rounded-xl p-6 bg-white flex flex-col gap-5">
      <div className="border-b border-horizon-mist pb-2">
        <p className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
          COMMUNITY
        </p>
        <h4 className="font-headline text-xl text-primary-dark mt-1">Announcements</h4>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-ash-slate italic">Loading…</p>
      ) : items.length === 0 ? (
        <p className="font-body text-sm text-ash-slate italic">No announcements yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((a, idx) => (
            <div key={a.id} className="flex flex-col">
              {idx > 0 && <div className="h-px bg-horizon-mist/60 w-full mb-4 -mt-4" />}
              <span className="font-body text-[9px] uppercase tracking-wider text-ash-slate">
                {relativeTime(a.published_at ?? a.created_at)}
                {a.pinned ? " • Pinned" : ""}
              </span>
              <p className="font-headline text-base italic text-primary-dark mt-1 leading-snug">
                {a.title}
              </p>
              {a.body_md ? (
                <p className="font-body text-xs text-ash-slate mt-1.5 leading-relaxed">
                  {snippet(a.body_md)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
