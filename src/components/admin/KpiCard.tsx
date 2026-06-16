import { Link } from "@tanstack/react-router";

export function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-[#e5dec9] rounded-sm p-5 hover:border-[#caa460] transition-colors">
      <div className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">{label}</div>
      <div className="font-serif text-4xl text-[#010b21] mt-2">{value}</div>
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}
