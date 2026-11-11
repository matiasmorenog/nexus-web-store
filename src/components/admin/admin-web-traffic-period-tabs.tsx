"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  WEB_TRAFFIC_PERIOD_LABELS,
  WEB_TRAFFIC_PERIODS,
  type WebTrafficPeriod,
} from "@/lib/web-analytics/period";
import {
  segmentedItemClassName,
  segmentedTrackClassName,
} from "@/components/ui/form-segmented-control";
import { cn } from "@/lib/utils";

type AdminWebTrafficPeriodTabsProps = {
  period: WebTrafficPeriod;
};

function buildPeriodHref(
  next: WebTrafficPeriod,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (next === "7d") params.delete("period");
  else params.set("period", next);
  const qs = params.toString();
  return qs ? `/admin/modulos/trafico?${qs}` : "/admin/modulos/trafico";
}

/** Page header (no card) — white track + outer shadow. */
export function AdminWebTrafficPeriodTabs({
  period,
}: AdminWebTrafficPeriodTabsProps) {
  const searchParams = useSearchParams();

  return (
    <div className={segmentedTrackClassName("page")}>
      {WEB_TRAFFIC_PERIODS.map((value) => {
        const active = period === value;
        const className = cn(segmentedItemClassName(active));
        const label = WEB_TRAFFIC_PERIOD_LABELS[value].short;
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
