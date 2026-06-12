import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
  trailingIcon?: ReactNode;
  leadingIcon?: ReactNode;
};

export const PrimaryButton = forwardRef<HTMLButtonElement, Props>(function PrimaryButton(
  { variant = "solid", trailingIcon, leadingIcon, className, children, ...rest },
  ref,
) {
  const base =
    "w-full rounded-component py-4 px-6 font-body text-body transition-colors duration-200 flex items-center justify-center gap-3 active:scale-[0.99]";
  const styles =
    variant === "solid"
      ? "bg-midnight-sapphire text-alabaster-parchment hover:bg-persian-indigo"
      : "bg-surface-container-lowest text-midnight-sapphire border border-midnight-sapphire hover:bg-surface-bright";

  return (
    <button ref={ref} {...rest} className={cn(base, styles, className)}>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
});
