import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Search, Palette } from "lucide-react";

export type CatalogEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  cover_image_url: string | null;
  category_label?: string | null;
  audience_min_age?: number | null;
  audience_max_age?: number | null;
  is_member_only?: boolean | null;
};

type AgeFilter = "all" | "youth" | "young_pro";

const PAGE_SIZE = 6;

function ageBucket(e: CatalogEvent): AgeFilter[] {
  const buckets: AgeFilter[] = ["all"];
  const min = e.audience_min_age ?? null;
  const max = e.audience_max_age ?? null;
  // Youth (14-18): overlaps with [14, 18]
  if ((min ?? 0) <= 18 && (max ?? 99) >= 14) buckets.push("youth");
  // Young Professionals (18+): overlaps with [18, ∞)
  if ((max ?? 99) >= 18) buckets.push("young_pro");
  return buckets;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function EventsCatalog({
  events,
  detailBase,
  eyebrow = "JAFFARI ISLAMIC YOUTH",
  title = "Community Gatherings",
  subtitle = "Discover upcoming lectures, social events, and workshops. Our events are designed to foster intellectual growth and spiritual connection within a modern community setting.",
}: {
  events: CatalogEvent[];
  /** Router path for the detail page — e.g. "/events" or "/dashboard/events" */
  detailBase: "/events" | "/dashboard/events";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  const [age, setAge] = useState<AgeFilter>("all");
  const [category, setCategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.category_label && e.category_label.trim()) set.add(e.category_label.trim());
    });
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (age !== "all" && !ageBucket(e).includes(age)) return false;
      if (category !== "all" && (e.category_label ?? "") !== category) return false;
      if (q) {
        const hay = `${e.title} ${e.description ?? ""} ${e.location ?? ""} ${e.category_label ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, age, category, query]);

  const shown = filtered.slice(0, visible);

  const ageChips: { key: AgeFilter; label: string }[] = [
    { key: "all", label: "All Events" },
    { key: "youth", label: "Youth (14-18)" },
    { key: "young_pro", label: "Young Professionals (18+)" },
  ];

  return (
    <>
      {/* Header */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-10">
        <p className="font-body text-[11px] uppercase tracking-[0.32em] text-deep-garnet font-bold">
          {eyebrow}
        </p>
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-primary-dark mt-4">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] text-ash-slate leading-relaxed">{subtitle}</p>
      </section>

      {/* Filters */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="border-t border-horizon-mist pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Age tabs */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-body text-[13px]">
            {ageChips.map((c) => {
              const active = age === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    setAge(c.key);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`relative pb-2 uppercase tracking-[0.14em] font-semibold transition-colors ${
                    active
                      ? "text-primary-dark"
                      : "text-ash-slate hover:text-primary-dark"
                  }`}
                >
                  {c.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-damascus-gold" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash-slate" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-horizon-mist bg-white font-body text-sm text-primary-dark placeholder:text-ash-slate focus:outline-none focus:border-damascus-gold transition-colors"
            />
          </div>
        </div>

        {/* Category row */}
        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setCategory("all");
                setVisible(PAGE_SIZE);
              }}
              className={`px-3 py-1 rounded-full font-body text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors border ${
                category === "all"
                  ? "border-primary-dark bg-primary-dark text-white"
                  : "border-horizon-mist bg-white text-ash-slate hover:border-damascus-gold hover:text-primary-dark"
              }`}
            >
              All Types
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setVisible(PAGE_SIZE);
                }}
                className={`px-3 py-1 rounded-full font-body text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors border ${
                  category === c
                    ? "border-primary-dark bg-primary-dark text-white"
                    : "border-horizon-mist bg-white text-ash-slate hover:border-damascus-gold hover:text-primary-dark"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        {shown.length === 0 ? (
          <div className="studio-card rounded-xl p-16 text-center">
            <p className="font-headline text-xl text-primary-dark">No events match your filters</p>
            <p className="mt-2 text-sm text-ash-slate">Try clearing filters or searching for something else.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {shown.map((e) => (
              <li key={e.id}>
                <Link
                  to={`${detailBase}/$eventId`}
                  params={{ eventId: e.id }}
                  className="studio-card rounded-xl overflow-hidden flex flex-col h-full group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-warm-silk-grey border-b border-horizon-mist">
                    {e.cover_image_url ? (
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ash-slate/50">
                        <Palette className="h-10 w-10" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col grow">
                    {e.category_label && (
                      <span className="font-body text-[10px] uppercase tracking-[0.22em] text-deep-garnet font-bold mb-2">
                        {e.category_label}
                      </span>
                    )}
                    <h3 className="font-headline text-xl leading-snug text-primary-dark group-hover:text-damascus-gold transition-colors">
                      {e.title}
                    </h3>
                    {e.description && (
                      <p className="mt-3 font-body text-sm text-ash-slate leading-relaxed line-clamp-3">
                        {e.description}
                      </p>
                    )}

                    <div className="mt-6 pt-5 border-t border-horizon-mist/70 flex items-end justify-between gap-4">
                      <div className="flex flex-col gap-1.5 font-body text-xs text-ash-slate min-w-0">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                          {fmtDate(e.starts_at)}
                        </span>
                        {e.location && (
                          <span className="inline-flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                            <span className="truncate">{e.location}</span>
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 inline-flex items-center px-4 py-2 rounded-md bg-primary-dark text-white font-body text-[10px] tracking-[0.18em] uppercase font-bold group-hover:bg-damascus-gold group-hover:text-primary-dark transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {filtered.length > visible && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="interactive-btn border border-horizon-mist hover:border-damascus-gold bg-white text-primary-dark font-body text-[11px] font-bold tracking-[0.22em] py-3 px-8 uppercase rounded-full transition-all"
            >
              Load More Events
            </button>
          </div>
        )}
      </section>
    </>
  );
}
