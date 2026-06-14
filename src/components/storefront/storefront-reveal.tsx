import type { ComponentProps } from "react";
import { PageReveal } from "@/components/ui/page-reveal";

type StorefrontRevealProps = ComponentProps<typeof PageReveal>;

export function StorefrontReveal({
  delayMs = 90,
  ...props
}: StorefrontRevealProps) {
  return <PageReveal delayMs={delayMs} {...props} />;
}
