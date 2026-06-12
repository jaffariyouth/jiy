import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  eyebrowColor?: "sapphire" | "garnet";
  containerClassName?: string;
};

export const FormInput = forwardRef<HTMLInputElement, Props>(function FormInput(
  { label, eyebrowColor = "sapphire", containerClassName, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "font-label-eyebrow text-[12px] uppercase tracking-widest",
          eyebrowColor === "garnet"
            ? "text-deep-garnet tracking-[0.06em]"
            : "text-midnight-sapphire",
        )}
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        {...rest}
        className={cn(
          "w-full bg-surface-container-lowest border border-horizon-mist rounded-component px-4 py-3 font-body text-body text-on-surface placeholder:text-muted-dusk focus:outline-none focus:border-midnight-sapphire focus:ring-1 focus:ring-midnight-sapphire transition-colors shadow-none",
          className,
        )}
      />
    </div>
  );
});
