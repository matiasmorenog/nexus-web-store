"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ACTIVITY_PERIOD_LABELS,
  type ActivityPeriod,
} from "@/lib/admin-analytics-shared";
import { cn } from "@/lib/utils";

const PERIODS: ActivityPeriod[] = ["week", "month", "year"];

type AdminAnalyticsPeriodTabsProps = {
  period: ActivityPeriod;
};

function buildPeriodHref(
  next: ActivityPeriod,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (next === "week") params.delete("period");
  else params.set("period", next);
  const qs = params.toString();
  return qs ? `/admin/modulos/analytics?${qs}` : "/admin/modulos/analytics";
}

export function AdminAnalyticsPeriodTabs({ period }: AdminAnalyticsPeriodTabsProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
      {PERIODS.map((value) => (
        <Link
          key={value}
          href={buildPeriodHref(value, searchParams)}
          scroll={false}
          aria-current={period === value ? "page" : undefined}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
            period === value
              ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
          )}
        >
          {ACTIVITY_PERIOD_LABELS[value].short}
        </Link>
      ))}
    </div>
  );
}
