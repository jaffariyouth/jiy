import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, CalendarClock } from "lucide-react";
import { listActiveRecurringEvents } from "@/lib/jiy/recurring-events.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/ongoing-events")({
  head: () => ({ meta: [{ title: "Ongoing Events — JIY Members" }] }),
  component: OngoingEventsPage,
});

function OngoingEventsPage() {
  const fetchFn = useServerFn(listActiveRecurringEvents);
  const { data, isLoading } = useQuery({
    queryKey: ["recurring-events", "active"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  const slides = data?.recurring ?? [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  const current = slides[index];

  return (
    <MemberPageShell>
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-14 pb-8">
        <p className="font-body text-[10px] uppercase tracking-[0.32em] text-deep-garnet font-bold">
          MEMBER ACCESS · RECURRING GATHERINGS
        </p>
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-persian-indigo mt-4">
          Ongoing Events
        </h1>
        <p className="mt-4 max-w-2xl font-body text-sm text-ash-slate leading-relaxed">
          Standing gatherings that anchor the JIY rhythm — show up any week, no RSVP required.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20">
        {isLoading ? (
          <p className="font-body text-sm text-ash-slate italic">Loading the schedule…</p>
        ) : slides.length === 0 ? (
          <div className="bg-white border border-horizon-mist rounded-xl p-16 text-center">
            <p className="font-headline text-2xl text-persian-indigo">No ongoing events yet</p>
            <p className="mt-3 font-body text-sm text-ash-slate">
              Check back soon — recurring gatherings will be listed here.
            </p>
          </div>
        ) : (
          <div
            className="studio-card rounded-xl overflow-hidden relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="h-[3px] bg-damascus-gold" />
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[4/5] lg:aspect-auto bg-warm-silk-grey border-b lg:border-b-0 lg:border-r border-horizon-mist overflow-hidden">
                {current?.cover_image_url ? (
                  <img
                    key={current.id}
                    src={current.cover_image_url}
                    alt={current.title}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-headline text-6xl text-persian-indigo/20">
                    JIY
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 border border-horizon-mist px-3 py-1.5 rounded-md font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
                  Slide {index + 1} / {slides.length}
                </div>
              </div>

              <div className="p-8 lg:p-12 flex flex-col">
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold">
                  Recurring
                </p>
                <h2 className="font-headline text-3xl lg:text-4xl text-primary-dark leading-tight mt-3">
                  {current?.title}
                </h2>

                <div className="mt-6 space-y-3 font-body text-sm text-ash-slate">
                  {current?.cadence_label ? (
                    <div className="flex items-start gap-2">
                      <CalendarClock className="h-4 w-4 mt-0.5 shrink-0 text-deep-garnet" strokeWidth={1.75} />
                      <span>{current.cadence_label}</span>
                    </div>
                  ) : null}
                  {current?.location ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-deep-garnet" strokeWidth={1.75} />
                      <span>{current.location}</span>
                    </div>
                  ) : null}
                </div>

                {current?.description_md ? (
                  <p className="mt-6 font-body text-[15px] leading-relaxed text-primary-dark/80 whitespace-pre-line">
                    {current.description_md}
                  </p>
                ) : null}

                <div className="mt-auto pt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          i === index ? "w-8 bg-damascus-gold" : "w-2 bg-horizon-mist hover:bg-ash-slate"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                      className="h-10 w-10 inline-flex items-center justify-center border border-horizon-mist rounded-full text-primary-dark hover:border-damascus-gold hover:text-damascus-gold transition-colors"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndex((i) => (i + 1) % slides.length)}
                      className="h-10 w-10 inline-flex items-center justify-center border border-horizon-mist rounded-full text-primary-dark hover:border-damascus-gold hover:text-damascus-gold transition-colors"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </MemberPageShell>
  );
}
