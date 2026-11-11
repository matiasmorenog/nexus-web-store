import { adminCardShadowClass } from "@/components/admin/admin-surface";
import type { ActivityPeriod } from "@/lib/admin-analytics-shared";
import { cn } from "@/lib/utils";

type AdminAnalyticsExportButtonProps = {
  period: ActivityPeriod;
};

export function AdminAnalyticsExportButton({
  period,
}: AdminAnalyticsExportButtonProps) {
  const href = `/api/admin/exports/analytics?period=${encodeURIComponent(period)}`;

  return (
    <a
      href={href}
      download
      className={cn(
        "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50",
        adminCardShadowClass,
      )}
    >
      Exportar CSV
    </a>
  );
}
