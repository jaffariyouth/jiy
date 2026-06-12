import { Link } from "@tanstack/react-router";
import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

export type HeaderVariant =
  | { kind: "home"; }                                  // Screen 1: "Return to Homepage"
  | { kind: "back-to-login" }                          // Screen 2
  | { kind: "wizard"; current: number; total: number }; // Screens 3-5

type Props = {
  variant: HeaderVariant;
  /** Whether to render a bottom border (used on wizard / register headers). */
  bordered?: boolean;
  /** Position style. `fixed` for screen 1, `static` for the rest. */
  position?: "fixed" | "static";
};

export function TransactionalHeader({ variant, bordered = false, position = "static" }: Props) {
  return (
    <header
      className={cn(
        "h-nav-height w-full bg-transparent z-50",
        bordered && "border-b border-horizon-mist",
        position === "fixed" ? "fixed top-0 left-0" : "flex-none",
      )}
    >
      <div className="h-full px-margin-safe max-w-max-width mx-auto flex justify-between items-center gap-3 min-w-0">
        <Link
          to="/"
          className="font-display text-subheading font-bold text-midnight-sapphire tracking-tight shrink-0"
        >
          JIY
        </Link>

        {variant.kind === "home" && (
          <Link
            to="/"
            className="text-midnight-sapphire font-body text-body-sm hover:text-deep-garnet transition-colors duration-200 flex items-center gap-2 group min-w-0"
          >
            <MaterialIcon
              name="arrow_back"
              className="text-[16px] group-hover:-translate-x-1 transition-transform duration-200 shrink-0"
            />
            <span className="hidden sm:inline truncate">Return to Homepage</span>
          </Link>
        )}

        {variant.kind === "back-to-login" && (
          <Link
            to="/auth"
            className="font-body text-body-sm sm:text-body text-midnight-sapphire hover:opacity-80 transition-opacity flex items-center gap-2 group min-w-0"
          >
            <MaterialIcon
              name="arrow_back"
              className="text-[20px] transition-transform group-hover:-translate-x-1 shrink-0"
            />
            <span className="hidden sm:inline truncate">Back to Login</span>
          </Link>
        )}

        {variant.kind === "wizard" && (
          <div className="font-label-eyebrow text-[11px] sm:text-label-eyebrow uppercase text-deep-garnet shrink-0">
            STEP {variant.current} OF {variant.total}
          </div>
        )}
      </div>
    </header>
  );
}
