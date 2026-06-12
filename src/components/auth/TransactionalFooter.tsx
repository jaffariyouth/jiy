import { ArchitecturalDivider } from "./ArchitecturalDivider";
import { MaterialIcon } from "./MaterialIcon";

export type FooterVariant = "full" | "minimal" | "wizard";

type Props = { variant?: FooterVariant };

export function TransactionalFooter({ variant = "minimal" }: Props) {
  if (variant === "wizard") {
    return (
      <footer className="w-full py-gap-section flex flex-col items-center justify-center flex-shrink-0 px-margin-safe">
        <ArchitecturalDivider>
          <MaterialIcon name="trip_origin" fill className="text-[24px]" />
        </ArchitecturalDivider>
      </footer>
    );
  }

  if (variant === "full") {
    return (
      <footer className="w-full pt-gap-section pb-base flex flex-col items-center gap-gap-element px-margin-safe max-w-max-width mx-auto mt-auto">
        <div className="w-full flex items-center justify-center max-w-[400px] mb-4">
          <ArchitecturalDivider chipBgClassName="bg-warm-silk-grey" />
        </div>
        <p className="font-body text-body-sm text-secondary">
          © 2024 JIY Publishing House. All rights reserved.
        </p>
        <div className="flex gap-6 mt-2">
          <a className="font-body text-body-sm text-secondary hover:text-deep-garnet transition-colors duration-200" href="#">Archives</a>
          <a className="font-body text-body-sm text-secondary hover:text-deep-garnet transition-colors duration-200" href="#">Submission Guidelines</a>
          <a className="font-body text-body-sm text-secondary hover:text-deep-garnet transition-colors duration-200" href="#">Membership</a>
          <a className="font-body text-body-sm text-secondary hover:text-deep-garnet transition-colors duration-200" href="#">Privacy Policy</a>
        </div>
      </footer>
    );
  }

  // minimal
  return (
    <footer className="w-full pt-gap-section pb-base flex flex-col items-center px-margin-safe max-w-max-width mx-auto flex-none">
      <div className="w-full flex items-center justify-center mb-gap-element">
        <ArchitecturalDivider chipBgClassName="bg-warm-silk-grey">
          <MaterialIcon name="star_half" fill className="text-[16px]" />
        </ArchitecturalDivider>
      </div>
      <p className="font-body text-caption text-ash-slate">
        © 2024 JIY Publishing House. All rights reserved.
      </p>
    </footer>
  );
}
