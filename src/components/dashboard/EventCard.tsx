import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useDashboard } from "./DashboardContext";

type Props = {
  id?: string;
  image: string;
  alt: string;
  day: string;
  month: string;
  eyebrow: string;
  title: string;
  description: string;
};

export function EventCard({ id, image, alt, day, month, eyebrow, title, description }: Props) {
  const { dispatchToast } = useDashboard();

  const inner = (
    <>
      <div className="relative overflow-hidden aspect-[4/5] bg-warm-silk-grey border-b border-horizon-mist">
        <img
          src={image}
          alt={alt}
          className="w-full h-full object-cover transition-all duration-700 ease-out scale-100 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-white border border-horizon-mist px-3 py-1.5 text-center rounded-md shadow-xs">
          <p className="font-headline text-sm font-bold text-primary-dark leading-none">{day}</p>
          <p className="font-body text-[9px] uppercase tracking-wider text-ash-slate font-bold mt-0.5">
            {month}
          </p>
        </div>
      </div>
      <div className="p-6 flex flex-col grow">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold mb-2">
          {eyebrow}
        </span>
        <h3 className="font-headline text-xl text-primary-dark leading-snug mb-3 group-hover:text-damascus-gold transition-colors duration-200">
          {title}
        </h3>
        <p className="font-body text-xs text-ash-slate leading-relaxed grow mb-5 line-clamp-3">
          {description}
        </p>
        <div className="pt-4 border-t border-horizon-mist/60 flex justify-between items-center">
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold group-hover:text-primary-dark font-black transition-colors duration-200">
            View Details →
          </span>
          <span
            className="material-symbols-outlined text-horizon-mist group-hover:translate-x-1 transition-transform"
            style={{ fontVariationSettings: "'wght' 300" }}
          >
            arrow_right_alt
          </span>
        </div>
      </div>
    </>
  );

  const className = "studio-card rounded-xl flex flex-col h-full overflow-hidden group cursor-pointer text-left";

  if (id) {
    return (
      <Link
        to="/dashboard/events/$eventId"
        params={{ eventId: id }}
        className={className}
        aria-label={`View details for ${title}`}
      >
        {inner as ReactNode}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => dispatchToast(`RSVP verified: "${title}" secured.`)}
      className={className}
    >
      {inner}
    </button>
  );
}
