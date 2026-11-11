"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getDashboardMonthPeriodMeta,
  type DashboardMonthPeriod,
} from "@/lib/admin-analytics-shared";
import {
  segmentedItemClassName,
  segmentedTrackClassName,
} from "@/components/ui/form-segmented-control";
import { cn } from "@/lib/utils";

const PERIODS: DashboardMonthPeriod[] = ["previous", "current"];

type AdminActivityPeriodTabsProps = {
  period: DashboardMonthPeriod;
};

function buildPeriodHref(
  next: DashboardMonthPeriod,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (next === "current") params.delete("period");
  else params.set("period", next);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

/** Lives in chart card header — white track, no outer shadow. */
export function AdminActivityPeriodTabs({ period }: AdminActivityPeriodTabsProps) {
  const searchParams = useSearchParams();

  return (
    <div className={segmentedTrackClassName("card")}>
      {PERIODS.map((value) => {
        const active = period === value;
        const className = cn(segmentedItemClassName(active));
        const label = getDashboardMonthPeriodMeta(value).short;
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
