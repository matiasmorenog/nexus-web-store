"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ACTIVITY_PERIOD_LABELS,
  type ActivityPeriod,
} from "@/lib/admin-analytics-shared";
import {
  segmentedItemClassName,
  segmentedTrackClassName,
  type SegmentedSurface,
} from "@/components/ui/form-segmented-control";
import { cn } from "@/lib/utils";

const PERIODS: ActivityPeriod[] = ["week", "month", "year"];

type AdminAnalyticsPeriodTabsProps = {
  period: ActivityPeriod;
  /** `page` on grey canvas; `card` inside chart/card headers. */
  surface?: SegmentedSurface;
};

function buildPeriodHref(
  next: ActivityPeriod,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (next === "week") params.delete("period");
  else params.set("period", next);
  const qs = params.toString();
  return qs ? `/admin/modulos/reportes?${qs}` : "/admin/modulos/reportes";
}

export function AdminAnalyticsPeriodTabs({
  period,
  surface = "card",
}: AdminAnalyticsPeriodTabsProps) {
  const searchParams = useSearchParams();

  return (
    <div className={segmentedTrackClassName(surface)}>
      {PERIODS.map((value) => {
        const active = period === value;
        const className = cn(segmentedItemClassName(active));
        const label = ACTIVITY_PERIOD_LABELS[value].short;
        if (active) {
          return (
            <span
              key={value}
              aria-current="page"
              className={className}
            >
              {label}
            </span>
          );
        }
        return (
          <Link
            key={value}
            href={buildPeriodHref(value, searchParams)}
            scroll={false}
            className={className}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
