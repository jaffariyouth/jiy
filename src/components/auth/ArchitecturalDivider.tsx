import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children?: ReactNode;
  className?: string;
  /** Background color of the centered chip — must match parent surface to mask the line. */
  chipBgClassName?: string;
};

/**
 * 1px Horizon Mist rule, interrupted at center by a Damascus-gold glyph slot.
 * Default glyph is a small Mihrab-style star. Pass `children` to swap it.
 */
export function ArchitecturalDivider({ children, className, chipBgClassName = "bg-warm-silk-grey" }: Props) {
  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      <div className="h-px bg-horizon-mist flex-grow" />
      <div className={cn("mx-4 text-damascus-gold flex items-center justify-center px-2", chipBgClassName)}>
        {children ?? (
          <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" />
          </svg>
        )}
      </div>
      <div className="h-px bg-horizon-mist flex-grow" />
    </div>
  );
}
