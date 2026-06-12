import { cn } from "@/lib/utils";

type Props = {
  name: string;
  fill?: boolean;
  className?: string;
  "aria-hidden"?: boolean;
};

export function MaterialIcon({ name, fill, className, ...rest }: Props) {
  return (
    <span
      className={cn("material-symbols-outlined", fill && "material-symbols-fill", className)}
      aria-hidden={rest["aria-hidden"] ?? true}
    >
      {name}
    </span>
  );
}
