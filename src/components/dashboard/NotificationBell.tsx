import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/jiy/event-registrations.functions";

const TEMPLATE_LABELS: Record<string, string> = {
  "event.registration_confirmed": "Event registration confirmed",
  "scholar_question.pending_triage": "New question pending triage",
  "scholar_question.answered": "Your question was answered",
  "scholar_question.assigned": "A question was assigned to you",
};

function labelFor(key: string) {
  return TEMPLATE_LABELS[key] ?? key.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const fetchFn = useServerFn(listMyNotifications);
  const markOne = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);

  const { data } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => fetchFn(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const all = data?.notifications ?? [];
  const inApp = all.filter((n) => n.channel === "in_app");
  const unread = inApp.filter((n) => n.status === "pending");

  const markOneMut = useMutation({
    mutationFn: (id: string) => markOne({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  const markAllMut = useMutation({
    mutationFn: () => markAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-primary-dark hover:text-damascus-gold transition-colors p-1"
        aria-label="Notifications"
      >
        <span
          className="material-symbols-outlined text-[26px]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          notifications
        </span>
        {unread.length > 0 ? (
          <span className="absolute -top-1 -right-1 bg-deep-garnet text-[9px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[340px] max-w-[90vw] bg-white border border-horizon-mist rounded-lg shadow-lg z-50 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-horizon-mist flex items-center justify-between">
            <p className="font-headline text-sm text-primary-dark">Notifications</p>
            {unread.length > 0 ? (
              <button
                onClick={() => markAllMut.mutate()}
                className="font-body text-[10px] uppercase tracking-[0.15em] text-damascus-gold hover:text-primary-dark font-bold"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {inApp.length === 0 ? (
              <p className="font-body text-sm text-ash-slate italic px-5 py-8 text-center">
                You're all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-horizon-mist/60">
                {inApp.slice(0, 15).map((n) => {
                  const isUnread = n.status === "pending";
                  return (
                    <li
                      key={n.id}
                      className={`px-5 py-3 flex flex-col gap-1 ${isUnread ? "bg-warm-silk-grey/30" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-body text-sm text-primary-dark leading-snug">
                          {labelFor(n.template_key)}
                        </p>
                        {isUnread ? (
                          <button
                            onClick={() => markOneMut.mutate(n.id)}
                            className="font-body text-[9px] uppercase tracking-[0.15em] text-damascus-gold hover:text-primary-dark font-bold shrink-0 mt-1"
                          >
                            Mark
                          </button>
                        ) : null}
                      </div>
                      <p className="font-body text-[10px] uppercase tracking-wider text-ash-slate">
                        {relativeTime(n.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
