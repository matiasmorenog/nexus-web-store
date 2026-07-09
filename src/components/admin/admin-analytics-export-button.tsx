import type { ActivityPeriod } from "@/lib/admin-analytics-shared";

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
      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
    >
      Exportar CSV
    </a>
  );
}
