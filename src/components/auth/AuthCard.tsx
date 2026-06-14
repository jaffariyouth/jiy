import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Optional bottom slice with alabaster background (screens 1 & 2). */
  footerSlice?: ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
};

export function AuthCard({
  children,
  footerSlice,
  className,
  contentClassName,
  maxWidth = "max-w-[480px]",
}: Props) {
  return (
    <div
      className={cn(
        "w-full bg-surface-container-lowest rounded-card border border-horizon-mist overflow-hidden flex flex-col",
        maxWidth,
        className,
      )}
    >
      <div className={cn("p-5 sm:p-7 md:p-9 flex flex-col", contentClassName)}>{children}</div>
      {footerSlice && (
        <div className="bg-alabaster-parchment p-4 sm:p-6 border-t border-horizon-mist flex justify-center items-center text-center">
          {footerSlice}
        </div>
      )}
    </div>
  );
}
