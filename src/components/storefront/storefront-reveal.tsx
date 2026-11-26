import type { ComponentProps } from "react";
import { PageReveal } from "@/components/ui/page-reveal";

type StorefrontRevealProps = ComponentProps<typeof PageReveal>;

/** Storefront scroll reveal — soft cascade, storefront CSS keyframes. */
export function StorefrontReveal({
  delayMs = 75,
  prepClassName = "storefront-reveal-prep",
  enterClassName = "storefront-reveal-enter",
  ...props
}: StorefrontRevealProps) {
  return (
    <PageReveal
      delayMs={delayMs}
      prepClassName={prepClassName}
      enterClassName={enterClassName}
      {...props}
    />
  );
}
