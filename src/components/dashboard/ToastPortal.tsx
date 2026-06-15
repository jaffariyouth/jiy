import { useDashboard } from "./DashboardContext";

export function ToastPortal() {
  const { toasts } = useDashboard();
  return (
    <div
      id="toast-portal"
      className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 border bg-white shadow-xl rounded-lg flex items-center gap-3 w-80 transition-all duration-300 ${
            t.success ? "border-damascus-gold text-primary-dark" : "border-red-800 text-red-950"
          }`}
        >
          <span
            className={`material-symbols-outlined text-sm ${t.success ? "text-damascus-gold" : "text-red-800"}`}
            style={{ fontVariationSettings: "'wght' 400" }}
          >
            {t.success ? "verified" : "error"}
          </span>
          <span className="font-body text-xs font-semibold leading-normal grow">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
