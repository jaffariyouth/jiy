import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

/**
 * Editorial toggle row used in Onboarding Step 3.
 * Left side: eyebrow label + description.
 * Right side: 40×20 track, 16px thumb, sapphire when on, horizon-mist when off.
 */
export function ToggleSwitch({ id, label, description, checked, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4 border-b border-horizon-mist group",
        className,
      )}
    >
      <div className="flex flex-col gap-1 pr-4">
        <span className="font-label-eyebrow text-caption text-midnight-sapphire uppercase tracking-widest">
          {label}
        </span>
        {description && (
          <span className="font-body-sm text-[13px] text-ash-slate">{description}</span>
        )}
      </div>
      <label
        htmlFor={id}
        className="relative inline-flex items-center w-10 h-5 flex-shrink-0 cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-horizon-mist peer-checked:bg-midnight-sapphire transition-colors duration-300"
        />
        <span
          aria-hidden
          className="absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-5"
        />
      </label>
    </div>
  );
}
