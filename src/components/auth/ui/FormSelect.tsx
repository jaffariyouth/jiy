import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  eyebrowColor?: "sapphire" | "garnet";
  containerClassName?: string;
  placeholder?: string;
};

export const FormSelect = forwardRef<HTMLSelectElement, Props>(function FormSelect(
  {
    label,
    options,
    eyebrowColor = "sapphire",
    containerClassName,
    className,
    id,
    placeholder,
    ...rest
  },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <label
        htmlFor={selectId}
        className={cn(
          "font-label-eyebrow text-[12px] uppercase tracking-widest",
          eyebrowColor === "garnet"
            ? "text-deep-garnet tracking-[0.06em]"
            : "text-midnight-sapphire",
        )}
      >
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        {...rest}
        className={cn(
          "w-full bg-surface-container-lowest border border-horizon-mist rounded-component px-4 py-3 font-body text-body text-on-surface focus:outline-none focus:border-midnight-sapphire focus:ring-1 focus:ring-midnight-sapphire transition-colors appearance-none shadow-none",
          className,
        )}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
});
