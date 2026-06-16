import { Link } from "@tanstack/react-router";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  backTo,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backTo?: { to: string; label: string };
}) {
  return (
    <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#e5dec9] bg-white">
      {backTo && (
        <Link to={backTo.to} className="text-xs uppercase tracking-[0.18em] text-[#6b6453] hover:text-[#010b21] mb-3 inline-block">
          ← {backTo.label}
        </Link>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#010b21] tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-[#6b6453] mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0 flex flex-wrap gap-2 justify-end">{actions}</div>}
      </div>
    </header>
  );
}
