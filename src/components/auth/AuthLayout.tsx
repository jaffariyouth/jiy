import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TransactionalHeader, type HeaderVariant } from "./TransactionalHeader";
import { TransactionalFooter, type FooterVariant } from "./TransactionalFooter";

type Props = {
  children: ReactNode;
  headerVariant: HeaderVariant;
  footerVariant?: FooterVariant;
  headerBordered?: boolean;
  headerPosition?: "fixed" | "static";
  /** Add top padding to main when header is fixed. */
  mainClassName?: string;
};

export function AuthLayout({
  children,
  headerVariant,
  footerVariant = "minimal",
  headerBordered = false,
  headerPosition = "static",
  mainClassName,
}: Props) {
  return (
    <div className="bg-warm-silk-grey min-h-screen flex flex-col font-body text-body text-on-surface antialiased selection:bg-damascus-gold/20 selection:text-midnight-sapphire">
      <TransactionalHeader
        variant={headerVariant}
        bordered={headerBordered}
        position={headerPosition}
      />
      <main
        className={cn(
          "flex-grow flex items-center justify-center px-margin-safe w-full max-w-max-width mx-auto min-w-0",
          headerPosition === "fixed"
            ? "pt-[calc(var(--spacing-nav-height)+var(--spacing-gap-element))] pb-gap-section"
            : "py-gap-section",
          mainClassName,
        )}
      >
        {children}
      </main>
      <TransactionalFooter variant={footerVariant} />
    </div>
  );
}
