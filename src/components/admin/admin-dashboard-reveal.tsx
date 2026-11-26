import type { ComponentProps } from "react";
import { PageReveal } from "@/components/ui/page-reveal";

type AdminDashboardRevealProps = ComponentProps<typeof PageReveal>;

/** Admin scroll reveal — same IO pattern as storefront, admin CSS keyframes. */
export function AdminDashboardReveal({
  delayMs = 90,
  prepClassName = "admin-dashboard-reveal-prep",
  enterClassName = "admin-dashboard-reveal-enter",
  ...props
}: AdminDashboardRevealProps) {
  return (
    <PageReveal
      delayMs={delayMs}
      prepClassName={prepClassName}
      enterClassName={enterClassName}
      {...props}
    />
  );
}
